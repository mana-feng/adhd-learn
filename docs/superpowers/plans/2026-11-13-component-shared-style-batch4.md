# AI 全栈共享样式第四批

日期 2026-11-13。沿用 [课程组件架构规范](../specs/2026-11-12-lesson-component-architecture.md)、[迁移计划](2026-11-12-lesson-component-migration.md) 与 [第三批](2026-11-13-component-shared-style-batch3.md)。基线 HEAD 为 `53ada6e9aa91143b9a40af71239362da6ea955b1`。正式映射 SHA-256 为 `7b23731048050dfd84534f001d7c9247f5f7fbe98f0ec98d71b490f9120381da`。

## 写入白名单

本计划与下表十个路径。五篇均为维护映射中的 `recovered_html`，每对源与输出在变更前逐字节相同。首个内联样式块使用 CRLF。

| 维护源 | 定向生成页 | 原 SHA-256 |
| --- | --- | --- |
| `_src/recovered_html/AI全栈/05-流式输出.html` | `AI全栈/05-流式输出.html` | `5886804918dff648132e112e0b98f490e8654ff4b41c93a8f7b787b654b2fcdc` |
| `_src/recovered_html/AI全栈/07b-文件上传与对象存储.html` | `AI全栈/07b-文件上传与对象存储.html` | `424160bcf4c52d82937e437f6d70a56cba28c688482cf1e23eafd8e9729907c3` |
| `_src/recovered_html/AI全栈/08c-CSRF与XSS.html` | `AI全栈/08c-CSRF与XSS.html` | `e1a57cb567d495714844b432779b350364d6cb7c4415cca0bacded6bee7ea59f` |
| `_src/recovered_html/AI全栈/08d-OAuth2与OIDC.html` | `AI全栈/08d-OAuth2与OIDC.html` | `2f7f2062f852dfbeef0a0503ba72c9d9ea6f1fb76e4cb6cb4e1b656e689a3665` |
| `_src/recovered_html/AI全栈/08e-JWT.html` | `AI全栈/08e-JWT.html` | `c93602fa07320a489858a979d93be5b63e30eef4368cd8c3f1539fc0a6b66152` |

05 和 07b 的后续局部表格样式分别为 `g04-reading-fix-qread-002` 和 `g04-reading-fix-qread-003`，保留原字节与原级联位置，额外对照两张表在原折叠展开后的窄屏横滚。08c、08d、08e 三节使用同一基础样式族。选这五篇以覆盖两个真实表格变体及相邻章导航。

## 只读边界

只复用 `assets/reading/lesson-body-base.css`、`lesson-prose-base.css` 和 `lesson-table-base.css`。原位区间依次在 `html` 至 `#scrollbar`、外壳按钮至 `blockquote`、列表至 `code` 之间。现有规则数为 1／7／6，LF 字节数为 203／397／685。共享 CSS、构建器、维护映射、其他课程和工作区并行改动均只读。04 与 06 分别作为已有和未接入共享链接的只读对照。既有内联代码色声明继续登记。

## 验证与回滚

1. 分别核对三个区间的原始字节、位置与发布相对 URL。只替换这些区间。反向回填应能恢复整页原字节，所有其余内联块、正文、脚本、ID、进度键及知识坐标相同。
2. 用现有构建器仅生成白名单五页。抽查控制页、共享依赖及本模块消费者范围。全站其他映射不进入本批浏览器验收。
3. 复用前批验证程序。每页进行桌面浅色及窄屏深色无脚本前后对照、真实离线加载。代表页验证保存主题和代码工具。05 与 07b 额外对照展开表格。保留检查结果、截图和逐文件散列。
4. 交根会话 `READY_FOR_REVIEW`。根独立验收后按已有授权本地提交。逐页回滚时，在维护源恢复原位内联并定向生成该页，共享资产继续供其他页使用。
