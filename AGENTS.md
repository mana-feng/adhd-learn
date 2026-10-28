# Agent rules

## Before editing

- Read the applicable design specification and `maintenance/README.md`.
- Preserve existing commands, lesson content, navigation, progress keys and reading controls.
- For mapped pages, edit the maintenance source and rebuild only the mapped outputs; do not run an unrestricted full-site rebuild.
- Formal agent rules, specifications and plans MUST be versionable repository files. Do not hide them in `output/` or add ignore rules that exclude them.

## Code presentation: MUST

- Follow [the unified code-theme specification](docs/superpowers/specs/2026-10-28-unified-code-theme-design.md).
- All code bodies use the same fixed deep-black `#1e1e1e` background and light foreground, independent of website theme, system preference and saved settings. This is the user's current revision and supersedes the former page-following code design.
- Preserve the website's existing `html[data-theme]`, `recsys-theme` save/restore and system fallback behavior; those settings do not change code colors.
- The sole executable palette definition belongs in `assets/code-reader.css`, using the shared `--cr-*` tokens. Other stylesheets may consume those tokens, never redefine their color values.
- Language, terminal and output labels may change labels or syntax categories; they MUST NOT select a background or a separate theme.
- Cover enhanced viewers, native `pre`, terminals, output, glossary code, toolbars, footers, code-fold summary/header (代码折叠标题) and the dynamically created enlarged reader. Non-code details retain their page design.
- Toolbars, code-fold headers and dialog chrome use the same fixed-dark code-reader chrome tokens.
- Code-external explanations and article text retain page-theme colors; external notes consume existing page text/muted/accent tokens rather than the fixed-dark code tokens.
- Code text, every syntax category, comments, line numbers (including `::before`) and visible toolbar/footer text MUST reach at least **4.5:1** against their actual background, including highlighted lines.
- Retain original text, spacing, indentation, line breaks, copy, wrap, folding, enlargement, focus and keyboard behavior.

## Prohibited shortcuts

- No module/language-specific palettes or code palette branches selected by website/system/saved theme. Terminals use the same fixed-dark palette as all other code.
- No per-page `!important` color patches, appended override piles, or theme decisions based on language.
- Remove or convert superseded palette declarations; do not leave competing legacy rules behind a stronger selector.
- Do not call the work accepted merely because text is readable: exact background equality and independence from website/system/saved theme are separate requirements.

## Required acceptance evidence

- [ ] Reuse the frozen inventory and existing rule-family cleanup; explain any changed structure or exclusion.
- [ ] Confirm a single fixed-dark `:root` palette and no code palette theme/media branches or competing declarations.
- [ ] Independently inspect representative viewer, native, terminal/output, glossary, code-fold and body-mounted enlarged-reader samples for this revision; verify actual external note readability.
- [ ] Verify the fixed `#1e1e1e` surface and text contrast while website theme, opposing system preference and saved-theme reload change; preserve the page's existing theme behavior.
- [ ] Record computed backgrounds, text/token/line-number contrast, screenshots and functional checks separately from static coverage.
- [ ] Report actual tested page/block/state counts and remaining limits; static coverage does not establish every-page runtime acceptance.

The current implementation plan is [here](docs/superpowers/plans/2026-10-28-unified-code-theme.md). Local evidence may live under `output/`; it does not replace these durable rules.
