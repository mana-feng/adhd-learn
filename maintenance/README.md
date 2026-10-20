# 已验收页面的维护与定向重建

此清单保留首页及已验收课程板块的真实维护源。范围只由 `polished-pages.json` 的 entries 决定；不是全站恢复档案。HTML恢复源直接按字节复制，LoRA 05b及智能体Markdown章节以真实Markdown和映射中的章节模板生成；共享模板须与其全部生成页在同一功能提交中更新。新克隆无需取回本地历史output。

维护前先修改映射的source；不要只修改生成HTML。Markdown页面也不要改成重复的HTML源。现有 `_src/build_all.py` 原样纳入，Python-Markdown 3.11运行源码及分发元数据/许可证一并保留，未分发安装器、exe、缓存或实验依赖。

在仓库根目录执行以下只读一致性检查（Python 3.11+，与所保留的 Markdown 3.11 元数据要求一致）：

```bash
python -X utf8 -c "import json;from pathlib import Path;from _src.build_all import render_lesson;r=Path.cwd();e=json.loads((r/'maintenance/polished-pages.json').read_text(encoding='utf-8'))['entries'];bad=[x['output'] for x in e if (r/x['output']).read_bytes()!=((r/x['source']).read_bytes() if x['kind']=='recovered_html' else render_lesson(r,x).encode('utf-8'))];print({'pages':len(e),'out_of_sync':bad});raise SystemExit(bool(bad))"
```

确认已编辑正确源后，仅重建清单中的页面：

```bash
python -X utf8 -c "import json;from pathlib import Path;from _src.build_all import build;r=Path.cwd();e=json.loads((r/'maintenance/polished-pages.json').read_text(encoding='utf-8'))['entries'];build(r,e);print('Rebuilt',len(e),'mapped pages')"
```

不要直接运行现有构建器的默认全站CLI；该入口读取未版本化的本地 `_src/source-map.json`，不是这里的筛选清单。默认.gitignore继续保护历史 `_src`，本次仅定向force-add明确文件；已跟踪源的后续修改正常暂存即可。未来新增受维护页面时，需同步扩展本清单，并定向纳入真实源及模板依赖。

`docs/deliveries/`保存精简交付说明。各轮 `output/*-polish-*` 及首页重设计目录仍是本地证据；其中对比入口、截图、基线和日志不随仓库分发。不要把这些本地对比页单独提交成断图入口。分发页面的assets引用则必须完整保留。

2026-10-20 扩散、科学与智能体三个模块提交时，数学板块由其他团队独立维护，未纳入该次三个模块的提交或重建。随后同日的19个既有课程模块及另计根Transformer专题维护扩展，范围以本清单及 `docs/deliveries/2026-10-20-site-polish-rollout.md` 为准；原164条记录保留。两次维护均不包含完整模型训练、GPU/显存测量、真实手机或屏幕阅读器验收，也不顺带处理其他团队的无关改动。
