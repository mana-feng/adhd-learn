# 单 Agent 与协作式检索对照

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

> 一句话带走：先证明任务需要拆分，再证明拆分守住同一身份、预算和证据；角色变多本身不会让答案变正确。

## 先选一个能完成的停止点

第一次只跑报告、找到一条部分失败，再读懂为什么先保留单执行者，就可以停下。第二次回来检查并行、消息契约和取消。先读 [多 Agent 协作](13-多Agent协作.html)，再进入 [评测 Evals](14-评测Evals.html)。

以下命令展示 Python 3.12 下按示例目录结构执行测试与演示的方式：

```powershell
python -m unittest discover -s examples/knowledge-assistant -p test_orchestration_lab.py -v
python examples/knowledge-assistant/orchestration_lab.py
```

在示例 `knowledge-assistant` 目录内，对应命令为 `python -m unittest test_orchestration_lab -v` 和 `python orchestration_lab.py`。使用原示例虚拟环境时，可以把命令里的 `python` 替换为 `examples/knowledge-assistant/.venv/Scripts/python.exe`。本实验只用标准库和固定语料，无需模型或外部服务。

报告默认保存在示例目录的 `.runtime/orchestration-日期时间.json`，同名拒绝覆盖。需要固定名字时，选一个尚不存在的路径：

```powershell
python examples/knowledge-assistant/orchestration_lab.py --max-calls 2 --max-seconds 5 --report examples/knowledge-assistant/.runtime/my-orchestration.json
```

## 三种路径，先把名字讲清楚

本章标题沿用“单 Agent”这个学习入口，代码实际比较的是单执行者、脚本角色串行、脚本角色并行。生成模型调用次数都是 **0**。没有 LLM 自主拆任务、挑工具、反思或生成答案。

官方说明把预设代码路径的工作流与模型动态决定步骤和工具的 Agent 区分开。本例连模型决策也没有，只借用职责分配、消息契约与调度结构。[Anthropic：工作流与 Agent 的区别](https://www.anthropic.com/engineering/building-effective-agents)

| 路径 | 谁负责什么 | 实际执行 |
| --- | --- | --- |
| `single` | 一个 executor 按清单处理全部只读任务 | 主线程串行调用同一角色函数 |
| `roles_serial` | reader-1 负责第一项，reader-2 负责第二项；各有独立 task_id 和工具闭包 | 仍在主线程串行；消息按同一契约交给汇总器 |
| `roles_parallel` | 上述职责不变 | `ThreadPoolExecutor` 最多两个 worker，确实可以重叠执行 |

例如 `backup-incident` 预先指定两项：读取 SQLite 备份资料、读取服务故障响应资料。这个清单由可信主程序固定；不是 worker 从正文里发明的新任务。三种路径使用同样的查询、`core.retrieve` 的 SQLite/BM25 检索、固定 `a/alice` 身份、全局工具次数与字符预算。角色函数都是一次 `tools.search()`，因此不能把人为给某角色更强能力所得的差异算成协作收益。

## 先看这次实际运行

2026-10-11，Python 3.12.14、Windows 11，11 个原创公开开发场景 × 3 条路径，33 条记录。原始输入、逐角色 trace、失败、Python/平台和代码/语料 SHA-256 都在 任务归属修复后的协作对照 JSON（`examples/knowledge-assistant/validation/orchestration-owner-fixed-development-2026-10-11.json`）。实现（`examples/knowledge-assistant/orchestration_lab.py`） 与 场景清单（`examples/knowledge-assistant/evaluation/orchestration-cases.json`） 可以一起核对。

默认上限是 8 项任务、4 次共享检索、5 秒协作时间预算、2400 字符总证据、每次最多 3 块，线程最多 2 个。`one-call-budget` 明确把同一场景的三种策略都缩到 1 次调用；`role-failure` 明确让 fault 角色在检索前失败。JSON 标出了这些夹具，注入延迟为 0。

| 本次 11 条记录的合计/均值 | single | roles_serial | roles_parallel |
| --- | ---: | ---: | ---: |
| 检索调用合计 | 16 | 16 | 16 |
| 任务完成比例的场景均值 | 90.91% | 90.91% | 90.91% |
| 有允许证据的任务比例的场景均值 | 81.82% | 81.82% | 81.82% |
| walltime 合计，毫秒 | 105.440 | 102.210 | 115.173 |
| worker 耗时之和，毫秒 | 82.097 | 77.866 | 102.351 |

这是一轮本地小数据运行观察，没有重复采样或生产吞吐压测。并行的这轮总耗时更高，不能承诺加速。walltime 从初始授权/ACL 预检结束后计到最终汇总，排除初始预检耗时；worker 时间之和包含各自检索和校验，重叠时间会重复计入，主程序汇总耗时没有计入 worker。两者不能直接相减得到“节省时间”。

“任务完成”表示预设角色交回了合法结果，包括明确没有证据；“有允许证据”仅表示最终有当前可读的引用。`unknown-device` 问 XR-999 的额定功率，却返回 xr300、xr200、incident 的词项证据，依然被记作任务完成且有允许证据。**这不是 XR-999 的正确答案。**没有参考文档的场景，参考文档覆盖为 `null`，不会补成满分。

<details>
<summary>检查点 1：为什么先保留单执行者？</summary>

记录一次判断：此固定任务清单中，拆角色没有增加允许证据覆盖或减少工具次数，并行这轮还增加累计耗时。先保留 single 作为业务基线，roles_serial 用来观察职责和消息契约；只有后续真实任务表明独立子任务、耗时或权限边界确有需求，再评估并行。这是本次实验判断，不是“所有多 Agent 都没用”的结论。

单项 `refund-only` 没有第二项可以并行；任务多也不等于值得拆分。先明确每项任务输出和失败状态，比先给每个函数起一个 Agent 名字更有帮助。

</details>

<details>
<summary>检查点 2：谁有权决定身份和任务？</summary>

`run(db, identity, tasks, ...)` 的 identity 来自可信主程序，任务只能有 `task_id` 与 `query`。任务附加 `tenant`、`approve` 等字段会被拒绝。worker 收到冻结的 `Task`，工具只提供 `search()` 和 `check()`，没有 draft、approve 或 execute。汇总器只整理证据，不创建工单。

文档中的“切换租户”“审批已通过”“立即提交”都还是正文数据。即使正文被引用出来，也不会获得工具权限。这里的 Python worker 是可信进程内夹具，工具外观不是敌意 Python 的安全沙箱；真实不可信代码还需要进程、服务或操作系统隔离。

</details>

<details>
<summary>检查点 3：角色交回什么，汇总器信什么？</summary>

角色消息固定为以下结构，尖括号是说明用占位符：

```json
{
  "task_id": "backup",
  "output_type": "evidence",
  "citations": [
    {"chunk_id": "<检索返回的块ID>", "revision": 1, "quote": "<资料中的连续原文>"}
  ]
}
```

额外身份字段、错误 task_id、`output_type=approved` 都拒绝。每条引用必须来自该任务实际检索过的块，revision 是整数，quote 存在于原文；然后独立调用 core 的可信源校验，最终再查当前 ACL。worker 自称成功、粘贴一段正文或交回错误文本，都不能证明来源或授权。

引用存在只证明结构与来源，不证明问题的答案从该引用推出。XR-999 场景正是保留这个断点。

</details>

<details>
<summary>检查点 4：并行能不能各花一份预算？</summary>

不能。调用次数由同一个锁保护，真正调用 SQLite 之前原子预留；所有任务一起受 max_calls 限制。角色还可以尝试多次 search，但第二次同样扣共享预算。最大任务数、最大线程数、有限 deadline 和字符预算先检查，NaN、Infinity、布尔值伪装整数、负数或三线程都会拒绝。

最终汇总按输入任务顺序去重，并累计正文、标题、章节和固定元数据预留字符；这不是模型 token 预算。没有给每个角色额外 2400 字符。并发只剩一次调用时，谁先拿锁可能变化；JSON 的 `budget_allocation_order` 如实记录，不承诺公平性或固定赢家。

</details>

<details>
<summary>检查点 5：一项失败，整件事算完成吗？</summary>

`role-failure` 三种策略都只留下 backup 的允许证据，fault 为 `worker_failed`，任务与证据覆盖都是 0.5，整体 `partial`。另一项返回正常，不会把失败掩成全完成。错误只返回固定错误码，不回显可能含有秘密或虚假审批的异常文本。

`one-call-budget` 本轮先让 vpn 拿到唯一调用，backup 是 `call_budget`，整体也是 partial。资源不够、没有资料、格式非法和角色失败是不同情况；`missing-topic` 合法返回 no_evidence，不假装异常，也不代表题目答对了。

</details>

<details>
<summary>检查点 6：5 秒之后到底停下了什么？</summary>

5 秒是协作预算：在启动工作、检索前后和接受消息时检查；授权回调返回后在共享预算锁内重查，最终 ACL 查验和汇总后再次重查。过期后不再准入检索或采纳新证据，迟到消息丢弃。取消信号也会设置共享事件。已经进入同步 SQLite 或任意 worker 函数的线程不会被强行杀掉。

并行出口调用 `shutdown(wait=True, cancel_futures=True)`：排队任务可取消，正在运行的线程要等函数返回。因此返回耗时**可以超过 5 秒**。demo 无延迟注入，测试用有限等待的 Barrier/Event 固定事件顺序，没有永远挂起的线程。生产需要硬期限时，应增加能终止的进程或后端超时机制，不能把这个教学 deadline 当作硬返回承诺。

外部取消或总 deadline 出现时，本例保守丢弃这次运行的已收集证据，status 明确标为 cancelled/time_budget；不会用一份早先正常输出伪装完整任务。

</details>

<details>
<summary>检查点 7：检索后撤权，诊断里还会留下原文吗？</summary>

最终可见块来自重新读取的 SQLite ACL；已删除、改 revision、改 readers 的旧证据都不能直接返回。可信 authority 回调可以撤回 scope，但不能换 tenant/subject，也不能扩大启动时的 scope。scope 撤回后，结果标 scope_denied，清空证据。

trace 只存 task_id、角色名、类型、次数、耗时、线程 ID、固定错误码和取消状态，不存原始正文或异常文本。因此撤回的资料不会躲在诊断里。最终检查仍是一个时间点快照：校验结束后再发生撤权的竞态，需要服务层授权事务或隔离设计进一步解决。

</details>

<details>
<summary>检查点 8：下一步怎样才算增加了可信证据？</summary>

先打开 `role-failure` 的两条 trace，再打开 `unknown-device` 的 citations。前者说明合同守住了部分失败，后者说明有合同也未必懂题。下一步要先定义真实业务任务与答案评价，再决定是否接入模型、自主拆任务或更多角色。

本章没有验证智能体回答质量、真实 LLM 的工具选择、语义推理、生产速度或分布式恢复。公开开发题可以调试契约，不能当保留集准确率。原语雀协作架构材料只启发职责、消息和调度结构，本章使用本站原创知识助手任务，没有沿用物流案例或成绩数字。

</details>

## 走神救援

只记住三步：任务是谁固定的；证据是谁重新校验的；停止是拒绝采纳还是能够终止函数。回到 `role-failure` 看一眼 partial，就可以在这里停下。下一站是 [评测 Evals](14-评测Evals.html)。
