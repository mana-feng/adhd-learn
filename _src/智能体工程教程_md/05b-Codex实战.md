<div hidden data-agent-magazine="v1" data-magazine-kind="engineering"></div>

<header class="mg-cover" style="grid-template-columns:minmax(0,1fr)"><div class="mg-cover-copy">
<p class="mg-kicker">智能体工程 · 05b</p>
<p class="mg-question">预算刚好到30分钟，应当允许还是拒绝？</p>
<p class="mg-outcome">读完能做的判断：用原任务卡的边界反例、修复结果与diff证明一次小修改。</p>
<nav class="mg-actions" aria-label="本页阅读入口"><a class="mg-primary" href="#3">从这个问题的原解释开始</a><a href="#mg-agent-engineering-05b-reading-start">直接进入完整解释</a></nav>
</div></header>
<span id="mg-agent-engineering-05b-reading-start" tabindex="-1"></span>

# 05b · Codex 实战：把一次修改做成可验收的小任务

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

> 入口与官方文档核对日期：2026-10-10。

## 🎯 一句话

**先限定改哪里，再用失败、通过和差异证明改对了。** 这节只修一个分钟预算边界，先不要让工具替你改整座项目。

读过 [Claude Code 实操](05-ClaudeCode实操-指令该放哪.html) 就能开始。上下文如何分配见 [04](04-上下文工程.html)，可复用流程见 [Skills](10-技能Skills-把专长打包.html)，长任务交接见 [Harness](12-Harness-长时任务的骨架.html)。本节负责一次小任务的证据。

## 1 · 先确认你站在哪里

Codex App、CLI、IDE 扩展是不同入口。官方 CLI 文档说明终端入口可以读取、修改代码和运行命令；App 的 Local 模式直接使用当前项目目录，Worktree 模式才使用独立的 Git checkout。本节实跑发生在 **Windows Codex desktop 会话**，Python 3.14.7；可见 CLI 为 `0.162.0-alpha.17.2`，没有取得 App 安装版本，不能把 CLI 版本当成 App 版本。CLI、IDE 中的完整操作流程本节未实跑。

| 你现在用的入口 | 开始前记录 | 这节要得到的证据 |
|---|---|---|
| App | 项目路径、分支、当前目录 | 文件变化、命令结果、review |
| CLI | `codex --version`、`codex --help` | 当前版本帮助支持的命令 |
| IDE 扩展 | 扩展版本、打开的工作区 | 实际文件与验证输出 |

不用记固定“最新模型”或全部菜单。官方功能与本机可用权限不一致时，以当前入口的说明和返回状态为准。

✅ **检查 1：终端显示 CLI 版本，可以写“App 版本已验证”吗？**
<details><summary>展开答案</summary>不可以。两个入口的版本需要分别获取；未取得就写未知。</details>

在仓库根目录运行，只读取现场：

```powershell
git branch --show-current
git status --short
python --version
```

有未提交修改是正常状态。记录它，不用 `git reset --hard` 或 `git clean` 清空。需要隔离时先讨论工作树；新工作树并不自动包含当前未提交内容。

✅ **检查 2：目标文件已经被你改过，下一步是什么？**
<details><summary>展开答案</summary>读现有 diff，说明重叠范围，保留已有工作；不能把“干净环境”当成删除理由。</details>

## 2 · 一张任务卡比“帮我优化”更有用

原练习由 README 和三张任务卡组织。阅读卡只交付三句话；修复卡只改一个文件；恢复卡只更新交接。下文展示任务卡与验收方式，不需要网络服务。

这次需求是：已用 20 分钟，再加 10 分钟，日预算 30 分钟，**应当允许**。所有输入约定为非负整数分钟。超额拒绝，负数报错。不增加 UI、数据库、计费或网络请求。

给 Codex 的任务可以直接复制：

> 只修改 `examples/coding-agent-lab/app.py`。先读 README 和测试，运行完整练习测试并解释失败，再最小修复并重跑。不要修改测试、不提交、不推送，保留已有改动。最后给出实际命令结果和 diff；验证完成就停。

✅ **检查 3：把“不要改测试”删掉，会多出什么风险？**
<details><summary>展开答案</summary>工具可能改变期望来获得通过。验收应独立于补丁；不能把错误契约改成正确答案。</details>

## 3 · 先红灯，再绿灯

以下展示原示例父项目目录内的 PowerShell 命令：

```powershell
python -m unittest discover -s examples/coding-agent-lab -p test_app.py -v
```

初始 `app.py` 特意保留 `<` 的边界错误。2026-10-10 实测 5 项测试中 2 项失败：等于日预算、零预算加零分钟；其余 3 项通过。原始记录在 `examples/coding-agent-lab/logs/red.txt`。这是断言失败，不是找不到 Python。

✅ **检查 4：只看到 ModuleNotFoundError 算复现了边界 bug 吗？**
<details><summary>展开答案</summary>不算。先解决运行入口问题，直到真实函数返回错误值、断言失败。</details>

现在让 Codex 修复。自己审查：比较的是总分钟与预算，契约含等号，所以应为 `<=`。不能顺手删掉负数校验。独立解答在 `solution/app.py`，无需覆盖读者练习：

```powershell
$env:LAB_SOLUTION='1'
python -m unittest discover -s examples/coding-agent-lab -p test_app.py -v
Remove-Item Env:LAB_SOLUTION
git diff --no-index -- examples/coding-agent-lab/app.py examples/coding-agent-lab/solution/app.py
```

实测解答 5 项全部通过，见 `logs/green.txt`；差异见 `logs/solution-diff.txt`。`git diff --no-index` 有差异退出 1 是正常的，不要误写成测试失败。

✅ **检查 5：恰好 30 分钟通过后，为什么还测 31 分钟？**
<details><summary>展开答案</summary>确认补丁没有放宽成永远允许。独立超额样例是 False，负数仍抛异常。</details>

**⏸ 停止点：** 你能解释 `<` 与 `<=`，并找到红绿两份日志，就可以先关掉本节。回来从下一段继续。

## 4 · 最后看 diff，不只看“完成了”

让工具展示修改后的 `git diff -- examples/coding-agent-lab/app.py`。如果该文件仍未跟踪，Git 普通 diff 不会显示它；直接查看文件，或使用上面的 no-index 对比。检查允许文件、实际行为和测试结果是否一致。

✅ **检查 6：测试全绿，工具同时改了导航和配置，可以直接验收吗？**
<details><summary>展开答案</summary>不能。全绿没有授予额外修改范围；先解释并处理越界差异。</details>

## 5 · 中断后，先重新看现场

交接记录写四行就够：已完成阅读与红灯；待完成修复、全测、diff；允许文件 app.py；外部副作用无。继续时先读取这四行，再检查分支、status 和实际代码。

本批次另在独立副本中实跑了交接，历史日志记作 `examples/coding-agent-lab/logs/recovery/README.md`：第一段进程保存 `handoff-before.json`，已完成阅读和 5 项测试中 2 项预期失败，待完成补丁、全测、diff；下一段独立进程重新读取交接、当前分支/status 和实际代码，确认仍为 `<`，只执行待办的 `<=` 修复。随后 5 项全部通过，差异审查后写 `handoff-after.json`，待办为空。本地保存的日志只统一文本编码并隐藏绝对仓库路径，保留原始结果与前后哈希。初始读者练习没有被覆盖。

这是 **App 控制的文件状态交接与继续**；没有另开 CLI resume，也没有模拟付款、发布或其他外部副作用。它证明持久交接可以指导检查现场后继续，不证明所有宿主中断恢复机制都可靠。

CLI 的继续会话命令应先以 `codex --help` 核对，官方参考列有 `resume`。本节没有实跑 CLI resume，也不把 App 和 IDE 的恢复菜单套用成同一命令。

✅ **检查 7：交接说“还没修”，实际文件已是 `<=`，怎么办？**
<details><summary>展开答案</summary>记录差异，先验证实际文件，再更新交接。不要重复覆盖，也不要假设测试已经运行。</details>

恢复对话让你找回讨论；恢复业务还要核实真实副作用。付款、上传、发邮件、发布必须查已有结果或幂等标识，不能因为聊天中断就再执行一次。本练习没有外部副作用，只证明本地函数的验证流程。

✅ **检查 8：本地预算测试通过，能证明部署不会重复吗？**
<details><summary>展开答案</summary>不能。部署恢复需要自己的状态查询与重复执行测试。</details>

## ⚡ 走神救援

记住三件事：任务卡限定文件；红灯证明测试能抓 bug；绿灯后还要看 diff。中断回来先查现场。到这里停，不需要提交或推送。

2026-10-20 复核入口区别：[Local 与 Worktree](https://learn.chatgpt.com/docs/environments/modes)；以下历史实验仍为 2026-10-10 的记录。

官方来源（2026-10-10 已读取）：[CLI](https://learn.chatgpt.com/docs/codex/cli)、[命令参考](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[工作树](https://learn.chatgpt.com/docs/environments/git-worktrees)。继续练习 [浏览器连接](09b-浏览器连接与故障定位.html)。
