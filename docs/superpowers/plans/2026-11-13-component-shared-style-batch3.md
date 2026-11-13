# AI 全栈共享样式第三批

日期 2026-11-13。依据 [课程组件架构规范](../specs/2026-11-12-lesson-component-architecture.md)、[分阶段实施计划](2026-11-12-lesson-component-migration.md) 和 [第二批](2026-11-13-component-shared-style-batch2.md)。基线 HEAD 为 `12c70072640c9c32b1dbbd1123e5e4b07c329f0a`。正式映射 SHA-256 为 `7b23731048050dfd84534f001d7c9247f5f7fbe98f0ec98d71b490f9120381da`。

## 写入白名单

仅本计划与下表六个路径。三条映射均为 `recovered_html`，各源与发布页的原始字节相同。

| 维护源 | 定向生成页 | 原 SHA-256 |
| --- | --- | --- |
| `_src/recovered_html/AI全栈/04-调用层.html` | `AI全栈/04-调用层.html` | `1f59366ef53f7ee20a13abf2152e6d8ac25fd7330ebe0e3666d5b623169bec0f` |
| `_src/recovered_html/AI全栈/07-向量检索落地.html` | `AI全栈/07-向量检索落地.html` | `519e5a3814e5ee9812de4d8b3ef496b5c3bd57b67ea62f92c386113cf6752a1e` |
| `_src/recovered_html/AI全栈/08b-同源策略与CORS.html` | `AI全栈/08b-同源策略与CORS.html` | `3c13e3a481bdf4bed208feb70dd91a2a6e147578b11547af243a15adddf054d5` |

04 的两类局部表格另有更高特异性的样式，后续内联块 `g04-reading-fix-qread-001` 按原字节和位置保留，单独复测折叠展开态和默认可见的表。07 用作普通向量检索／SQL 表格样本，08b 用作普通 Python／Bash 和请求预检表样本。03c 有已登记的图示副本 ID 问题，仍在范围外。05 与 03b 分别作为未迁移及已迁移的只读对照页。先前批次页面、机器学习 03 系列、目录、附录与其余未选页均只读。

## 原位边界

| 现有样式表 | 规则数 | LF 字节 | SHA-256 |
| --- | --- | --- | --- |
| `assets/reading/lesson-body-base.css` | 1 | 203 | `c3ec8948c7da570dbdbe8521ef9548ce345905405bbbd1c2ecfd4667cfeb37ae` |
| `assets/reading/lesson-prose-base.css` | 7 | 397 | `8fc87399108b93c22c22b97eb922820ec724b295ca0e7c2d92780ed6e68a3a51` |
| `assets/reading/lesson-table-base.css` | 6 | 685 | `5591b286beebfe14f84f0c8601d35a7e02b7a79d4911d4e327224c06a62e89a7` |

仅在 `html` 至 `#scrollbar`、外壳按钮至 `blockquote`、列表至 `code` 三个已审区间接入对应外链。按发布页位置使用 `../assets/reading/`，保留原有 CRLF、字体、媒体规则、表格覆盖块和其他资源顺序。三组 CSS、维护映射、构建器、知识架构和其他任务文件只读。现存旧内联代码色继续登记。

## 实施与验收

1. 冻结候选、共享依赖、映射及控制页。检查工作区，发现所属路径漂移时停止写入。用正式提取器按当前发布页重新读取三篇知识坐标，受影响教学章节和段落集合为空。
2. 分别验证三段原规则字节、替换位置及全文件反向还原。对比前后正文、脚本与知识坐标，维护构建器只生成白名单三页。扫描实际新消费者及其他映射输出散列。
3. 复用第二批浏览器程序，对照桌面／390px、浅深、无脚本和真实 `file://`，核对主题、旧打卡、章导航、表格横滚与代码工具。补测 04 局部表的计算样式、结构和折叠位置。
4. 交根会话 `READY_FOR_REVIEW`、散列和实测，根独立验收后按已有授权本地提交。本批不推送。逐页回滚时将外链在对应维护源原位恢复为旧规则，定向生成该页；共享 CSS 继续供其他消费者使用。
