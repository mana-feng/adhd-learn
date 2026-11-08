# 05b · 支持向量机：知识点依据表

**来由（2026-11-09）**：用户本地的牛客题库中，「机器学习基础」「深度学习基础」两类共 57 道题涉及 SVM / 核函数，而本模块此前 0 处提到 SVM。本页补上这块；题目只用来定位考点，页面内容和检查点均为自写，不转载题目。

规则同 [03a 依据表](2026-11-09-ml03a-sources.md)：每一条都已打开原文核对（2026-11-09）；教学简化会注明。

页面：[05b-支持向量机.html](../../../机器学习与深度学习基础/05b-支持向量机.html)。

## 来源

| 代号 | 来源 |
|---|---|
| SK-SVM | scikit-learn · [1.4 Support Vector Machines](https://scikit-learn.org/stable/modules/svm.html)（1.4 引言、1.4.4 Complexity、1.4.5 Tips on Practical Use、1.4.6 Kernel functions、1.4.7 Mathematical formulation） |
| SK-RBF | scikit-learn 示例 · [RBF SVM parameters](https://scikit-learn.org/stable/auto_examples/svm/plot_rbf_parameters.html) |
| CS229 | Stanford CS229 讲义 [main_notes.pdf](https://cs229.stanford.edu/main_notes.pdf) · 第 4 章开头（判别式 / 生成式）、第 6 章 Support vector machines（6.1–6.7） |
| MATH | 站内《机器学习的数学原理》[07 SVM](../../../机器学习的数学原理/07-SVM.html)、[06 核技巧](../../../机器学习的数学原理/06-核技巧.html)（推导，页面只链接） |

## 知识点 → 来源

| 节 / 图 | 知识点 | 来源与原文要点 | 页面写法 |
|---|---|---|---|
| 一 · `ml05b-many-lines` | 能分开数据的线有很多条；离最近点越远越可信 | CS229 6.1：离分界线远的点预测更有把握，希望找到让训练点都「正确且远离分界线」的分界线 | 一致；A、B、M 三条线和它们到最近一单的距离 0.45 / 0.40 / 1.11 由脚本复算 |
| 二 · `ml05b-street` | 几何间隔 = 1/‖w‖；最大化间隔 ⇔ 最小化 ½‖w‖²，约束 y(w·x+b) ≥ 1 | CS229 6.3–6.4：几何间隔 γ = 函数间隔 / ‖w‖；令函数间隔为 1 后，最大化 1/‖w‖ 等价于 min ½‖w‖² s.t. y(wᵀx+b) ≥ 1 | 一致；「全宽 2/‖w‖」是两侧几何间隔之和（由 CS229 直接推出）。本例 ‖w‖ = 0.90，全宽 2.21 |
| 二 | 标签记成 +1 / −1 | CS229 6.2：从这里起 y ∈ {−1, 1} | 一致 |
| 二 | 支持向量：只有它们决定分界线 | CS229 6.6：只有间隔最小的几个点 α 非零，称为支持向量。SK-SVM 1.4.7：决策函数只对支持向量求和，其余样本的对偶系数为 0 | 页面说「压在街边的几单」是教学简化：严格定义是对偶系数非零的点。本例 U 也恰好压线但系数为 0，图里单独注明 |
| 三 · `ml05b-soft-margin` | 软间隔：允许进街或分错，用 C 加权惩罚 | CS229 6.7：min ½‖w‖² + C Σξᵢ，允许函数间隔小于 1；SK-RBF：C 在「训练样本分对」与「间隔最大」之间权衡，C 大接受更小的间隔 | 一致；C = 0.1 / 1 两幅图的线、宽度 3.80 / 2.21、支持向量 9 / 6 个都由 sklearn 拟合得到（原单位、未标准化，仅作图示） |
| 三 | C 越小正则越强；数据噪声多应调小 C | SK-SVM 1.4.5：「decreasing C corresponds to more regularization」；1.4.6.1：C 小决策面平滑，C 大力求分对所有训练样本 | 一致，并与 05a 的 C = 1/λ 对上 |
| 三 · `ml05b-hinge-vs-log` | 合页损失 max(0, 1 − y·f(x))；交叉熵 ln(1 + e^(−y·f)) | SK-SVM 1.4.7：LinearSVC 的原问题可写成使用 hinge loss 的形式；CS229 式 (2.3)：logistic loss = log(1 + exp(−t)) | 一致；「把握 ≥ 1 时坡度为 0、只剩支持向量起作用」由合页损失的形状直接推出 |
| 四 · `ml05b-kernel-lift` | 一条直线分不开时，映射到新特征后可分；核函数不必显式算出新特征，K(x, z) 可看作相似度 | CS229 6.6 后的 Kernels 一节：K(x,z) = φ(x)ᵀφ(z) 可以在原空间高效计算，不必显式表示高维特征；核可理解为相似度度量 | 一致；「离中心距离的平方」是为图示挑的一个显式新特征，脚本断言内圈 < 0.56 < 外圈 |
| 四 | 常用核：线性、多项式、RBF、sigmoid；RBF 是 SVC 默认 | SK-SVM 1.4.6 列出四种核及公式；[SVC API](https://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html)：签名默认 `C=1.0, kernel='rbf', gamma='scale'`，「If none is given, 'rbf' will be used」 | 页面只列前三种 |
| 四 · `ml05b-gamma` | gamma 大 → 影响范围小 → 过拟合，C 也救不回；gamma 小 → 太受约束 | SK-RBF：gamma 定义单个样本影响能伸多远；过大时影响范围只剩支持向量自己，任何 C 都防不住过拟合；过小时模型太受约束 | 一致；三幅区域图和「81%/64%、100%/99%、100%/68%」由与代码相同的管道复算并断言 |
| 四 / 六 | 用 GridSearchCV 在按指数间隔的 C、gamma 上搜索 | SK-SVM 1.4.6.1：建议用 GridSearchCV，C 和 gamma 取指数间隔 | 页面写「按 10 倍间隔」 |
| 五 · `ml05b-vs-lr` | SVM 直接给 ±1，不经过概率；要概率需额外的交叉验证校准，代价高 | CS229 6.2：分类器直接预测 1 或 −1，不先估计 p(y=1)；SK-SVM 1.4 引言与 1.4.1.2：概率靠代价很高的五折交叉验证（Platt scaling） | 一致 |
| 五 | 判别式：逻辑回归、感知机这类直接学从输入到标签的映射 | CS229 第 4 章开头：直接学 p(y\|x) 或直接学从输入到标签映射的算法称为判别式学习算法 | SVM 直接学从输入到 ±1 的映射（CS229 6.2），据此归为判别式 |
| 五 / 六 | SVC 训练耗时在样本数的平方到立方之间；大数据用 LinearSVC | SK-SVM 1.4.4：libsvm 实现介于 O(n_features × n_samples²) 和 O(n_features × n_samples³)；LinearSVC 可近乎线性地扩展到百万级样本 | 一致 |
| 六 | SVM 不具尺度不变性，强烈建议先缩放；测试数据用同一套缩放，可用 Pipeline | SK-SVM 1.4.5 原文，含 `make_pipeline(StandardScaler(), SVC())` | 一致 |
| 六 · 代码 | 两段代码的输出 | 在 scikit-learn 1.9.1、Python 3 下实际运行，原样贴入；脚本断言关键行 | — |

## 课程自编部分

- 外卖 10 单沿用 03a 的教学数据；「一圈套一圈」数据由 `make_circles(n_samples=80, factor=0.4, noise=0.1, random_state=0)` 生成。
- 「街」「街宽」「压线」「把握」是白话说法，对应间隔、几何间隔、支持向量、函数间隔 y·f(x)。
- 检查点 9 题为自写，覆盖题库高频的错误说法（SVM 是生成式、用了核就不会过拟合、间隔是 1/‖w‖ 还是 2/‖w‖ 等）。
