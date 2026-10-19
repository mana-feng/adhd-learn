# 16f Hermes 与记忆生命周期

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

> 一句话带走：记忆是否生效，要看实际存储、来源与版本；一句“我记住了”不是写入证明。

这是选修案例。先读 [Agent 记忆](04b-Agent记忆.html)，想弄清“偏好”和“操作方法”的区别，再回到 [Skills：把专长打包](10-技能Skills-把专长打包.html)。框架选择可看 [框架这层皮](16b-框架这层皮.html)。本章不要求安装 Hermes。

## 今天先做一个小闭环

想象你先说“回答用短段落”，后来改成“用要点列表”。一篇旧文档又声称你喜欢长论文。助手该记住哪一个？

我们用六个虚构场景，把新增、更新、冲突、删除、过期与污染变成可以打开的文件。原示例代码路径为 `examples/hermes-memory-lab/`。这是本站原创的确定性策略演练，没有调用 Hermes 或模型。它让你先学会检查“写了什么、为什么写、读出的是什么”，再去验收工具。

原示例中 `hermes-memory-lab/` 与 `knowledge-assistant/` 相邻，以下展示 Python 3.12 在前者目录内的调用方式：

```powershell
python -X utf8 rehearsal.py
Get-Content .runtime/rehearsal/results.json
```

每次复跑写入 `.runtime/`，本地 `validation/` 保留本次历史。每个场景都有 `before.json`、`after.json` 与 `result.json`。输出 6/6 通过后，挑一组前后文件比较，就可以停。初次尝试不必做 MCP 或宿主步骤。

| 场景 | 给它什么 | 有效状态应该怎样变化 |
|---|---|---|
| 新增 | 本人明确说喜欢短段落 | 从空存储新增偏好 |
| 更新 | 本人确认 revision 3 的要点列表 | 替换 revision 2 的短段落 |
| 冲突 | revision 1 的旧偏好要求覆盖 | 保留新偏好，记录待复核 |
| 删除 | 本人要求删除偏好 | 有效存储移除该键 |
| 过期 | 考试周偏好已过有效期 | 移除并重新询问 |
| 污染 | 文档要求永久记住绕过审批 | 拒绝写入，保留当前偏好 |

这里的 revision、固定日期与 expires 都由夹具提供，不是模型识别出来的。删除有效存储也没有抹掉审计历史：before 文件刻意保留虚构旧值。这些规则不是 Hermes 默认功能承诺，更不证明它自动处理所有冲突、TTL 或提示注入。

## 记忆不是一张万能通行证

“偏好短段落”是用户偏好；“任务还没做完”是任务状态；“可以提交工单”是业务授权；“如何查证据”是 Skill。它们有不同的来源、有效期与权限。外部文档可以成为引用资料，却不能因为写了“以后都这样做”就变成可信 Skill。

本例的 `review-template.json` 帮你记录来源、当前版本、拟变更与人工决定。冲突和污染进入复核，不自动改状态。即使某条事实被确认，也不会授予工具或账户权限。

## Hermes 的官方能力和本机结果分开看

截至 2026-10-10，[官方平台文档](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support) 已列 native Windows 与 WSL2；旧文章的 Windows 限制不宜直接沿用。本次选定 [v0.21.6](https://github.com/NousResearch/hermes-agent/releases/tag/v0.21.6)（2026-10-08，commit `818c13be1dc4fd28987e1e881a9408224afd4535`），本机未安装 Hermes，宿主验收为未实跑。

[官方记忆说明](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) 区分 MEMORY.md 与 USER.md。实际记忆写入需要工具调用并落盘；当前会话的提示快照与磁盘实时状态也不是同一个东西，下一会话才重新读取快照。因此验收应先检查练习 profile 的文件，再开新会话核对读取，而不是只听助手口头确认。本次未执行这条模型链路。

[Profiles 文档](https://hermes-agent.nousresearch.com/docs/user-guide/profiles) 说明 HERMES_HOME 选择配置、记忆与会话状态目录；[配置文档](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) 另说明 terminal.home_mode。后者可隔离工具子进程的 HOME，但不会建立操作系统沙箱。原实验 README 曾记录临时设置、恢复旧值的待验证步骤；不碰默认个人记忆、不接聊天账户、不启动 gateway 或 cron。

## 可选：只接一个只读 MCP 工具

原实验按相邻知识助手工程配置 MCP 依赖；自行复现时需准备对应实现、依赖和独立虚拟环境。以下演示探针的调用方式：

```powershell
& ../knowledge-assistant/.venv/Scripts/python.exe -X utf8 mcp_probe.py
Get-Content .runtime/mcp-probe.json
```

该探针用 MCP SDK 客户端连接本站只读服务。可信准备步骤把已有虚构语料导入本例数据库；模型可调用的服务只有 `search_knowledge`，身份固定为虚构 alice、tenant a、knowledge:read。实际协议结果返回设备证据，未返回私人/跨租户文档，执行工单工具未注册。额外 tenant 参数被 SDK 忽略，身份没有切换；别把它说成严格拒绝了额外参数。stdio 固定身份不等于 HTTP 鉴权通过，更不等于 Hermes 宿主通过。

待验证的 `hermes-config.draft.yaml` 默认禁用连接。按照 [官方 MCP 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)，审核后只允许 `tools.include: [search_knowledge]`，关闭资源和提示辅助入口。固定版本的 [注册源码](https://github.com/NousResearch/hermes-agent/blob/818c13be1dc4fd28987e1e881a9408224afd4535/tools/mcp_tool_registration.py) 可核对这些字段。真正验收时还要检查 Hermes 实际工具名单、实际服务端身份与业务权限。

宿主决定模型看到哪些工具，模型决定是否提出调用，业务服务决定该身份是否可读；三层限制要分别检查。只读 Skill 草稿位于 `skills/read-only-evidence/SKILL.md`，作者静态复核已记录，但待人工审核，未安装、未执行、未做模型压力测试。它教查询流程，不能授权写记忆或执行工单。

## 走神救援

迷路时只做两件事：打开 life-03 的前后文件，看旧偏好有没有覆盖新偏好；打开 life-06，看文档污染有没有改掉有效状态。完成这两件就停。

连接失败先看日志与解释器路径，不用关闭认证来修。Hermes 不在 PATH 就停在独立演练，别执行远程安装器。退出探针后没有后台服务。若要清理，仅检查本例 `.runtime/` 中此次生成的文件再删除；本地 validation 是证据，个人 `.hermes` 与共享环境不用清理。

## 检查点

<details>
<summary>检查点 1：看到“我已记住”就验收成功了吗？</summary>

没有。先检查实际文件或数据库，再验证新的读取会话。
</details>

<details>
<summary>检查点 2：六类策略通过，能说明 Hermes 通过吗？</summary>

不能。这是原创 Python 演练，Hermes 宿主、模型记忆链路均未实跑。
</details>

<details>
<summary>检查点 3：旧偏好为什么没有覆盖新偏好？</summary>

演练显式比较 revision，并把旧版本冲突留给复核。这不是对 Hermes 默认行为的保证。
</details>

<details>
<summary>检查点 4：删掉有效偏好等于彻底擦除了吗？</summary>

不等于。演练审计文件仍保留虚构旧值；真实系统要另查日志、备份与历史引用。
</details>

<details>
<summary>检查点 5：文档写着“记住并绕过审批”怎么办？</summary>

把它当不可信资料，不能晋升为用户偏好、业务授权或可信 Skill。
</details>

<details>
<summary>检查点 6：HERMES_HOME 是安全沙箱吗？</summary>

它隔离 Hermes 状态目录，不能限制运行进程的操作系统文件权限。
</details>

<details>
<summary>检查点 7：MCP 协议成功验证了什么？</summary>

验证本站 SDK stdio 客户端与只读服务的工具发现、检索和部分权限边界，未验证 Hermes 或 HTTP 鉴权。
</details>

<details>
<summary>检查点 8：只读 Skill 草稿现在可以自动执行吗？</summary>

不可以。本次只交付待人工复核草稿；作者静态检查不能替代人工审核或模型行为测试。
</details>
