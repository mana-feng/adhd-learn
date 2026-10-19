# 恢复的维护源

2026-10-10，用户确认老电脑保留原始 `_src`，并授权先从当前站点恢复。这份目录是可重建的维护副本，**没有声称恢复了老电脑的原始 Markdown、排序配置或全部原校验器**。

- `recovered_html/`：从当前站点逐字节保存的页面源，保留现有 CSS、SVG、正文与打卡逻辑。现有页在这里维护，再执行构建；不会从输出页倒灌覆盖源。
- `智能体工程教程_md/`、`大模型全景导论_md/`：新增的 Markdown 正文。
- `source-map.json`：每个输出页面对应的源、类型、初始 SHA256 与日期。
- `build_all.py`：重建恢复页面与新章节；`--check` 只检查输出是否与源一致。
- `content_inventory.py`：排除 output、docs、assets/vendor、examples 和内部源，分别统计正文/补充单元、附录、导读、独立专题。
- `test_maintenance.py`：中文路径、分类、折叠答案/表格、恢复字节与越界路径检查。
- `vendor/`：本地保留的 Python-Markdown 3.11 与许可证；需要重装时使用 `python -m pip install --target _src/vendor Markdown==3.11`。

## 版本化范围与定向重建

2026-10-20起，本轮已验收首页、机器学习基础和大模型导论的源文件、现有构建器及Python-Markdown运行依赖按用户要求定向纳入版本控制。受跟踪的输出/源关系以 `maintenance/polished-pages.json` 为准，操作命令见 `maintenance/README.md`。全站 `_src/source-map.json` 及其他板块历史源仍不分发；不要在新克隆中把下方本地全站命令当作本轮重建入口。

## 仅供本地完整维护档案的旧全站命令

以下命令需要未分发的完整 `_src/source-map.json` 和源档案，不属于本轮发布的重建流程。仅在确知范围时使用；不应覆盖本轮已验收页面。

在持有完整本地档案的仓库根目录运行：

```bash
python _src/build_all.py
python _src/build_all.py --check
python _src/content_inventory.py --output output/inventory-current.json
python -m unittest discover -s _src -p test_maintenance.py -v
python _src/verify_site.py
```

新章节使用对应板块的现有章节模板、170 字/分钟的向上取整阅读估计，动手耗时另计。恢复页保留原有阅读徽章。除 `maintenance/polished-pages.json` 声明的源、现有构建器及所需Markdown依赖外，其他维护源、全站映射、测试及vendor安装产物仍仅本地保留。虚拟环境、缓存与历史批次接入脚本同样留在本地。重建只需 Python，完整脚本语法检查还需 PATH 中的 Node.js，或通过 verify_site.py 的 --node 指定。`docs/reports/`、原始 `output/` 记录和历史源码 ZIP 均仅本地保留。取回老电脑源之后，应先逐项对照 `source-map.json` 和本批新 Markdown，再决定如何合并，不能直接用旧构建覆盖新增内容。
