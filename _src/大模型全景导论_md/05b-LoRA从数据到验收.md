# 05b｜LoRA：从数据到验收

> 本章给出数据、训练与保存重载的验收契约。完整实验工程与运行记录未随本站分发；以下命令是调用方式示意，不能在空目录直接运行。需先自行实现对应脚本并准备数据与环境。

> 一句话带走：数据能被训练、适配器能被重载、任务真的变好，是三道不同的门。

你看到 loss 下降，很容易想宣布微调成功。先缓一缓：模型也可能只记住了训练集，或者正在学习错误的角色标记。本章陪你把一段虚构设备报修文本变成三个 JSON 字段，留下能检查的证据。

本章示例目录记作 `examples/lora-lab/`，使用独立于知识助手的环境。14 条原创英文样本按来源簇划分：训练8条、开发2条、未见验收4条。设备问题映射成 `power/noise/network/display`，对应 `check_power/inspect_mount/check_cable`。这是教学练习，不是维修建议，也不能用14题证明生产能力。

**验证边界：** 本页不提供可复核的训练成绩。训练、反向传播、保存重载、任务提升与 QLoRA 均需在自己的环境实跑并记录，不能从以下命令推定已通过。

## 停止点一：先看模型到底会学哪几个 token

原数据练习使用独立环境与 `requirements-data.txt`，通过 `prepare_tokenizer.py` 准备 tokenizer，将 `LORA_TOKENIZER_DIR` 指向 `.runtime/tokenizer`，再测试并调用：

```powershell
python data.py --data dataset/train.jsonl dataset/dev.jsonl dataset/test.jsonl --tokenizer .runtime/tokenizer --report .runtime/data-report.json
```

输入契约有 `id/source_group/split/messages`。来源簇不能跨分割；标准化问题相似度达到0.9也会被拒绝。近重复检查只能抓明显相似，读者仍要人工核查“同一原文改写”这种语义泄漏。

聊天模板来自真实 tokenizer。编码完整文本一次，通过字符offset找到最终assistant回答，前面角色和上下文标签设为 `-100`；这些token参与上下文计算，却不直接承担这次loss。报告中的 `loss_text` 能让你亲眼看到训练目标。这里官方模板的回答末尾是 `<|im_end|>` 加换行，所以不能假定“最后一个token一定是EOS”。应实际检查模板编码后的结尾与监督边界，不能把换行或角色标记误当作回答。

任何样本超出256token，整条拒绝。练习选择让人明确缩短样本，而不悄悄截断答案。打开 `.runtime/data-report.json`，找一条目标，确认用户问题没有混进loss_text，再继续。

<details><summary>检查点 1：为什么按来源簇分割？</summary>

同一案例的改写出现在训练和验收中，会让记忆看起来像泛化。来源簇与近重复检查共同降低泄漏，仍不保证没有语义重复。

</details>

<details><summary>检查点 2：-100表示模型看不见这些token吗？</summary>

不是。它们仍是上下文，只是不计入目标损失；因果语言模型内部会移动预测与标签的对应位置。

</details>

<details><summary>检查点 3：换一个模型能照搬模板吗？</summary>

不能。重新取它自己的tokenizer模板，检查生成前缀、最终assistant内容和特殊token，边界无法验证时拒绝训练。

</details>

## 停止点二：资源够，再付训练成本

候选基座为 Apache-2.0 的 `HuggingFaceTB/SmolLM2-135M-Instruct`，锁定commit `12fd25f77366fa6b3b4b768ec3050bf629380bac`。官方文件元数据报告权重约269MB；这不是训练内存预算。模型卡主要语言为英文，练习也采用英文，不据此宣称中文能力。

`requirements.txt` 列出候选组合：torch2.5.1、Transformers4.46.3、PEFT0.13.2、accelerate1.1.1；这是一组历史候选版本，不是当前环境的兼容性保证。先安装到独立环境，再运行：

```powershell
python train.py --config config.json --data dataset/train.jsonl --output .runtime/adapter
```

入口先检查全部冻结语料，再检查可用RAM至少4GiB及版本，然后才导入torch、下载精确revision。4GiB只是保守启动门槛，不保证训练峰值够。默认CPU/float32，GPU未核实。不要终止用户进程来凑资源；资源不足就停在已经完成的数据练习。

LoRA只更新附加的低秩参数。代码要求每个target_modules名称匹配，且可训练参数非零；保存参数数量、loss、精度、时间和CUDA峰值（CPU时为null）。当前手工循环只支持batch_size=1，累计4个样本更新一次，最后不足4个按实际样本数归一化。QLoRA不是把某个开关改成true就完成；本入口明确拒绝量化配置，另做硬件与平台验证后再开实验。

<details><summary>检查点 4：为什么269MB权重仍可能跑不动？</summary>

还需要展开后的权重、激活、梯度、优化器状态、运行库和其他进程空间；下载大小不能代替RAM/显存峰值证据。

</details>

<details><summary>检查点 5：target_modules写错为什么要立即失败？</summary>

模型内部名称不同，错名可能使预期适配器没有注入。命中模块、参数非零是工程前提，不代表任务质量已通过。

</details>

## 停止点三：在新进程里验收

保存成功后关闭训练进程，再运行：

```powershell
python evaluate.py --config config.json --adapter .runtime/adapter --output .runtime/comparison.json
```

manifest保存基座名/revision、语料/配置/tokenizer/模板哈希、固定探针输入与生成token。评测在新进程加载精确基座和适配器，拒绝身份或哈希不一致；固定探针要求同精度greedy生成的token完全一致。这个严门槛是本练习的选择，跨平台不一致需要重新调查，不能删掉检查。

接着同题同解码跑原始基座、强提示词、LoRA三条路线。逐题保留输出、JSON有效性、字段正确数、严格任务正确、时间，再检查算术与常识两道通用回归题。预先冻结门槛：LoRA严格正确率至少75%，严格超过两条基线，通用回归不下降；自动结果仍需人工看失败样本和回归输出。两道回归题覆盖极窄，不能替代真实部署评测。

如果提示词更好，就保留这个结果。loss下降、运行变快、任务正确是三个不同指标。本次没有三条路线实际输出，所以质量状态只能是“未验收”；下一次有效证据应是反向传播日志、新进程token重载一致记录和全部未见题比较。

<details><summary>检查点 6：适配器目录存在，为什么还不算完成？</summary>

适配器依赖对应基座；目录存在不能证明基座revision正确，也不能证明新进程重载输出一致。

</details>

<details><summary>检查点 7：loss下降、验收正确率不变，该选哪个结论？</summary>

只报告训练loss下降。未见题没有提升，就不能宣称任务成功；检查失败样本而不调换验收题。

</details>

<details><summary>检查点 8：通用题都通过，是否不会遗忘？</summary>

只能说明这两题没有观察到回归。扩大通用、边界和业务样本后才有更强证据。

</details>

## 走神救援

现在只做一个动作：回看本章对 `loss_text` 的说明。你能解释它与用户问题的边界，今天的数据停止点就完成了。若环境报缺Jinja2，补数据依赖；若内存、版本或GPU检查失败，记下原始错误并停在这里。不要下载更大的模型“试试看”，不要跳过检查制造成功截图。

下一条路线：数据分割看[私有评测集怎么建](11b-私有评测集怎么建.html)，显存与精度看[量化](../AI基础设施/18-量化.html)，偏好优化看[对齐与 AI 安全](12-对齐与AI安全.html)；这些路线不能代替本实验的保存重载验收。

官方来源（查阅2026-10-10）：[模型卡与许可](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)、[Transformers4.46.3聊天模板](https://huggingface.co/docs/transformers/v4.46.3/chat_templating)、[PEFT0.13.0 LoRA接口](https://huggingface.co/docs/peft/v0.13.0/package_reference/lora)、[PEFT checkpoint格式](https://huggingface.co/docs/peft/developer_guides/checkpoint)。示例代码自行编写，未复制语雀案例或成绩。
