<div hidden data-agent-magazine="v1" data-magazine-kind="engineering"></div>

<header class="mg-cover" style="grid-template-columns:minmax(0,1fr)"><div class="mg-cover-copy">
<p class="mg-kicker">智能体工程 · 11e</p>
<p class="mg-question">PDF提取出了字，表格关系就保住了吗？</p>
<p class="mg-outcome">读完能做的判断：检查真实解析失败、表头关系与升级记录，而非只看输出存在。</p>
<nav class="mg-actions" aria-label="本页阅读入口"><a class="mg-primary" href="#_3">从这个问题的原解释开始</a><a href="#mg-agent-engineering-11e-reading-start">直接进入完整解释</a></nav>
</div></header>
<span id="mg-agent-engineering-11e-reading-start" tabindex="-1"></span>

# PDF 与表格解析实验

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

> 一句话带走：文字能提取，只说明入口有字；型号、单位、条件和阅读顺序仍须逐项核对。

## 先选一个可完成的停止点

本章用原创虚构的 XR-200 / XR-300 维修资料做实验，不代表真实设备参数。先运行单栏文本 PDF 与 Markdown 表格测试，看懂拒绝原因即可停下；有精力再检查版本迁移和原始结果。OCR 与跨页复杂表格留在第二阶段。

以下是按原示例目录结构编写的命令；在示例目录内执行时可省略 `examples/knowledge-assistant/` 前缀：

```powershell
python -m pip install -r examples/knowledge-assistant/requirements-pdf.txt
python -m unittest discover -s examples/knowledge-assistant -p test_pdf.py -v
python -m unittest discover -s examples/knowledge-assistant -p test_core.py -v
```

如果系统 Python 缺依赖，先建立自己的虚拟环境；不要向正在被其他实验使用的环境并发安装。

## 有字也会错：一个真实失败

修改前，单栏 PDF 提取出了 `Rated power: 2.4 kW`，但句子切分把小数点当句号，形成 `2.` 与 `4 kW`。这不是 OCR 错字，却已经破坏数值与单位的连续证据。解析版本 3 保留这段小数；测试检查 `2.4 kW` 和例外条件 `eco mode`，不只检查非空字符串。

另一类陷阱是双栏：左右两个型号按绘制顺序交错。PDF 表格也只是定位文字，不能把一串数字当成已经恢复的行列。本实验按文本横向起点分散超过 80 PDF 单位，以及页内图片的条件保守拒绝，返回 `pdf_layout_requires_review`。这只是当前夹具的风险闸门，有误拒绝和漏检可能；字体、坐标变换、页眉、多段缩进、合并单元格都需要人工复核，不能称通用版面恢复。

## 2026-10-10 实跑记录

环境为 Windows 11、Python 3.12.14、pypdf 6.10.0；PDF 使用 reportlab 4.4.9 与 Pillow 12.3.0 原创生成。六份 PDF 共七页已渲染核看：单栏接受并保留页码；双栏与 PDF 表格拒绝；加密文件拒绝；纯扫描与文本加扫描的混合文件整份拒绝。扫描页有图片没有文本层，不尝试 OCR。渲染器报告 Symbol / ArialUnicode 缺省字体告警，但本组 ASCII 夹具页面没有可见缺字或重叠。

新增测试 5 项通过，原有 core 测试 31 项通过。修改前失败（`examples/knowledge-assistant/validation/pdf-red.txt`）、PDF 测试（`examples/knowledge-assistant/validation/pdf-green.txt`）和核心测试（`examples/knowledge-assistant/validation/pdf-core.txt`）保留原始输出；PDF 解析记录（`examples/knowledge-assistant/validation/pdf-results.json`）保存版本、硬件字段、文件哈希、正文和拒绝原因，表格检索记录（`examples/knowledge-assistant/validation/table-results.json`）保存实际候选与上下文。上述记录和原始夹具属于历史实验材料；复现时需自行准备对应材料并重新验证。

## 表格要保住什么

Markdown 表格仍整体保留，连同紧邻的说明行一起入块。XR-200 额定功率为 2.4 kW，XR-300 为 3.6 kW；节能值只有在 eco mode 启用时适用。重复表头仍单独保留，超过 8000 字符的表格明确返回 `table_requires_row_chunking`，没有偷偷截断。

检索测试在 `chunk_chars=80`、BM25、`k=3` 下检查上下文仍含两种型号、表头、单位与条件。排名第一可能是重复表头的小表；因此不能只看第一块就宣布全部条件齐全。这里验证证据保存，不验证模型能否正确选择型号。没有实跑生成模型，不提供答案正确率。想继续时，可拿同一问题检查最终答案是否只用目标行、是否保留单位与例外条件。

## 升级与失败不能隐身

解析规则从版本 2 升到 3 后，入库 fingerprint 会变化。同一 revision 重跑应报 `revision_conflict`，管理员必须显式提高 revision。旧版本在失败更新时保持可见；成功更新后旧 chunk 引用失效。当前 SQLite 只保留活动块，旧正文并未自动归档：要追溯旧证据，需保留原文件、manifest、版本与运行记录，不能声称数据库已有历史版本库。

混合页失败不会发布半份文档，失败 job 留下原因。文档撤权或删除后，检索与引用仍由现有 ACL / revision 约束保护。

## 走神救援

遇到 `needs_ocr_or_page_review`，先逐页看 PDF：可能只有图片，也可能正文太短。遇到 `pdf_layout_requires_review`，对照渲染页检查列、表头和单位；有原创 Markdown 来源时优先使用来源，不要直接拼出 PDF 表格。遇到超长表，先按人工确认的表区拆成独立表，每段补表头、单位和条件，再重新验收。遇到 revision 冲突，提高管理员版本后再入库，不要改数据库绕过检查。

## 折叠自检

<details><summary>检查点 1. 单栏通过是否证明阅读顺序正确？</summary>不证明；只验收本组单栏夹具，仍要对照渲染页。</details>

<details><summary>检查点 2. 为什么小数点也是解析风险？</summary>错误句切分会打断数值与单位，本实验已发现并修复。</details>

<details><summary>检查点 3. 混合 PDF 的文本页能否先发布？</summary>当前整份拒绝，避免半份可见证据。</details>

<details><summary>检查点 4. 表格超过 chunk_chars 会怎样？</summary>整体保留；超过 8000 字符才显式拒绝。</details>

<details><summary>检查点 5. XR-200 和 XR-300 能共用一个功率答案吗？</summary>不能；引用必须对应目标行、单位和条件。</details>

<details><summary>检查点 6. 解析器升级能保持原 revision 吗？</summary>不能；fingerprint 改变触发冲突，显式提高 revision。</details>

<details><summary>检查点 7. 是否已有 OCR 与模型正确率？</summary>均未实跑，扫描样本只验证拒绝出口。</details>

<details><summary>检查点 8. 旧引用怎么追溯？</summary>当前活动数据库不存旧正文，应保存原文件与运行记录，旧引用在更新后失效。</details>

依据：2026-10-10 核对 [pypdf 6.10.0 官方文本提取文档](https://pypdf.readthedocs.io/en/6.10.0/user/extract-text.html)。官方说明复杂 PDF 坐标可能不可靠，PDF 缺乏表头/段落语义，pypdf 不执行 OCR。本站保守拒绝规则与测得结果见上述代码和日志。
