# ML 03b–03d teaching redesign

## Intent

Turn the former mixed 03b lesson into a three-lesson regression sequence for readers with no assumed machine-learning or calculus background. A reader should understand why a loss is needed, how its gradient reaches model parameters, why an output mapping is chosen, and when a probabilistic regression model is appropriate.

## Durable structure

- **03b · 回归损失函数：模型如何衡量错误** is the required foundation. It uses one delivery-time example to build residuals, squared error, MSE, MAE, Huber loss, derivatives, the chain rule, one complete parameter update, outlier influence, and the mean/median distinction.
- **03c · 回归输出层：模型应该输出什么** follows 03b. It distinguishes the raw score `z` from the prediction, then compares identity, Softplus, sigmoid, scaled sigmoid, and post-prediction clipping versus training-graph clamping.
- **03d · 概率回归与目标变换（进阶选读）** is optional and must not be a prerequisite for 04. It introduces distributions, mean/variance, Gaussian NLL, Poisson NLL, and log-target regression, with the statistical meaning and failure conditions stated explicitly.

The existing 03b filename and progress key remain unchanged so current completion data survives. 03c and 03d receive new filenames and progress keys. The order becomes 03a → 03b → 03c → 03d → 04.

## Teaching contract

1. Every new topic begins with an observable problem, then a concept, then a formula.
2. Every displayed formula defines all symbols, units, data origin, and applicability.
3. Core formulas include their origin or a stepwise derivation, not only the result.
4. Important formulas include complete numerical substitution.
5. Intuition comes before stricter mathematics; optional details may be folded only after the required explanation is visible.
6. Facts, approximations, framework conventions, and distribution assumptions are labelled separately.
7. The delivery-time example remains the main narrative; a new example appears only when the concept requires a different data type.

## Mathematical contract

- Residual is `r = y - ŷ`; derivative signs are consistently taken with respect to `ŷ` unless another variable is named.
- Single-sample squared error and multi-element mean squared error are never called the same quantity. `sum` versus `mean`, and what counts as an element for multi-output tensors, are explicit.
- Huber uses `0.5 r²` for `|r| ≤ δ` and `δ(|r| - 0.5δ)` otherwise. The boundary continuity and scale dependence of `δ` are shown.
- The full update example uses `x=2`, `y=10`, `w=3`, `b=1`, `η=0.01`: prediction 7, loss 9, gradients `-6`, `-12`, `-6`, new parameters 3.12 and 1.06, new prediction 7.30, new loss 7.29.
- Outlier-gradient shares for residuals `[1,-1,2,-2,30]` are explicitly shares of the sum of absolute prediction-gradient magnitudes: MSE `60/72 = 83.33%`, MAE `1/5 = 20%`, Huber with `δ=2` `2/8 = 25%`. They are not parameter-gradient shares.
- Scaled sigmoid with finite `z` reaches only the open interval `(a,b)` mathematically. Clip/clamp endpoint derivatives are framework conventions; only the clear inside/outside cases are asserted.
- `GaussianNLLLoss` receives variance, not standard deviation. Gaussian NLL states whether the constant `0.5 log(2π)` is included.
- `PoissonNLLLoss(log_input=True)` receives log-rate `z`, with `λ = exp(z)`. A positive mapping alone does not establish a Poisson data model.
- `exp(E[log Y|X])` is not generally `E[Y|X]` and is not generally the conditional median. The median interpretation is limited to suitable symmetric log-space distributions such as a log-normal model.

## Presentation and behavior

- Reuse the existing lesson shell, shared reading components, KaTeX, theme startup, route rail, progress control, and fixed-dark code-reader assets.
- Article prose and explanatory cards follow the page theme. Code surfaces remain governed solely by `assets/code-reader.css`; no new code palette values or branches are introduced.
- Tables, formulas, diagrams, and navigation remain usable on narrow screens without document-level horizontal overflow.
- No new third-party dependency is introduced.

## Source and build boundary

The existing 03b recovered HTML remains the shared visual/behavior template. The maintained lesson bodies are three Markdown sources under `_src/机器学习与深度学习基础_md/`, rendered by the repository's existing targeted builder. This avoids three divergent copies of the large recovered shell while retaining its theme, progress, KaTeX, reader, and navigation assets. Update `maintenance/polished-pages.json`, then run only the mapped-page build described in `maintenance/README.md`. Do not run the unrestricted site build.

## Acceptance

- Automated checks cover required headings/concepts, formulas and fixed numeric examples, unique IDs, local links, progress keys, mapped-source parity, and navigation order.
- Important calculations are independently recomputed rather than accepted from prose.
- Browser checks cover all three pages in light and dark themes plus a narrow viewport, KaTeX rendering, diagrams/tables, route navigation, progress toggling, and absence of page errors.
- The final report separates automated/static evidence from real-browser evidence and states remaining limits.
