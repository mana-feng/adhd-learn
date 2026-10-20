# 2026-10-20 既有课程模块打磨与维护交付

本轮范围为19个既有课程模块416个HTML及另计根Transformer专题1页。保留旧路径、ID、存储键、导航顺序与原工具；已提交的首页、ML/LLM、扩散、科学与智能体内容保持不变。

逐模块文件已发布Q01的10项PASS（9课程+根）及Q02的10课程CONDITIONAL_PASS；Q02条件仅为本地静态网站范围。Claude资料库续读补验发现的Q02-CL-02已由Q02在实际接入页闭合，独立完成320/390非首节保存、重载、沿书签返回及桌面/键盘/无JS检查；原FAIL与撤回签收历史保留。

内容修订涵盖数学/推理条件与答案一致性、编程对象/数组/SQL语义、验证与数据泄漏边界、工程重试和回滚、Mendix事务、硬件算术与安全协议边界、资料库元数据和来源说明。原有答案折叠、代码/图放大、公式解释与续读工具继续保留，不计为新功能。

发布资产为20份模块独立阅读CSS、3份必要独立续读JS与12份原生SVG。R/V释放证明资产就绪，独立验收由Q负责。最终签收文件及其SHA256如下；完整本地证据保留于output/site-polish-rollout-2026-10-20，不将基线、预览和截图大量纳入Git。

| 模块/专题 | HTML | 独立验收 | signoff文件SHA256 |
|---|---:|---|---|
| 机器学习的数学原理 | 20 | Q01 PASS | `6092364d02ed64b7ef2531dea2841378af6e08e7422f57449a5d9b7aae10719e` |
| 不靠数据的AI | 23 | Q01 PASS | `76c5191efc91167667e8f250254385bc12a79534e571e439bf3e89ccf49bbd82` |
| 博弈论与集体决策 | 30 | Q01 PASS | `b7f08c15b3b72292b2f6c41b13be34a8336f354572b4aed1029f1e39d3c237e3` |
| 强化学习基础 | 18 | Q01 PASS | `3650c61bc6d61aa520bd673ea791593a064abdf0165f168ca8dc94552c319bf1` |
| Python会咬你的地方 | 13 | Q02 CONDITIONAL_PASS | `1370719ca83d15d59e8b0f54c2dd42678295951732abacd355aee75fb5c073f5` |
| NumPy与向量化思维 | 14 | Q02 CONDITIONAL_PASS | `abaf1ff7723bc03e7504efc7fe2cc051223ff347d2298212e200b43b6dc9a4ed` |
| SQL查询这一关 | 13 | Q02 CONDITIONAL_PASS | `af7ecd4f81f5cf1538c050dfe2d3144f78dc9f73fbf59481e8128d6fef17a3ed` |
| PyTorch这个框架本身 | 13 | Q02 CONDITIONAL_PASS | `1df36db7b5cee03b34dd4c778f58bf4759767cc83f53c2a9a171aa25366ccf17` |
| 框架底下是C++ | 9 | Q02 CONDITIONAL_PASS | `641a2ae0a447721f422b517c0039b9269804a24ceadf0fb4c4464f718c037796` |
| 代码题拆解 | 11 | Q02 CONDITIONAL_PASS | `e95f51493151acc2111836fec6686967f6b9945d1b3cd359bd0c563d6ce5e828` |
| 数据这一关 | 23 | Q01 PASS | `1e93d0fc5a9d844125c057bb939f70f6bd4c0742abb92d246c5639d4884c70e0` |
| 推荐算法 | 28 | Q01 PASS | `6b0b673c74962f6119535a8bbcf93fc6d5ea36c08984c4a936697027948a4b45` |
| Kaggle竞赛方法论 | 26 | Q01 PASS | `8ba68e20bf98e162bad7432d0ad71e5653df69c9afcaa8b8d7c8e8304c96d6da` |
| AI全栈 | 30 | Q02 CONDITIONAL_PASS | `3cc61af21d32667cd97e4d9e9d09925ea04d9e52b9538721c95b151a9f93abd6` |
| 模型上线之后 | 23 | Q02 CONDITIONAL_PASS | `8e5464401497855b0a42abc71c422b6d8f032447d059adfaa0f6986d62dcd8fc` |
| Mendix低代码开发 | 27 | Q02 CONDITIONAL_PASS | `42450e5e2c7426f3739b9e31f1c04f44dcb6f9e8594bb53c40b4e7cc959c06aa` |
| AI基础设施 | 29 | Q01 PASS | `b15a5705e7515c9a518a30d5f9d18242b9023af7cd70ce5373fb4399fd0bd27a` |
| 密码学与信息安全 | 27 | Q01 PASS | `e7ea6216406380432dbb7e3be153a2fd1978e1566ebbc5505d68d992cbc37004` |
| Claude博客资料库 | 39 | Q02 CONDITIONAL_PASS | `515e9fc8d44501a0340a5efa147d5ae648d80f258b654f567996b3740e61f7fb` |
| 根Transformer既有专题 | 1 | Q01 PASS | `b33086846c67606dac034e616add48ac9089397a0e36e55ad947e995ba67a0d7` |

每条签收来源为本地 `<slug>/qa/q01-signoff.json`（Q01）或 `<slug>/qa/signoff.json`（Q02），均相对上述output目录；精确路径、指纹、条件和未执行项见本地finalization/signoff-evidence-index.json及precommit-gate.json。

维护：maintenance/polished-pages.json原164条按原顺序和原内容保留，仅逐页追加本轮417条。417份真实recovered HTML canonical源与输出逐字节一致，只对明确路径定向纳入版本化。完整本地_src/source-map.json保留原581条且只读，不强制加入完整_src或全map。定向维护方式见maintenance/README.md，禁止使用默认全站构建入口。

验证范围为全页结构与源同步核对，加风险选取的实际桌面Chrome明暗/窄宽/键盘/弹窗/进度/续读/无JS及离线已加载交互检查；不是每个旧句子、每个浏览器和每台设备的穷尽认证。Q01闭合6个P2与3个P3，保留历史失败证据；Q02原FAIL/HOLD及关闭问题同样保留。

限制：离线已加载阅读与离线冷HTTP启动分开；代表性冷重载返回ERR_INTERNET_DISCONNECTED，不宣称离线安装应用。存储拒绝/损坏注入因暴露接口不支持而未执行，未绕过权限。CSS视口与截图实际像素分别记录，不等同实体手机。未执行屏幕阅读器语音、GPU/模型训练或推理、真实生产/收费操作、临床或学习效果验证。设计意图不作为ADHD临床或学习效果证据。

本轮不push、不部署；提交使用精确allowlist，剩余dirty按归属记录。具体提交hash和文件数以实际Git提交及本地finalization/commit-report.json为准，不预填成功结果。
