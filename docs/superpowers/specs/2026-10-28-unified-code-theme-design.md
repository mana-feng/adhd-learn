# Unified code-theme design — current fixed-dark revision

## User direction and authority

The user now requests black code blocks with white or colored text, independent of the website theme because page-matched code is uncomfortable to read. This current revision supersedes the earlier page-following light/dark code design. Prior completed work and its frozen evidence under `output/code-theme-unification-2026-10-28/` remain historical; do not rewrite or undo them.

All enhanced viewers, native `pre`, terminals, output, glossary code, code-fold summary/header (代码折叠标题), toolbars, footers and body-mounted enlarged readers use one fixed-dark code system. Language affects labels and syntax categories only. Code-external explanations, article text, non-code details and mathematical/prose presentation retain their existing page design.

## Single palette contract

`assets/code-reader.css` is the sole executable palette owner. Declare the following values once in `:root`; no code palette declarations under `html[data-theme]`, `prefers-color-scheme`, body/main/module selectors or saved-state branches. Every code/chrome consumer inherits the same shared `--cr-*` tokens.

| Token suffix (`--cr-`) | Fixed value |
| --- | --- |
| surface | `#1e1e1e` |
| fg | `#e2dfd6` |
| muted | `#b0aeb8` |
| line | `#aaa7a0` |
| rule | `#424249` |
| accent | `#ffad75` |
| highlight | `#473323` |
| keyword | `#d2a9dd` |
| string | `#a1caa6` |
| number | `#ddba80` |
| function | `#97bddb` |
| comment | `#a7aaa1` |

Define `--cr-chrome-surface:var(--cr-surface)`, `--cr-chrome-fg:var(--cr-fg)` and `--cr-chrome-rule:var(--cr-rule)` centrally. Code card, toolbar, footer, language label, buttons, fold header, dialog header/content and code glossary consume them. Labels use `--cr-accent`; muted/footer text uses `--cr-muted`. All non-highlighted code bodies and their code chrome must compute to exactly `#1e1e1e` in every website/system/saved-theme state. Nested native `code` has no separate background and inherits foreground unless a syntax category applies.

Highlighted lines use `--cr-highlight`. Code text, every syntax category, comments, actual `::before` line numbers and visible toolbar/footer/fold/dialog text must reach **4.5:1** against the effective normal or highlighted background. Verify rendered cascade, opacity and compositing independently; palette arithmetic alone is insufficient.

## Preserve existing integration and behavior

Keep the previous module palette cleanup, central native/glossary integration, Agent fold-source cleanup, root stylesheet links and existing saved-theme startup restoration. Do not roll those changes back or spread a new module palette. The website retains `html[data-theme]`, `recsys-theme` save/restore and system fallback; these continue styling the page while code remains fixed dark. Do not add a new storage key or code-only theme toggle.

External explanations such as `.cr-notes > p`, `.cr-note > .cr-note-detail`, `.cr-note > .cr-note-range` and `.cr-study > .cr-context` sit on page/card backgrounds rather than code chrome. Within the same central CSS, use existing page `--fg`/`--muted`/`--accent` tokens or inheritance for these real external consumers; do not add literal colors or change actual black-background code/chrome. Verify ML external notes on the light page, including selection states.

The enlarged reader remains under `body`, outside `main.mg-main`; opening/reusing it and changing the website theme while it is open must leave its code and chrome fixed dark. Preserve original text, command bytes, spacing, indentation, line breaks, copy authority (`record.raw`), wrap, folding, enlargement/close, focus and keyboard behavior. Do not execute lesson commands.

Remove superseded central code palette branches at their source. Do not append `!important` or blanket override piles. Existing template base tokens may remain only with the previously established effective central category mapping and maintenance-source evidence. If a newly demonstrated integration defect requires HTML/template work, report it before expanding scope, then follow `maintenance/README.md` and rebuild only the mapped output; otherwise leave HTML/JS and module styles untouched.

## Revision acceptance

Use the frozen inventory and prior functional evidence; do not repeat the old 421-assertion whole matrix merely for this change. Statically verify exact single palette ownership, removed theme/media branches, fixed-value consumers, external-note/page token separation and unchanged protected files. Independently browser-check representative viewer, native, terminal/output, glossary, fold and body-mounted modal under website light/dark, opposing system preference, saved-theme reload and a narrow sample. Assert exact `#1e1e1e` normal backgrounds and **4.5:1** text/token/comment/line/chrome contrast, including highlighted lines. Check that page-theme switching still operates while code stays unchanged, and actual external ML explanations remain readable.

Keep code-count and no-runtime-instance exclusions explicit: empty collections are **N/A**, never color passes. Record actual tested pages/blocks/states, computed colors, screenshots and limited functional checks separately from inherited static coverage. Preview locally with external analytics/network blocked. No staging, commit, push, deployment or analytics changes; preserve `SC-BACKEND-RECEIPT OPEN 1` and macOS/Linux actual OS clipboard `NOT_CONFIRMED`.
