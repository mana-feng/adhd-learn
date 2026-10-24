<div hidden data-agent-magazine="v1" data-magazine-kind="reference" data-agent-appendix-d="v1"></div>

<script defer src="../assets/magazine-rollout/agent-engineering/appendix-d-fragment-v1.js"></script>

<header class="mg-cover" style="grid-template-columns:minmax(0,1fr)"><div class="mg-cover-copy">
<p class="mg-kicker">智能体工程 · 附录 D</p>
<p class="mg-question">一次口述回答，能打开哪一份核对证据？</p>
<p class="mg-outcome">按原六类36卡定位短答、追问和证据；只读到概念或未实跑时保留原限制。</p>
<nav class="mg-actions" aria-label="本页阅读入口"><a class="mg-primary" href="#_2">用原搜索定位问题</a><a href="#mg-agent-engineering-d-reading-start">直接进入完整卡片与说明</a></nav>
</div></header>
<span id="mg-agent-engineering-d-reading-start" tabindex="-1"></span>

# 附录 D · 岗位问答与证据索引

> 本页保留教学路径与历史验证结论；所列完整实验工程、报告和运行记录仅在本地留存，未随本站及公开仓库分发。

## 🎯 一句话

答辩先说“我解决了哪一个失败”，再打开证据；没有运行过的能力，明确留在下一步。

> 全页阅读时间以顶部自动徽章为准；折叠追问与证据可分次阅读，外部证据文件阅读另计。
> 阅读方式：六类各六题，每次只读一类。短回答用于 30–90 秒口述；深入追问折叠阅读。这里是原创学习卡，不是公司面经榜单，也不代表真实客户项目经历。

## 先选一条路线

<input id="interview-search" type="search" aria-label="搜索岗位问答" placeholder="搜索题目、权限、引用、训练或证据" />
<p id="interview-count" role="status" aria-live="polite">共 36 张卡；未使用搜索时按六类顺序阅读。</p>

基础／架构 → RAG → Agent/Harness → 训练 → 推理服务 → 产品交付。训练与服务题可以只读边界，不必现在实现所有算法。

本页按结构化卡片组织岗位问答。原卡片文件记作 `examples/knowledge-assistant/interview-cards.json`。其中路径以仓库根目录为基准，每题都有问题、短回答、章节、追问、证据、状态日期和限制。答辩模板（`examples/knowledge-assistant/project-defense-template.md`）用于填写本人工作。

状态要这样读：`existing_record` 是已存在的记录，`simulated` 是可控消息或本地下游夹具，`new_run` 才是本次实验运行，`not_run` 是未实跑。本页没有新增运行成绩。已有记录日期是 2026-09-06，未实跑范围登记日期是 2026-10-10；登记不是实验日期。

**检查点 1：** 同事问“你做过 OAuth 吗”，该如何描述本地 token？
<details><summary>展开答案</summary><p>只说明短期凭证夹具的字段核验。没有授权服务器、PKCE、浏览器登录和真实 IdP 联调，不能称完成 OAuth。</p></details>

## 先拿一张任务证据表

| 任务 | 代码入口 | 现有记录 | 证明边界 |
|---|---|---|---|
| 入库版本、删除、撤权 | `examples/knowledge-assistant/core.py` | 业务测试（`examples/knowledge-assistant/validation/core-tests.txt`） | SQLite 教学事务与当前读路径；未来缓存仍须验收 |
| 检索、RRF、重排 | `examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/models.py` | 原始逐题报告（`examples/knowledge-assistant/validation/neural-evaluation.json`）、消融（`examples/knowledge-assistant/validation/ablation-summary.json`） | 小开发集文档指标，非答案正确率 |
| 引用与循环 | `examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/core.py` | 业务测试（`examples/knowledge-assistant/validation/core-tests.txt`） | 可控消息、结构与出处；语义支持需复核 |
| 审批、幂等、对账 | `examples/knowledge-assistant/workflow.py` | 业务测试（`examples/knowledge-assistant/validation/core-tests.txt`） | 本地操作者与模拟下游，非外部工单联调 |
| MCP | 服务端（`examples/knowledge-assistant/mcp_server.py`）、客户端（`examples/knowledge-assistant/mcp_client.py`） | 协议测试（`examples/knowledge-assistant/validation/protocol-tests.txt`） | loopback HTTP/stdio，非 OAuth 或所有宿主互通 |
| 框架恢复 | `examples/knowledge-assistant/framework.py` | 协议测试（`examples/knowledge-assistant/validation/protocol-tests.txt`） | 单机跨进程恢复，非分布式 worker |

以上记录均来自原有 2026-09-06 教学验证；原复现配置记录在 README（`examples/knowledge-assistant/README.md`） 与 环境（`examples/knowledge-assistant/validation/environment.json`）。记录中的 31 项业务测试、5 项协议测试成功，不能扩写成生产可靠性或真实模型安全结论。

**检查点 2：** 文档 Recall=1 是否能证明答案都正确？
<details><summary>展开答案</summary><p>不能。目标文档进入结果不等于上下文保留全部条件，更不等于模型结论得到原文支持。</p></details>

## 1. 基础／架构：六张卡，读完即可停

<section class="interview-card" data-track="基础架构" id="card-基础架构-01" markdown="1">

### 基础架构-01 · 为什么设备问答先做 RAG，而不是直接微调？

**短回答：** 设备手册会更新，还要按用户权限取证。先把当前可见版本检索出来，更容易定位知识缺失和撤权失败。微调可以改变任务行为，却不能代替文档版本、访问控制和引用核对。若问题本来只需固定表单，就先用确定工作流。

复习章节：[08-RAG深水区.html](../大模型全景导论/08-RAG深水区.html)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/README.md`。

状态：`not_run` · 2026-10-10。**限制：** 尚未比较微调与 RAG 的真实生成答案质量。

<details>
<summary>展开追问与准备动作</summary>

什么变化属于知识更新，什么变化才需要训练？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="基础架构" id="card-基础架构-02" markdown="1">

### 基础架构-02 · Transformer 中注意力解决什么？

**短回答：** 它让一个位置根据输入内容选择其他位置的信息，权重随上下文变化。回答时先解释依赖关系，再区分训练时并行计算和自回归生成。不要把注意力权重直接当作可解释的业务证据；设备参数仍应回到手册原文。

复习章节：[02-Transformer原理.html](../大模型全景导论/02-Transformer原理.html)。

可展示证据：[02-Transformer原理.html](../大模型全景导论/02-Transformer原理.html)。

状态：`not_run` · 2026-10-10。**限制：** 本项目没有实现或训练 Transformer。

<details>
<summary>展开追问与准备动作</summary>

为什么能并行训练，生成却通常逐步进行？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="基础架构" id="card-基础架构-03" markdown="1">

### 基础架构-03 · 上下文窗口大，是否就不需要切块？

**短回答：** 窗口决定能放多少 token，不决定哪段资料相关。长输入仍可能包含旧版、不同型号和无权资料，还会增加等待与成本。教学切块使用字符预算，保留条件和表格；它不是模型 token 数，也没有证明长上下文能稳定读对全部资料。

复习章节：[03-Tokenizer与上下文.html](../大模型全景导论/03-Tokenizer与上下文.html)。

原教学材料路径：`examples/knowledge-assistant/core.py`。

状态：`not_run` · 2026-10-10。**限制：** 字符预算不能用于精确估算模型计费或显存。

<details>
<summary>展开追问与准备动作</summary>

型号和单位被切开会造成什么错误？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="基础架构" id="card-基础架构-04" markdown="1">

### 基础架构-04 · Decoder-only 和 MoE 怎样解释给应用同事？

**短回答：** Decoder-only 按已有前缀预测后续 token；MoE 在部分层按路由选择专家计算。二者描述不同层面的设计，不能据此直接承诺项目速度或成本。应用选型仍需用相同任务、配置和硬件实测，而不是只比较参数名。

复习章节：[02d-MoE混合专家.html](../大模型全景导论/02d-MoE混合专家.html)。

可展示证据：[02c-为什么都是Decoder-only.html](../大模型全景导论/02c-为什么都是Decoder-only.html)、[02d-MoE混合专家.html](../大模型全景导论/02d-MoE混合专家.html)。

状态：`not_run` · 2026-10-10。**限制：** 没有对任何 MoE 模型做本项目容量测量。

<details>
<summary>展开追问与准备动作</summary>

激活参数与总参数为什么不同？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="基础架构" id="card-基础架构-05" markdown="1">

### 基础架构-05 · 什么时候选择工作流，什么时候选择 Agent？

**短回答：** 明确的审批顺序与副作用约束用工作流；需要根据观察决定下一次检索时，才给模型有限工具选择。知识助手把搜索和草稿交给循环，把审批及执行留在业务层。这样可以独立测试授权，不让模型一句话改变状态。

复习章节：[06-工作流还是Agent.html](../智能体工程教程/06-工作流还是Agent.html)。

原教学材料路径：`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/workflow.py`。

状态：`simulated` · 2026-09-06。**限制：** 工具选择测试采用可控消息，不是自主模型表现证明。

<details>
<summary>展开追问与准备动作</summary>

哪些步骤必须确定，哪些步骤允许模型选择？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="基础架构" id="card-基础架构-06" markdown="1">

### 基础架构-06 · 为什么不把所有能力塞进一个框架？

**短回答：** 框架帮助组织状态和节点，但业务事实仍应能在独立代码与库中检查。这个示例把检索、凭证、审批、副作用与图恢复分开；换框架时应保持授权和幂等约束。没有依据时不声称某框架更稳定，先展示失败恢复路径。

复习章节：[16b-框架这层皮.html](../智能体工程教程/16b-框架这层皮.html)。

原教学材料路径：`examples/knowledge-assistant/framework.py`、`examples/knowledge-assistant/workflow.py`。

状态：`not_run` · 2026-10-10。**限制：** 单机教学结构未做框架间生产可靠性比较。

<details>
<summary>展开追问与准备动作</summary>

去掉图框架后，哪些业务约束仍必须成立？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 3：** 选型依据中哪些是概念，哪些是实测？
<details><summary>展开答案</summary><p>把架构解释与运行记录分开；没有同任务、同硬件的结果就不承诺速度。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 2. RAG：六张卡，读完即可停

<section class="interview-card" data-track="RAG" id="card-RAG-01" markdown="1">

### RAG-01 · 同版本文档重复入库会怎样？

**短回答：** 版本号相同且内容指纹相同，入库返回 unchanged；同版本内容变化则拒绝冲突。新版本文档和块在事务中一起发布，失败不会露出半套块。管理员要明确版本迁移，不能用删除旧库把冲突藏起来。

复习章节：[11b-文档入库与数据治理.html](../智能体工程教程/11b-文档入库与数据治理.html#read-publish)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`existing_record` · 2026-09-06。**限制：** 记录覆盖教学 SQLite 故障夹具，不代表分布式发布。

<details>
<summary>展开追问与准备动作</summary>

提交前失败后，读者应该看见哪个版本？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="RAG" id="card-RAG-02" markdown="1">

### RAG-02 · 撤权后，旧引用还能通过吗？

**短回答：** 每次验证引用重新取当前身份可见的块，并核对版本和原文。撤权、删除或换版后，旧块不应再通过；检索各分支也共享可见语料。这个约束必须覆盖读取入口，未来加入缓存和父段扩展时还要单独测试。

复习章节：[11b-文档入库与数据治理.html](../智能体工程教程/11b-文档入库与数据治理.html#read-authorize)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`existing_record` · 2026-09-06。**限制：** 没有证明新增缓存或外部数据库同样遵守 ACL。

<details>
<summary>展开追问与准备动作</summary>

为什么检索结束后再过滤还不够？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="RAG" id="card-RAG-03" markdown="1">

### RAG-03 · BM25、向量与 RRF 各负责哪一步？

**短回答：** BM25 倾向词项匹配，向量用于语义相近候选，RRF 用各自排名融合而非直接相加分数。示例先限定权限，再生成候选并在预算内拼上下文。分数不是答案可信概率；相近型号是否排对，要看逐题候选和证据。

复习章节：[11c-检索评测与调优实验.html](../智能体工程教程/11c-检索评测与调优实验.html#_4)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/validation/neural-evaluation.json`。

状态：`existing_record` · 2026-09-06。**限制：** 小语料精确搜索，没有 ANN 或向量数据库性能证明。

<details>
<summary>展开追问与准备动作</summary>

为什么融合分数不能作为置信度阈值？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="RAG" id="card-RAG-04" markdown="1">

### RAG-04 · 为什么没有采纳现有重排器？

**短回答：** 已有记录中，hybrid 的文档 Recall 为 1.0，加入英文重排器后降到 0.9062，MRR 也下降。中文任务不能只凭模型名称就升级；应保留失败题与延迟，再决定是否换中文模型重测。这是开发集反例，不是所有重排器都无效。

复习章节：[11c-检索评测与调优实验.html](../智能体工程教程/11c-检索评测与调优实验.html#_5)。

原教学材料路径：`examples/knowledge-assistant/validation/neural-evaluation.json`、`examples/knowledge-assistant/models.py`。

状态：`existing_record` · 2026-09-06。**限制：** 2026-09-06 的 16 道有答案开发题、单次 CPU 运行，无独立保留集。

<details>
<summary>展开追问与准备动作</summary>

哪道题退化，候选位置发生了什么变化？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="RAG" id="card-RAG-05" markdown="1">

### RAG-05 · 有引用是否等于答案正确？

**短回答：** 引用校验能证明块 ID、版本、可见性和引文确实来自原文，不能证明结论由这段话推出。还要检查型号、条件、单位和否定词是否支持回答。示例明确返回 requires_review；真实生成正确率要另做逐条语义判定。

复习章节：[11d-生成引用与查询诊断.html](../智能体工程教程/11d-生成引用与查询诊断.html#_8)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 未运行真实生成答案评测，不能承诺消除幻觉。

<details>
<summary>展开追问与准备动作</summary>

引用 XR-300 却回答 XR-200，结构校验能发现吗？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="RAG" id="card-RAG-06" markdown="1">

### RAG-06 · 如何区分召回差和上下文丢失？

**短回答：** 先看可见文档是否已入库，再看候选列表里有没有目标，最后看目标是否被去重或预算挤出上下文。只改一个参数并保存逐题报告；没有证据的问题单列，不能把返回候选当作可以回答。最终答案错误还需独立诊断生成。

复习章节：[11d-生成引用与查询诊断.html](../智能体工程教程/11d-生成引用与查询诊断.html#_3)。

原教学材料路径：`examples/knowledge-assistant/validation/context800.json`、`examples/knowledge-assistant/validation/ablation-summary.json`。

状态：`existing_record` · 2026-09-06。**限制：** 小开发集的预算消融不能推断生产参数不敏感。

<details>
<summary>展开追问与准备动作</summary>

目标在候选中却没进上下文，该先改哪一层？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 4：** 重排器退化后，应删掉失败题吗？
<details><summary>展开答案</summary><p>保留逐题记录与开发集口径，拒绝这组配置；改模型后重新测，不修改题集隐藏失败。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 3. Agent／Harness：六张卡，读完即可停

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-01" markdown="1">

### AgentHarness-01 · 如何阻止模型从草稿直接执行工单？

**短回答：** 工具循环只列出搜索与草稿，执行仍由业务层校验独立审批。服务端即使暴露执行工具，也重新核对业务库状态和身份；不能把工具列表当成唯一安全措施。批准绑定动作指纹，修改动作后不能沿用批准。

复习章节：[12b-持久化审批与故障恢复.html](../智能体工程教程/12b-持久化审批与故障恢复.html#_3)。

原教学材料路径：`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/workflow.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 本地操作者夹具没有真实人工审批界面。

<details>
<summary>展开追问与准备动作</summary>

为什么系统提示词说禁止执行还不够？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-02" markdown="1">

### AgentHarness-02 · 响应丢失后为什么不能盲目重试？

**短回答：** 下游可能已创建成功。示例用唯一操作号保存副作用事实，恢复先查下游；已存在就对账并返回既有结果，即使批准已过期。过期后不能发起新的副作用。幂等依赖下游支持或可查询事实，不能靠 try/except 保证任意外部 API 只执行一次。

复习章节：[12b-持久化审批与故障恢复.html](../智能体工程教程/12b-持久化审批与故障恢复.html#tryexcept)。

原教学材料路径：`examples/knowledge-assistant/workflow.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 独立事务模拟下游，没有真实工单 SaaS 联调。

<details>
<summary>展开追问与准备动作</summary>

下游不提供幂等键时怎样处理未知结果？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-03" markdown="1">

### AgentHarness-03 · checkpoint 为什么不等于审批？

**短回答：** checkpoint 保存图状态，业务库保存授权和副作用事实。恢复时重新检查当前授权；批准过期不能发起新的副作用，但已经发生的结果仍需查询、对账和返回。图里的 yes 不能延长批准有效期；断点位置、执行许可与已发生事实要分别核对。

复习章节：[16d-LangGraph实作与运行边界.html](../智能体工程教程/16d-LangGraph实作与运行边界.html)。

原教学材料路径：`examples/knowledge-assistant/framework.py`、`examples/knowledge-assistant/workflow.py`、`examples/knowledge-assistant/validation/protocol-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 单机跨进程测试不证明分布式 worker 租约和锁。

<details>
<summary>展开追问与准备动作</summary>

恢复时批准已过期，哪些动作不能新发起，哪些既有结果仍要对账？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-04" markdown="1">

### AgentHarness-04 · MCP 的本地 token 是 OAuth 吗？

**短回答：** 不是。它是短期不透明凭证夹具，服务端核对哈希、身份、租户、scope、audience、到期与撤销。示例没有授权服务器、浏览器登录、PKCE、刷新和真实 IdP。协议传输成功与 OAuth 产品认证通过是两份不同证据。

复习章节：[08c-MCP鉴权与互操作.html](../智能体工程教程/08c-MCP鉴权与互操作.html)。

原教学材料路径：`examples/knowledge-assistant/workflow.py`、`examples/knowledge-assistant/mcp_server.py`、`examples/knowledge-assistant/validation/protocol-tests.txt`。

状态：`existing_record` · 2026-09-06。**限制：** loopback HTTP 与 stdio 记录不证明真实 IdP 或第三方宿主互操作。

<details>
<summary>展开追问与准备动作</summary>

audience 检查通过能证明浏览器登录安全吗？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-05" markdown="1">

### AgentHarness-05 · Agent 为什么需要预算和重复调用检测？

**短回答：** 工具循环可能持续重试。示例限制轮数、每轮工具数、总时间与消息体量，并拒绝重复调用；失败以拒绝异常结束，成功返回含 trace。失败轨迹保存仍需补验收。预算是执行边界，不保证任务完成；产品还需处理失败说明与记录。

复习章节：[12-Harness-长时任务的骨架.html](../智能体工程教程/12-Harness-长时任务的骨架.html)。

原教学材料路径：`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 可控消息测试未证明真实模型成功率或攻击抵抗率。

<details>
<summary>展开追问与准备动作</summary>

预算耗尽时，应报告哪些已完成动作？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="AgentHarness" id="card-AgentHarness-06" markdown="1">

### AgentHarness-06 · 文档里的“忽略规则”应怎样处理？

**短回答：** 外部资料只能作为证据，不应变成系统指令。示例用有限工具、参数检查、权限与独立审批限制后果，不能只依靠提醒模型。要展示恶意资料夹具与拒绝路径，并把真实模型的攻击成功率评测单独标成未实跑。

复习章节：[15-安全-沙箱与提示注入.html](../智能体工程教程/15-安全-沙箱与提示注入.html)。

原教学材料路径：`examples/knowledge-assistant/corpus/poison.md`、`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/validation/core-tests.txt`。

状态：`simulated` · 2026-09-06。**限制：** 没有真实模型红队攻击成功率，也没有沙箱逃逸验收。

<details>
<summary>展开追问与准备动作</summary>

资料要求泄露租户 B 数据时哪层应拒绝？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 5：** checkpoint 中已有 yes，恢复时批准过期怎么办？
<details><summary>展开答案</summary><p>重新核对业务库授权；过期后不能发起新的副作用。若下游已创建，仍要查询、对账并返回既有结果，不能将它误报为未执行。图状态不能延长审批有效期。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 4. 训练：六张卡，读完即可停

<section class="interview-card" data-track="训练" id="card-训练-01" markdown="1">

### 训练-01 · LoRA 解决的是哪类需求？

**短回答：** LoRA 用少量可训练低秩参数改变模型行为，适合格式、风格或稳定任务模式。手册更新优先解决数据版本和检索，不把事实记忆都交给参数。训练方案要说明基座、数据许可、划分和预算，并与原模型在保留集上比较。

复习章节：[05-微调与LoRA.html](../大模型全景导论/05-微调与LoRA.html)。

可展示证据：[17c-岗位专项与进阶实验.html](../智能体工程教程/17c-岗位专项与进阶实验.html#lora-sft)。

状态：`not_run` · 2026-10-10。**限制：** 本项目尚无 LoRA 训练、权重或成绩。

<details>
<summary>展开追问与准备动作</summary>

为什么不能把设备新参数直接当成微调需求？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="训练" id="card-训练-02" markdown="1">

### 训练-02 · 训练 loss 更低能写成模型更好吗？

**短回答：** 不能。loss 下降只说明当前目标在这些训练样本上更容易拟合，可能是重复、泄漏或记忆。应去重并按文档或来源划分保留集，检查格式、任务质量和失败样本；真正泛化结论必须来自未参与调参的数据。

复习章节：[17c-岗位专项与进阶实验.html](../智能体工程教程/17c-岗位专项与进阶实验.html#lora-sft)。

可展示证据：[11b-私有评测集怎么建.html](../大模型全景导论/11b-私有评测集怎么建.html)。

状态：`not_run` · 2026-10-10。**限制：** 未来训练及泛化验证未实跑。

<details>
<summary>展开追问与准备动作</summary>

同一手册的改写题落入训练和测试有何风险？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="训练" id="card-训练-03" markdown="1">

### 训练-03 · SFT 与偏好对齐分别改变什么？

**短回答：** SFT 用输入与目标输出教任务行为；偏好对齐用回答间的选择信息调整偏好。它们不替代访问控制，也不保证事实正确。先定义目标和可评测任务，再决定是否需要偏好数据，避免把算法名字当成交付证明。

复习章节：[04-训练三阶段.html](../大模型全景导论/04-训练三阶段.html)。

可展示证据：[12-RLHF全流程.html](../强化学习基础/12-RLHF全流程.html)、[13-DPO与免RL对齐.html](../强化学习基础/13-DPO与免RL对齐.html)。

状态：`not_run` · 2026-10-10。**限制：** 未在本项目运行 SFT、RLHF 或 DPO。

<details>
<summary>展开追问与准备动作</summary>

一个格式错误与一个偏好争议应如何分别处理？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="训练" id="card-训练-04" markdown="1">

### 训练-04 · 怎样准备不会泄漏的设备问答训练集？

**短回答：** 只使用有权处理的材料，保留来源、版本与许可；去掉账户和机密字段，再按来源隔离训练、开发与测试。无答案、版本冲突与权限拒绝样本也要覆盖。虚构语料适合教学，但不能替代真实分布的数据审查。

复习章节：[11b-私有评测集怎么建.html](../大模型全景导论/11b-私有评测集怎么建.html)。

原教学材料路径：`examples/knowledge-assistant/corpus/questions.json`、`examples/knowledge-assistant/corpus/manifest.json`。

状态：`not_run` · 2026-10-10。**限制：** 现有题集是公开开发集，不是已建立的训练闭环。

<details>
<summary>展开追问与准备动作</summary>

拒绝样本能不能和普通问答使用同一判分方式？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="训练" id="card-训练-05" markdown="1">

### 训练-05 · 如何决定一次训练是否值得保留？

**短回答：** 先固定基线、数据划分与验收口径，再记录配置、随机种子、硬件和原始输出。质量不升或成本过高就保留失败记录并回退；不给未运行实验填改善百分比。小样本上的最好一次结果需要独立复测才能支撑选择。

复习章节：[17c-岗位专项与进阶实验.html](../智能体工程教程/17c-岗位专项与进阶实验.html#lora-sft)。

原教学材料路径：`examples/knowledge-assistant/project-defense-template.md`。

状态：`not_run` · 2026-10-10。**限制：** 基线、训练、复测验收栏均待填写，未实跑。

<details>
<summary>展开追问与准备动作</summary>

若格式改善但权限拒绝变差，该如何判定？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="训练" id="card-训练-06" markdown="1">

### 训练-06 · GRPO 或蒸馏是否是下一步必选？

**短回答：** 不是。先找当前任务的瓶颈和可核对的训练目标，再决定是否补专项实验。蒸馏还要确认教师数据许可、学生容量与任务退化；强化学习要有可检验奖励。现在只复用概念章节，不把候选算法写成项目能力。

复习章节：[18b-知识蒸馏.html](../AI基础设施/18b-知识蒸馏.html)。

可展示证据：[15-实战与挑战项目.html](../强化学习基础/15-实战与挑战项目.html)。

状态：`not_run` · 2026-10-10。**限制：** 没有 GRPO、蒸馏或专项奖励实验。

<details>
<summary>展开追问与准备动作</summary>

缺少可靠奖励时先补什么证据？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 6：** 训练 loss 下降，应怎样写验收？
<details><summary>展开答案</summary><p>记录训练拟合现象，保留集泛化仍待验证；本项目没有训练结果，不填改善百分比。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 5. 推理服务：六张卡，读完即可停

<section class="interview-card" data-track="推理服务" id="card-推理服务-01" markdown="1">

### 推理服务-01 · 首 token 等待和吞吐有什么区别？

**短回答：** 首 token 等待反映用户多久看到开始回答，吞吐反映服务单位时间处理多少 token。总时长还受输出长度影响；批处理可能提高吞吐却增加排队。需要在同一硬件、模型、长度和并发下记录这些指标，不能拿检索延迟当生成延迟。

复习章节：[06d-降延迟与三个指标.html](../大模型全景导论/06d-降延迟与三个指标.html)。

可展示证据：[20-推理服务化.html](../AI基础设施/20-推理服务化.html)。

状态：`not_run` · 2026-10-10。**限制：** 真实生成与并发服务测量未实跑。

<details>
<summary>展开追问与准备动作</summary>

为什么 tokens/s 高但用户仍觉得慢？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="推理服务" id="card-推理服务-02" markdown="1">

### 推理服务-02 · KV Cache 为什么影响并发容量？

**短回答：** 生成会保留历史 token 的 K/V，长上下文和更多并发会占用额外显存。容量估算要连同权重、激活及运行开销一起检查；窗口大小不是可以接纳的并发数。先测真实请求长度分布，再确定队列和拒绝策略。

复习章节：[16-KV-Cache.html](../AI基础设施/16-KV-Cache.html)。

可展示证据：[03-显存与带宽墙.html](../AI基础设施/03-显存与带宽墙.html)。

状态：`not_run` · 2026-10-10。**限制：** 没有 GPU 显存或并发容量实测。

<details>
<summary>展开追问与准备动作</summary>

上下文增长时为什么不能只看权重体积？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="推理服务" id="card-推理服务-03" markdown="1">

### 推理服务-03 · 连续批处理会自动降低所有请求延迟吗？

**短回答：** 它让已完成请求退出、空位接入新请求，提高利用率的机会更多，但排队、长请求和调度仍会影响等待。PagedAttention 管理 KV 存储，不等于产品 SLO 已通过。需要固定负载比较首 token、总时长和错误率。

复习章节：[17-连续批处理与PagedAttention.html](../AI基础设施/17-连续批处理与PagedAttention.html)。

可展示证据：[20-推理服务化.html](../AI基础设施/20-推理服务化.html)。

状态：`not_run` · 2026-10-10。**限制：** 未启动推理服务器或测量批处理收益。

<details>
<summary>展开追问与准备动作</summary>

长短请求混合时应观察哪种尾延迟？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="推理服务" id="card-推理服务-04" markdown="1">

### 推理服务-04 · 量化是否总能让服务更快更好？

**短回答：** 量化减少数值精度与存储需求，实际速度取决于硬件、内核和模型支持，还可能损伤任务质量。选型需要相同题集比较质量、显存和等待，保留版本与失败例。不能把模型文件更小写成线上吞吐已提高。

复习章节：[18-量化.html](../AI基础设施/18-量化.html)。

可展示证据：[07-本地部署与开源生态.html](../大模型全景导论/07-本地部署与开源生态.html)。

状态：`not_run` · 2026-10-10。**限制：** 没有量化前后质量或速度测量。

<details>
<summary>展开追问与准备动作</summary>

小模型够用与量化大模型应如何公平比较？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="推理服务" id="card-推理服务-05" markdown="1">

### 推理服务-05 · 检索报告 p95 能作为服务 SLO 吗？

**短回答：** 不能。现有 p95 来自小开发集单次 CPU 检索，未控制其他负载，也没包含生成、网络、排队或持续并发。它能提示这组重排器成本高，不能承诺服务容量。SLO 要以真实请求分布和完整链路负载测量定义。

复习章节：[11c-检索评测与调优实验.html](../智能体工程教程/11c-检索评测与调优实验.html#_7)。

原教学材料路径：`examples/knowledge-assistant/validation/neural-evaluation.json`、`examples/knowledge-assistant/validation/environment.json`。

状态：`existing_record` · 2026-09-06。**限制：** 已有检索记录，不是生产尾延迟证据。

<details>
<summary>展开追问与准备动作</summary>

哪些计时段在这份报告中缺失？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="推理服务" id="card-推理服务-06" markdown="1">

### 推理服务-06 · 失败重试、超时和成本护栏怎样配合？

**短回答：** 调用层设时间与重试上限，区分暂时错误和不能重试的业务错误；产品还要限制租户配额、输出预算和排队长度。副作用请求先确定幂等语义。当前工具预算是教学边界，尚未完成生产调用层、限流与成本验收。

复习章节：[04-调用层.html](../AI全栈/04-调用层.html)。

原教学材料路径：[12-限流配额与成本护栏.html](../AI全栈/12-限流配额与成本护栏.html)、`examples/knowledge-assistant/agent.py`。

状态：`not_run` · 2026-10-10。**限制：** 未来生产限流、容量及计费验证未实跑。

<details>
<summary>展开追问与准备动作</summary>

限流错误应怎样向用户说明并避免无限重试？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 7：** 用检索小样本 p95 承诺推理服务 SLO，可以吗？
<details><summary>展开答案</summary><p>不可以；缺少生成、网络、排队和并发负载，必须另测完整链路。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 6. 产品交付：六张卡，读完即可停

<section class="interview-card" data-track="产品交付" id="card-产品交付-01" markdown="1">

### 产品交付-01 · 如何用一分钟介绍知识助手项目？

**短回答：** 我做的是虚构设备知识助手教学基线，目标是让回答和动作都有可查证据。已有记录展示版本、ACL、检索反例、引用结构和审批恢复。真实生成、OAuth、PDF 与部署还未验收；下一步用具体失败样本补验证，而不是承诺完整企业产品。

复习章节：[17b-企业知识助手交付项目.html](../智能体工程教程/17b-企业知识助手交付项目.html)。

原教学材料路径：`examples/knowledge-assistant/README.md`、`examples/knowledge-assistant/project-defense-template.md`。

状态：`existing_record` · 2026-09-06。**限制：** 没有真实客户、收费服务或生产交付经历证明。

<details>
<summary>展开追问与准备动作</summary>

你亲自实现和本次仅阅读的证据分别是什么？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="产品交付" id="card-产品交付-02" markdown="1">

### 产品交付-02 · 多租户隔离可以怎样证明？

**短回答：** 身份中有租户，取数限定租户与当前可见读者；HTTP 凭证绑定身份和 scope，业务执行再次核对归属。用跨租户、撤权和过期负例展示结果。这样的测试只能覆盖现有入口，不能保证将来缓存、日志或上传路径都不会泄漏。

复习章节：[08-认证会话与多租户.html](../AI全栈/08-认证会话与多租户.html)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/workflow.py`、`examples/knowledge-assistant/validation/core-tests.txt`、`examples/knowledge-assistant/validation/protocol-tests.txt`。

状态：`existing_record` · 2026-09-06。**限制：** 教学身份与 loopback 凭证测试不构成企业安全认证。

<details>
<summary>展开追问与准备动作</summary>

租户字段能否直接信任客户端传入？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="产品交付" id="card-产品交付-03" markdown="1">

### 产品交付-03 · Dockerfile 存在算部署完成吗？

**短回答：** 不算。还需要干净环境构建、启动、持久化、认证、TLS、健康检查及恢复记录。现有文件是部署练习入口；没有容器运行与云端 CI 通过证据。答辩应把可运行代码与可对外服务分别说明，不填未经测试的可用率。

复习章节：[14-容器化与部署.html](../AI全栈/14-容器化与部署.html)。

原教学材料路径：`examples/knowledge-assistant/Dockerfile`、`examples/knowledge-assistant/README.md`。

状态：`not_run` · 2026-10-10。**限制：** 容器构建、运行、云端部署均未实跑。

<details>
<summary>展开追问与准备动作</summary>

数据库重启后是否保留，准备怎么验证？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="产品交付" id="card-产品交付-04" markdown="1">

### 产品交付-04 · PDF 解析接口存在算支持企业 PDF 吗？

**短回答：** 只代表代码有可选文本层路径。加密、无文本和稀疏页会拒绝，当前没有 OCR、复杂表格或版面恢复验收。必须准备含页码和失败类型的 PDF 夹具，检查单位与条件是否保留；Markdown 测试不能替代它。

复习章节：[11b-文档入库与数据治理.html](../智能体工程教程/11b-文档入库与数据治理.html#read-parse)。

原教学材料路径：`examples/knowledge-assistant/core.py`、`examples/knowledge-assistant/README.md`。

状态：`not_run` · 2026-10-10。**限制：** PDF 夹具、OCR 和版面质量验收未实跑。

<details>
<summary>展开追问与准备动作</summary>

扫描页与有文本层页面应怎样分别处理？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="产品交付" id="card-产品交付-05" markdown="1">

### 产品交付-05 · 怎样排查一次用户反馈的错误答案？

**短回答：** 给请求可关联的诊断标识，依次核对版本与权限、候选、上下文、生成和引用支持。保留必要配置及脱敏失败样本，避免把私密全文写进日志。当前示例有 trace 与报告字段，真实产品日志权限、保留期和告警需要另验收。

复习章节：[15-可观测性.html](../AI全栈/15-可观测性.html)。

原教学材料路径：`examples/knowledge-assistant/agent.py`、`examples/knowledge-assistant/validation/neural-evaluation.json`。

状态：`not_run` · 2026-10-10。**限制：** 未部署生产追踪、告警或日志脱敏管线。

<details>
<summary>展开追问与准备动作</summary>

错误发生在上下文拼装时，为何改提示词可能无效？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

<section class="interview-card" data-track="产品交付" id="card-产品交付-06" markdown="1">

### 产品交付-06 · 交付后哪些变化必须重新验收？

**短回答：** 解析器、模型、权限规则、提示词和服务配置变化都可能改变结果。记录版本并重跑相关失败集，比较独立质量与运行指标，必要时回退。当前已有开发集和测试记录可作为起点；新增能力先补空验收栏，再用原始结果关闭。

复习章节：[15b-怎么测不确定的系统.html](../AI全栈/15b-怎么测不确定的系统.html)。

原教学材料路径：`examples/knowledge-assistant/validation/tests.json`、`examples/knowledge-assistant/project-defense-template.md`。

状态：`not_run` · 2026-10-10。**限制：** 没有持续生产回归或发布回滚验收。

<details>
<summary>展开追问与准备动作</summary>

换重排器后哪些旧记录可以保留，哪些必须重测？

准备动作：打开上面的章节和证据，指认支持短回答的具体规则或失败结果；若只有概念页，就说明未实跑，不拿页面存在当验收。

</details>

</section>

**检查点 8：** 面试时怎样区分本人实现与既有证据？
<details><summary>展开答案</summary><p>先说本人实际负责模块，再说明哪些记录只是阅读、哪些自己重跑；不能把模板改成商业经历。</p></details>

**🛑 本类停止点：** 选择一题，用“目标 → 失败 → 选择 → 验证 → 代价 → 限制”说一遍。说不出证据时，停下来打开文件；不用继续刷下一类。

## 用一个反例完成项目答辩

虚构设备知识助手不是一个“全部功能完成”的产品。它把文档版本与权限、检索证据、引用、审批和恢复连成可查的教学路线。若本人只改了某个模块，开场就说明自己的职责。

目标：在当前身份可见的手册中查设备信息。失败：相近型号排序可能错，增加重排后也可能更差。选择：保留能复现的基线，用一个变量的消融判断优化，而不是默认“加模型就更好”。验证：2026-09-06 的 16 道有答案开发题中，hybrid Recall 为 1.0、MRR 为 0.9375；英文重排器加入后分别为 0.90625 和 0.875。代价：该记录中的重排还增加等待；硬件、模型与逐题结果都应一起展示。限制：公开小开发集，无独立保留集，单次 CPU 测量，不是真实生成答案正确率，也不是生产 SLO。

<details>
<summary>追问：为什么不用更好看的成功案例收尾？</summary>

展示没有采纳的优化，可以说明你如何做决策。原报告（`examples/knowledge-assistant/validation/neural-evaluation.json`）采用的复核方法是：找一条退化题，比较候选及排名；再说明下一步如何换中文模型、准备独立保留集并复测。新实验未运行，改善幅度就保持空白。

</details>

按原答辩模板的思路整理自己的记录（`examples/knowledge-assistant/project-defense-template.md`）：把入库、引用、权限、审批、MCP、恢复六份证据串起来。真实生成、PDF、LoRA、推理容量与部署栏都是 `not_run`，不要预填分数。

## 🧯 走神救援

只做一件事：选“有引用是否等于答案正确”，读短回答，再打开 core.py 的 validate_citations。用一句话写下“它核验出处，语义支持仍需复核”。今天停在这里也算完成一个边界；下次从当前卡片 ID 继续。

## 接下来去哪

回到 [17b 交付项目](17b-企业知识助手交付项目.html)串起证据；到 [17c 岗位专项](17c-岗位专项与进阶实验.html#jd)把 JD 转为可展示产出。产品调用、身份、限流和排查分别复习 [AI全栈 04](../AI全栈/04-调用层.html)、[08](../AI全栈/08-认证会话与多租户.html)、[12](../AI全栈/12-限流配额与成本护栏.html)、[15](../AI全栈/15-可观测性.html)。不必同时启动六条路线。
