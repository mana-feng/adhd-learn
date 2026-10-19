# 16e · LangChain 同题实作

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

一句话带走：LangChain 替你组织模型与工具的消息循环，身份、权限、幂等和审批仍由业务代码保证。

这一节接在 16b 的框架讨论和 16d 的恢复实作之后。我们继续问「XR-200 的额定功率是多少」，再要求保存一个工单草稿。题目与资料不换，只在已有知识助手外面加一层 `create_agent`。你可以先停在能力表；想亲手拆开消息循环，再运行下面的实验。

## 同一件事，三层各做什么

| 能力 | 裸循环 `agent.py` | LangChain 适配层 | 已有 LangGraph 恢复示例 |
|---|---|---|---|
| 模型与工具循环 | 项目自行组织 | `create_agent` 组织消息与工具调用 | 图节点表达步骤 |
| 业务权限 | `core/workflow` | 仍调用同一 `core/workflow` | 仍调用业务规则 |
| 持久化 | 业务 SQLite 保存草稿等状态 | 本例未配置 checkpointer；不能跨进程恢复消息循环 | 已有示例用 SQLite checkpointer 保存图状态 |
| 审批 | `workflow` 验证审批 | 只提供草稿工具，没有审批或执行工具 | 图中断/恢复与业务审批共同工作 |

这不是三者的速度或准确率排行榜。LangChain 内部也建立在 LangGraph 上；这里比较的是我们实际接入的能力。图保存到某一步，不代表对应业务动作已经获准执行。

## 先看模型拿到什么

新增文件是框架适配器（`examples/knowledge-assistant/langchain_adapter.py`）。调用方从可信认证结果取得 `Identity` 和稳定的 `operation_id`，再调用：

```python
agent = build_agent(db, identity, operation_id, model)
result = agent.invoke({"messages": [{"role": "user", "content": "XR-200 的额定功率是多少？"}]})
```

模型仅能填写两个工具的业务字段：

```text
search_knowledge(query: str) -> dict
draft_ticket(title: str, body: str) -> dict
```

闭包把可信身份传给 `retrieve`，把同一操作编号传给 `workflow.draft`。Schema 开启严格类型与禁止额外字段，因此模型塞进 `tenant`、`subject` 或 `operation_id` 会产生工具参数错误。这里没有 approve/execute 工具；提示词之外还有可执行的能力边界。调用方本身必须可信，适配器不是认证服务。

## 跑一遍可控实验

原实验在父项目目录中进入示例目录，使用独立 Python 3.12 环境：

```powershell
cd examples/knowledge-assistant
python -m venv .venv-langchain
.venv-langchain/Scripts/python.exe -m pip install -r requirements-langchain.txt
.venv-langchain/Scripts/python.exe test_langchain_adapter.py --events .runtime/langchain-events.json
```

2026-10-10 实跑环境为 Python 3.12.14、Windows 11，LangChain 1.4.4、langchain-core 1.6.9、LangGraph 1.2.11、checkpoint-sqlite 3.1.1。10 项契约测试通过，`pip check` 无依赖冲突；完整版本在 `validation/langchain-freeze.txt`。实验使用真正的 `create_agent` 与确定性 `BaseChatModel` 夹具，不连接收费 API、不下载模型。

夹具预先安排模型输出的工具调用。框架仍真正解析消息、验证参数、调用工具，并把 `ToolMessage` 回送给模型；这能验证接口与边界，但不能验证自然语言理解、回答质量或真实模型面对提示注入时的表现。

此处可停：能指出搜索和草稿最终落在哪两个业务函数里，就已经理解这层适配器的作用。

## 看一次参数失败，再看一次幂等重放

在 `test_invalid_parameter_is_error` 中，夹具给 `draft_ticket` 传入整数 `title=123`。严格 Schema 拒绝它，消息历史出现 `status="error"` 的 `ToolMessage`，数据库中没有草稿。参数错误可以回到模型让它修正；业务拒绝与预算失败则直接抛出，适配器不把失败伪装成成功答案。

在 `test_duplicate_draft_is_pending_and_idempotent` 中，夹具连续两次发出相同标题、正文与不同 tool call ID。两次结果返回相同 `run_id`，数据库只有一条 `runs`，状态为 `pending`，`tickets` 为零。再用裸 `workflow.draft` 重放同一操作，仍返回相同 `run_id`。去重来自业务指纹与操作编号，不是框架认出了重复语言。相同编号换正文，会抛出 `idempotency_key_conflict`；不能为“重试方便”偷偷换编号。

本次历史原始输入、实际消息与异常（`examples/knowledge-assistant/validation/langchain-events.json`）作为历史实验材料保留在本地。上面的复跑命令另写到 `.runtime/`，保留历史记录。权限案例确认私有薪酬与其他租户文档未进入证据；恶意文档案例先检索到 poison 文档，再强行调用不存在的 execute，框架给出非法工具消息，数据库没有工单。这证明本例没有暴露执行能力，不证明真实模型不会听从恶意文档。

## 预算与走神救援

默认每次调用最多 4 次模型调用、6 次工具调用、10 秒协作时间预算，并附带图递归上限。每次 invoke 重建预算状态，重复调用不会共享计数。超预算明确抛出 `BudgetExceeded`。

时间检查发生在同步模型/工具调用前后，不能硬中断已经卡住的请求。接真实模型时还要配置供应方超时、并发限制与取消机制。发生参数错误，先读 error ToolMessage；发生业务拒绝，查 caller scope 和操作编号；发生超预算，保留事件后停止，不通过无限加轮次掩盖问题。依赖安装失败则回到标准库 demo，本节是选修，不影响前面的学习路径。

真实模型生成未实跑，跨进程恢复也不属于本适配器验收。需要恢复时回看 16d；不要把这个可控契约实验写成模型质量报告。

## 折叠自查

<details><summary>检查点 1. 模型可以替换 tenant 吗？</summary>不能。工具 Schema 禁止额外字段，业务调用使用闭包中可信 Identity。</details>

<details><summary>检查点 2. 搜索结果是否与裸调用一致？</summary>同身份、同查询比较 context；elapsed_ms 是运行计时，不要求相同。</details>

<details><summary>检查点 3. 草稿是不是已经创建远程工单？</summary>不是。返回 pending，本实验 tickets 始终为零。</details>

<details><summary>检查点 4. 谁处理相同操作的重复调用？</summary>workflow 的操作编号和指纹。框架只组织调用消息。</details>

<details><summary>检查点 5. 参数错误和业务拒绝有什么不同？</summary>前者形成 error ToolMessage；后者抛出 Rejected，调用方必须处理。</details>

<details><summary>检查点 6. 10 秒是否能杀掉卡住的网络请求？</summary>不能。这是操作间协作检查，还需要供应方网络超时。</details>

<details><summary>检查点 7. 可控模型通过能说明回答准确吗？</summary>不能。夹具安排了输出，测试的是契约与业务边界。</details>

<details><summary>检查点 8. 这个适配器能跨进程恢复吗？</summary>本例没有 checkpointer。恢复实作看 16d，审批仍须业务验证。</details>

## 官方资料与版本界限

接口核对日期：2026-10-10。官方 [Agents](https://docs.langchain.com/oss/python/langchain/agents) 说明 `create_agent`、模型实例、工具与 middleware 的入口；[Middleware](https://docs.langchain.com/oss/python/langchain/middleware/overview) 介绍循环扩展；[LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence) 解释 checkpointer。代码还读取了安装版本的实际函数签名。升级后先重跑契约题，再谈兼容，不依靠旧教程的 import 名称猜测。
