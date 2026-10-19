# ML Foundations Reading Polish Implementation Plan

> **For agentic workers:** Use the assigned auxiliary chats for their owned files; the coordinator follows superpowers:executing-plans for integration and verification. Steps use checkbox syntax for tracking.

**Goal:** Improve the accuracy, organization, visual explanation and ADHD reading experience of the existing machine learning foundations board.

**Architecture:** Keep the static HTML site and current reading aids. Scope a new reader stylesheet and optional enhancement script to this board. Revise content in place, preserve URLs and anchors, and synchronize recovered maintenance sources.

**Tech Stack:** Static HTML/CSS/JavaScript, accessible SVG, Python maintenance checks and browser verification.

**Spec:** ../specs/2026-10-18-ml-foundations-polish.md

## Global Constraints

- Exactly 26 existing reading units plus the board index remain in scope.
- Preserve `mlbase-progress`, `recsys-theme`, existing URLs, anchors and navigation.
- Preserve root `index.html` and `assets/home.css` from the completed homepage work.
- Do not change global reading assets or unrelated boards; use `assets/ml-reader.*` and `assets/ml-figures/`.
- No automatic commit, push or deployment; changes remain reviewable in the local workspace.
- No unsupported execution claims, new course modules, forced timers or hidden teaching prose.

## Review Focus

1. Long tables and SVGs inside collapsed details must not widen the mobile page.
2. Existing scripts that rewrite code, annotate terms or open figures must remain compatible.
3. Progress accumulated before this change must still select the right continuation chapter.
4. New diagrams must agree with equations, shapes and data splitting rules in their chapter.
5. Storage failures and no-JavaScript reading must retain readable content and navigation.

## Task 1: Baseline and audit

- [x] Freeze hashes, inventory and source equality for all 27 HTML pages in `output/ml-foundations-polish-2026-10-18/baseline.json`.
- [x] Create three auxiliary chats with non-overlapping responsibilities and explicit models/effort.
- [x] Collect `content-audit.json`, `reading-design.json`, and `visual-audit.json`.
- [x] Select concrete corrections and diagrams; record scope in the execution ledger before dispatching implementation.

## Task 2: Content corrections

**Files:** Selected existing lesson HTML and corresponding `_src/recovered_html/机器学习与深度学习基础/` files.

**Interfaces:** Preserve document paths, all original IDs and `mlbase-progress` FILE values. Return exact edits and evidence in `content-changes.json`.

- [x] Dispatch confirmed corrections to the content owner.
- [x] Check revised claims against source evidence and execute selected small examples when practical.
- [x] Verify all reading units retain necessary explanations and navigable sections.

## Task 3: Shared reading design

**Files:** Create `assets/ml-reader.css` and only if needed `assets/ml-reader.js`.

**Interfaces:** CSS scope `.ml-reader`; board index additionally `.ml-index`. Preserve current reading helper selectors and behavior; main HTML integration belongs to the coordinator.

- [x] Dispatch the finalized design and selector contract to the layout owner.
- [x] Keep main text visible and style notes, checkpoints, code, tables and diagrams consistently.
- [x] Verify light/dark, keyboard, reduced motion, storage failure and no-JavaScript fallback.

## Task 4: Explanatory diagrams

**Files:** Approved SVG/HTML resources under `assets/ml-figures/`; coordinator integrates them in named chapters.

**Interfaces:** Each diagram comes with exact placement, title, accessible description, figure caption and verified numbers/shapes. Existing diagrams that are sufficient remain.

- [x] Dispatch a small set of diagrams selected from the visual audit.
- [x] Check their mathematical and conceptual correctness with the content owner’s findings.
- [x] Verify contrast and small-screen handling in the actual chapter.

## Task 5: Board index and integration

**Files:** `机器学习与深度学习基础/index.html`, owned page asset hooks, corresponding recovered sources.

- [x] Reorganize goal entries, stages and progress without removing the 26 cards.
- [x] Replace stale timing and unsupported guarantees with clear reading/practice distinctions.
- [x] After content ownership is released, apply `.ml-reader` and reader asset links idempotently.
- [x] Integrate approved diagrams, preserving IDs and existing explanation order.
- [x] Synchronize only the board’s maintenance source and output files.

## Task 6: Validation and handoff

- [x] Run `python -m unittest discover -s _src -p test_maintenance.py -v`.
- [x] Run `python _src/verify_site.py --output output/ml-foundations-polish-2026-10-18/site-validation.json`; report the pre-existing unrelated mismatch separately.
- [x] Compare original board paths, IDs, progress data and source hashes against baseline.
- [x] Browser-check board index plus 01, 05, 08, 12, 15 and appendix pages at representative widths, including expanded wide content.
- [x] Have the visual/acceptance owner independently review the integrated result. All independent final reports collected; IVR01/02 closed by targeted owner follow-up.
- [x] Save screenshots and a concise final report with changed files, actual checks and remaining limitations.
