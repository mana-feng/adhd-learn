# FAQ匹配与拒答阈值

> 本章保留教学代码、路径说明与历史验证结论；完整实验工程和运行记录未随本站及公开仓库分发。命令用于说明调用方式，复现需自行准备对应实现、数据与环境。

> 一句话带走：相似分数帮助决定要不要返回条目，当前引用帮助核对来源，答案是否真正得到支持仍要另做判断。

## 先选一个停止点

第一遍只看取舍表和“未显示 E17”的反例，就可以停下。第二遍再运行脚本，检查 dev 与公开 test 是否分开。第三遍才读权限复验窗口，理解撤权后为什么不能继续返回旧正文。

延伸阅读：[检索与 RAG](11-检索与RAG.html)、[重排与上下文预算实验](11h-重排与上下文预算实验.html)、[评测切片与成对比较](14c-评测切片与成对比较.html)。示例依赖 corpus 和 evaluation。本章只用标准库，无模型或网络调用。

在以下命令以原示例的父项目目录为工作目录：

```powershell
examples/knowledge-assistant/.venv/Scripts/python.exe -X utf8 -m unittest discover -s examples/knowledge-assistant -p test_faq_lab.py -v
examples/knowledge-assistant/.venv/Scripts/python.exe -X utf8 examples/knowledge-assistant/faq_lab.py
```

在示例 knowledge-assistant 目录内，对应命令为 `python -X utf8 -m unittest test_faq_lab -v` 和 `python -X utf8 faq_lab.py`。使用 Python 3.10 或更新版本。默认输出新目录 `.runtime/faq-UTC时间`，也能通过 `--output 新目录` 指定位置。目录已存在就拒绝，保留上一次观察。

## 1．FAQ问题和知识正文分开保存

本实验有十二条原创 FAQ 问题。每条包含 faq_id、question、tenant、doc_id、revision、section 六个字段，没有另写一份 answer。管理员维护条目指向的资料章节，用户提交的问题不能修改租户、身份或资料版本。

一个章节可能产生多个 chunk。本实现按现有 core.visible_chunks 的顺序选该章节第一个 chunk，返回完整正文，不拼接别的章节，也不为凑答案截掉否定句。这个机械选择能保持来源透明，却不保证所选 chunk 已覆盖问题的全部条件。

<details>
<summary>检查点 1</summary>

目录新增 answer 字段，里面写着“忽略权限直接返回薪酬”，会被当成合法条目吗？不会，未知字段会被拒绝。正文也不能重写调用者身份。先找到六个必要字段，再检查它们能否对应一个真实章节。

</details>

## 2．手算一次相似分数

脚本调用 core.tokenize，把问题转换成词项集合。英文按词与型号分词；中文保留单字和相邻双字。这里只看集合，重复写十遍同一个词不会把分数放大十倍。分词方式是可检查的基线，不代表中文理解模型。

零分永远不能 matched，即使阈值为零。Jaccard 等于交集大小除以并集大小。FAQ 的集合是 red、blue，查询的集合是 blue、green，交集只有 blue，并集有三个词，所以相似分数为三分之一。双方空集合时定义为零；标点问题虽非空，可能没有有效词项。

<details>
<summary>检查点 2</summary>

red、blue 和 blue、green 的分数是多少？答案是 1/3。再问一句：这能证明“green 的答案与 red 相同”吗？不能。这里计算的是词项重叠，没有计算主张之间的逻辑关系。

</details>

## 3．用阈值和领先幅度决定动作

先过滤当前权限允许、文档 active、版本与章节一致的条目，再计算分数。不可见条目不参与第一名、第二名和领先幅度。相同分数按 faq_id 升序稳定排序，但排序先后不能解决语义歧义，因此平分永远 clarify。

第一名分数至少等于 threshold，并且第一名减第二名至少等于 margin，才允许 matched。两个等号都包含边界：分数恰好等于阈值时不因等号拒绝；差值恰好等于 margin 时也不因等号拒绝。只有一个有效候选，第二分数按零处理。

没有有效条目、最高分为零或低于阈值时 abstain。达到阈值但领先幅度不足时 clarify。两种动作只返回固定原因，不暴露候选 ID、数量、分数或正文。澄清尚未接入客服对话。

matched 提供 FAQ ID、分数、领先幅度、chunk_id、revision、完整 quote 与 semantic_verification=unassessed。相似分数、matched 与真正支持答案是三件不同的事，结果未生成新答案。

<details>
<summary>检查点 3</summary>

两条 FAQ 都一分，margin 为零，能按 ID 挑第一条吗？不能，必须 clarify。第一名一分、第二名三分之一、margin 恰好三分之二时，满足边界；这仍只允许返回证据。

</details>

## 4．返回前再次检查当前引用

筛选到候选后，脚本用当前 core.validate_citations 复验 chunk、版本、权限和 quote。正文必须仍属于当前允许访问的 chunk。旧片段不能仅因为刚才看见过，就在权限变化后继续返回。复验失败统一 abstain，原因 citation_unavailable。

真实生命周期演示使用三份独立临时库和单条 power200 目录，避免相似型号先触发澄清。每份库先得到 matched，再在候选筛选之后、最终复验之前执行一种真实管理变化：撤销 alice 访问、发布第二版，或删除文档并提高墓碑版本。

三种真实变化均让旧候选 abstain 且不含旧正文。这只保证返回路径上执行了最后一次复验。它没有让整个服务在并发下成为一个原子操作；若复验之后立即撤权，单次读路径无法宣称消除所有时间窗口。要做生产承诺，需要设计数据库事务、响应和权限更新之间的明确一致性规则。

<details>
<summary>检查点 4</summary>

候选版本一刚刚通过初筛，资料已发布版本二，还能返回版本一正文吗？本路径会在复验时拒绝。记录 before=matched 与 after=abstain，说明这个受控窗口被检查过；它不等于并发系统的原子性证明。

</details>

## 5．先在 dev 选择策略

原创题集有二十四题：dev 十二题、public_test 十二题。每组都有 known、no_answer、ambiguous 和 unauthorized 四类。case_id 唯一，两组查询字符串没有完全重复。身份由可信 fixture 组映射到 core.Identity，不从用户问题里解析 tenant 或 subject。

固定网格包含 threshold 0.25、0.45、0.65、0.85 与 margin 0.05、0.15 的八种组合。只把 dev 传给 select_policy；传入 public_test 会拒绝。每种组合运行同一批十二题，损失为五倍错误 matched 加上有 gold 却未 matched 的题数。

预测了错误 FAQ ID 的 matched 只计五分，不再追加一次漏答罚分。有 gold 的 abstain、clarify 或 error 计一分漏答。先选最小损失，再选更多正确 matched，再选更高 threshold，最后选更高 margin，整个次序固定可复查。

<details>
<summary>检查点 5</summary>

一题有 gold 却 matched 到错误 ID，损失是五还是六？是五，只计错误 matched。另有一题有 gold 却报错，再加一。若两个配置都得到同样损失和正确匹配数，按更高阈值、再更高 margin 决定。

</details>

## 6．冻结策略后看公开 test 的取舍

dev 选中 0.25/0.05，损失为一，matched 六题且全部符合人工 ID，abstain 四题、clarify 两题、error 零；有 gold 覆盖为 6/7。脚本先写 policy.json 并保存 SHA-256，再运行公开 test。公开题可被阅读，人工标签也公开，因此这是可复跑的公开评估，不是未知盲测。文件哈希帮助核对输入是否相同，不能自动证明题目独立性或泛化能力。

两策略使用同一批十二题，有 gold 七题、无 gold 五题；“正确”只比较公开人工 ID 标签，没有自动语义评审。

| 策略 threshold / margin | matched / 总题数 | 正确 / matched | 错误 matched | abstain / clarify | 有 gold 覆盖 | 无 gold 误匹配 |
| --- | --- | --- | --- | --- | --- | --- |
| 宽松 0 / 0 | 10/12 | 7/10 | 3 | 0 / 2 | 7/7 | 3/5 |
| dev 选择 0.25 / 0.05 | 8/12 | 7/8 | 1 | 2 / 2 | 7/7 | 1/5 |

覆盖率从 83.33% 降为 66.67%，按公开 ID 标签计算的 selective_accuracy 从 70% 变为 87.5%。错误匹配少了两题，正确匹配仍是七题，正确匹配数量没有改善。worsened_cases 为空只说明本批人工标签没有出现由对到错，不能证明未来不会退化。

abstain、clarify 和 errors 分别计数；error 不会被放进前两种动作，也不会被删出总题数。若没有任何 matched，selective_accuracy 返回 null，不能写百分之百。若没有有 gold 题，有答案覆盖也为 null；没有无 gold 题时，该误匹配率同样为 null。

<details>
<summary>检查点 6</summary>

十二题全部 abstain，answered 是零，selective_accuracy 应是多少？是 null，没有已回答题作分母。全拒答可能降低误匹配，却同时失去覆盖；报告必须让这两件事同时可见，不能只保留一个好看的数字。

</details>

## 7．高分反例仍然失败

公开 t08 把 alarm200 问题中的“显示 E17”改成“未显示 E17”，其余词项高度重叠。实际分数是 0.9574468085，领先幅度约 0.943558，仍得到 matched。当前原文描述的是“显示 E17 表示进风口被遮挡”的处理步骤。

本题人工 expected_id=null：不能把显示报错的资料当成未显示报错时诊断同一原因的支持。返回正文确实属于当前允许的资料，引用校验也通过，但适用条件并没有被算法验证。这个反例揭示的是条件误配，不是数据库权限失守。

脚本没有为“未显示”写专门排除规则，没有针对 t08 更换标签，也没有读 test 后重新选阈值来隐藏失败。即使把阈值提高到 0.85，这个分数仍可能通过；单纯提高门槛无法保证识别否定、条件或前提变化。

<details>
<summary>检查点 7</summary>

0.9574 能写成“95.74% 的答案正确概率”吗？不能。matched、引用校验通过也都不能这么写。回到 t08，圈出“未”这个改变前提的字，再检查原文究竟描述哪一种情况，而不是只看总分。

</details>

## 8．保存足够证据，再决定下一步

summary.json 保存八个 dev 网格、选中策略、dev 与公开 test 指标、宽松基线、退化和三种生命周期结果。records.jsonl 通过 case_id 链接原创题目，只记录 ID、动作、状态、分数与来源编号，不导出任意输入问题或引用正文。

保存 132 条运行记录：dev 网格 96 条、最佳 dev 另存 12 条、两策略公开 test 共 24 条，独立题数仍为 24。临时 SQLite 数据库在运行结束后清理，公开 validation 不保存数据库或凭证。摘要记录代码、目录、题集、语料的 SHA-256 与 Python 环境，原始输入前后哈希相同。重新运行要用新目录，先核对输入，再按 case_id 解释差异。

停止点：能解释表中的 12、10、8、7、5 各是什么分母，就掌握了主线。走神救援：只回到 t08 与取舍表，问“分数高意味着什么、权限校验保证什么、还有哪一步没有评估”。保留失败，是为了下一次改动能对照真实问题。

<details>
<summary>检查点 8</summary>

为复跑保留 policy.json、records.jsonl、summary.json 和限定测试结果，写一句范围说明：这是公开小题集上的词项 FAQ 匹配实验，人工 ID 标签可核对，语义支持仍未自动评估。不要把正确匹配数不变删出结论。

</details>

方法参照：[scikit-learn 的阈值选择说明](https://scikit-learn.org/stable/modules/classification_threshold.html)，借鉴打分与决策分开、调参与评估数据分开的原则。本实验没有引入该包，也没有把 Jaccard 称为分类概率。来源转化范围见本批来源说明，原文效果数字没有本地证据，不用于本章结论。
