# BirdCLEF+ 2026 代码文档

## 目录

- [概述](#概述)
- [高分解决方案](#高分解决方案)
  - [LB 0.947-0.948 系列](#lb-0947-0948-系列)
  - [LB 0.947 Safarbek](#lb-0947-safarbek)
- [Perch + ProtoSSM 时序方案](#perch--protossm-时序方案)
  - [ProtoSSM v5 改进集成](#protossm-v5-改进集成)
- [BEATs + SED 方案](#beats--sed-方案)
  - [BEATs 嵌入提取](#beats-嵌入提取)
  - [Attention SED Head 训练](#attention-sed-head-训练)
  - [5 折集成提交](#5-折集成提交)
- [NFNet 梅尔频谱方案](#nfnet-梅尔频谱方案)
  - [eca_nfnet_l0 训练](#eca_nfnet_l0-训练)
  - [NFNet 提交](#nfnet-提交)
- [SED CNN 复现](#sed-cnn-复现)
- [Perch v2 复现](#perch-v2-复现)
- [Blend 混合方案](#blend-混合方案)
- [外部数据集成](#外部数据集成)
- [技术总结](#技术总结)

---

## 概述

本项目收集了 BirdCLEF+ 2026 竞赛中的多个高分解决方案代码，涵盖三大技术方向：

1. **Perch 蒸馏 + 时序建模**：使用 Google Perch v2 提取特征，结合 ProtoSSM 时序模型和知识蒸馏
2. **BEATs + SED CNN**：使用 BEATs 音频编码器提取帧嵌入，配合注意力 SED 头进行分类
3. **NFNet 梅尔频谱**：使用 NFNet 骨干网络直接处理梅尔频谱图

---

## 高分解决方案

### LB 0.947-0.948 系列

#### 文件
- `0-947-lb-improved.ipynb` — LB 0.947（铜牌）
- `lb-improved.ipynb` — LB 0.948（银牌）

#### 技术架构

**核心策略：分数恢复 + 内存安全**

| 组件 | 默认状态 | 说明 |
|------|---------|------|
| ProtoSSM 风格模型 | 开启 | 恢复排名能力 |
| 完整 Proto TTA | 开启 | 分数敏感 |
| MLP 探针 | 开启 | 恢复次级校准/排名 |
| 逐类权重优化 | 开启 | 避免固定权重分数下降 |
| ResidualSSM | 关闭 | 最大内存风险分支 |
| BirdNET | 条件开启 | 恢复 3 路混合 |
| Perch batch_files | 8 | 比 24 更安全 |

**关键技术：**
- ProtoSSM 时序模型（Selective State Space Model）
- TTA（测试时增强）
- MLP 探针集成
- BirdNET 3 路混合
- 逐类权重优化
- 内存安全设计（可调节 batch_files: 8→4）

**优化方法：**
1. **ONNX Runtime 加速**：使用 ONNX 格式推理 Perch 模型，提升 CPU 推理速度
2. **分数恢复策略**：恢复被过度精简的分数敏感组件（ProtoSSM、TTA、MLP 探针）
3. **渐进式降级**：commit 失败时按顺序关闭组件（batch_files: 8→4 → USE_MLP_PROBES=False → USE_BIRDNET_FORCE_OFF=True）
4. **Isotonic Regression 校准**：使用 sklearn 保序回归进行概率校准
5. **Gaussian 平滑**：scipy.ndimage.gaussian_filter1d 时序平滑
6. **TensorFlow 2.20 优化**：特定版本 wheel 安装，兼容 Perch v2

---

### LB 0.947 Safarbek

#### 文件
- `lb-score-0-947.ipynb` — LB 0.947（铜牌）

#### 技术架构

与 LB 0.947 系列类似，采用 ProtoSSM + TTA + MLP 探针的集成方案。

---

### Blend 混合方案

#### 文件
- `birdclef2026-public-blend-v4.ipynb`

#### 技术架构

**盲混合内核**

混合 3 个公开 notebook：
1. LB 0.825 — Google Perch Starter
2. LB 0.784 — BirdCLEF2026 Submit Baseline

**技术：**
- 简单加权混合
- 盲混合策略（不使用测试集信息）
- 回退文件夹可视化

**优化方法：**
1. **盲混合**：不依赖测试集分布，避免过拟合
2. **多模型互补**：Perch + Baseline 特征互补
3. **回退机制**：fallback 文件夹用于可视化验证

---

## Perch + ProtoSSM 时序方案

### ProtoSSM v5 改进集成

#### 文件
- `birdclef-2026-work/improved-ensemble-fork/birdclef-2026-improved-ensemble-fork.ipynb` — LB 0.929（铜牌）

#### 技术架构

**完整流水线：**
```
Perch → ProtoSSM_v5(第一遍) + MLP → 集成 → ResidualSSM(第二遍) → TTA → 每类群温度 → 文件级缩放 → 排名感知 → Delta 平滑 → 逐类阈值 → 最终输出
```

**组件详情：**

| 组件 | 实现 |
|------|------|
| 特征提取器 | Google Perch v2（冻结，1536 维嵌入） |
| 序列模型 | 双向选择性 SSM（4 层，d_model=320）+ 交叉注意力（8 头） |
| 分类头 | 原型余弦头 + 门控 Perch 蒸馏 |
| 未映射物种 | 属级代理 logit 平均 |
| 元数据融合 | 贝叶斯站点/小时先验表 |
| 后处理 | 排名感知缩放 + Delta 移位平滑 + 逐类阈值 |

**模型配置：**
- **ProtoSSM**：d_model=320，d_state=32，4 层 SSM，每类 2 个原型，8 头交叉注意力
- **MLP 探针**：隐藏层 (256, 128)，focal loss（γ=2.5），标签平滑=0.03
- **ResidualSSM**：d_model=128，d_state=16，2 层，校正权重=0.35
- **训练**：80 轮，余弦热重启（周期=20），SWA 从第 52 轮开始（lr=4e-4），5 折 OOF

**后处理流水线：**
1. **每类群温度缩放** — Aves: 1.10，Texture taxa（两栖类、昆虫）: 0.95
2. **文件级置信度缩放** — top-2 窗口均值缩放（2025 竞赛技术）
3. **TTA** — 5 个偏移的循环移位：[0, 1, -1, 2, -2]
4. **排名感知缩放** — power=0.4 文件最大值（2025 Rank 3 技术）
5. **Delta 移位平滑** — α=0.20 时序平滑（2025 Rank 1 技术）
6. **逐类阈值** — OOF 优化网格搜索 [0.25 … 0.70]

**关键改进：**
1. **更大的 ProtoSSM**：d_model 256→320，3→4 层 SSM（更多时序容量）
2. **排名感知后处理**：按文件最大值预测缩放
3. **Delta 移位平滑**：12 窗口序列的时序平滑
4. **逐类阈值**：OOF 优化的逐物种决策阈值
5. **Mixup + CutMix**：时序嵌入序列的混合增强
6. **Focal loss**：物种频率感知的 focal BCE 与类权重
7. **交叉注意力**：SSM 层间的 8 头时序交叉注意力
8. **SWA**：从 65% 训练开始的随机权重平均
9. **余弦重启**：热重启调度器（周期=20）
10. **MLP 集成**：ProtoSSM 和 MLP 探针的 OOF 优化混合权重

**知识蒸馏：**
- 多任务训练：物种 BCE 损失（标签平滑）+ 原型对比损失 + **Perch logits 知识蒸馏** + 分类学辅助损失
- 蒸馏权重：`distill_weight: 0.1`

---

## BEATs + SED 方案

### BEATs 嵌入提取

#### 文件
- `birdclef-2026-embed/birdclef-2026-beats-embed.ipynb`

#### 技术架构

**CPU only — 零 GPU 消耗**

- **编码器**：BEATs iter3+ AS2M（AudioSet 2M 预训练）
- **输出**：768 维帧嵌入
- **处理量**：全 35,549 件音频
- **降维**：8 帧 × 768 维（内存效率）
- **同时保存**：mean-pooled 768 维
- **输出文件**：`embeddings.npz`（约 900MB）

**优化方法：**
1. **CPU 预计算嵌入**：BEATs 嵌入在 CPU notebook 预计算，训练时直接加载
2. **PCA 降维**：768 维 → 256 维，减少计算量和过拟合
3. **Attention pooling**：自动学习鸣叫帧的权重，替代简单平均
4. **Focal loss 调参**：针对 234 种类别不均衡调整 focal gamma
5. **元数据注入**：hour of day 作为额外特征输入
6. **嵌入增强**：mixup + dropout + noise，提升泛化能力

---

### Attention SED Head 训练

#### 文件
- `birdclef-2026-work/birdclef-2026-beats-sed-work.ipynb`

#### 技术架构

**GPU 使用：约 5-10 分钟**

BEATs 帧嵌入（CPU notebook 预计算）→ Attention SED head

**差异化特点：**
1. **BEATs 嵌入**（AudioSet 2M 预训练）— 昆虫/两栖类也强
2. **Attention pooling** — 自动聚焦鸣叫帧
3. **Focal loss** — 234 种不均衡对策
4. **Metadata 注入**（小时信息）
5. **嵌入增强**（mixup、dropout、噪声）

**模型架构：**
- 输入：BEATs 帧嵌入 [N, 8, 768]
- Attention pooling 层
- Focal loss（处理类别不均衡）
- 元数据注入（hour of day）

---

### 5 折集成提交

#### 文件
- `birdclef-2026-submit/birdclef-2026-beats-sed-submit.ipynb`

#### 技术架构

**BEATs 帧嵌入 → scaler+PCA(768→256) → 5x AttentionSEDHead → 平均 → sigmoid**

**CV 分数：0.9117 ± 0.0024**

**流水线：**
1. BEATs 帧嵌入提取
2. StandardScaler + PCA 降维（768→256）
3. 5 折 AttentionSEDHead 集成
4. 预测平均
5. Sigmoid 激活

---

## NFNet 梅尔频谱方案

### eca_nfnet_l0 训练

#### 文件
- `birdclef-2026-train/birdclef-2026-train.ipynb`
- `birdclef-2026-train/birdclef-2026-train.py`

#### 技术架构

**W2 训练：eca_nfnet_l0 梅尔基线**

- **Backbone**：eca_nfnet_l0（24M 参数，NFNet 系 — 与 Perch v2 不同的特征提取，确保多样性）
- **梅尔频谱**：sr=32000，n_mels=128，5s 片段 → 224×224
- **Loss**：Focal loss（γ=2.0）— 极端不均衡（1~499 件/类）对策
- **Fold**：StratifiedGroupKFold（primary_label 分层，author 分组）
- **数据增强**：Mixup（α=0.5）+ SpecAugment（频率+时间掩码）
- **输出**：每折最佳 checkpoint → Kaggle 数据集化 → 提交 kernel 挂载

**优化方法：**
1. **NFNet 架构选择**：Normalizer-Free Networks，与 Perch v2 特征互补
2. **ECA 注意力**：Efficient Channel Attention，轻量级通道注意力
3. **StratifiedGroupKFold**：按 primary_label 分层 + author 分组，防止数据泄露
4. **SpecAugment**：频率+时间掩码，提升鲁棒性
5. **Focal loss γ=2.0**：处理极端不均衡（1~499 件/类）
6. **CPU 推理优化**：90 分钟限制内完成全量推理

---

### NFNet 提交

#### 文件
- `birdclef-2026-nfnet-submit/birdclef-2026-nfnet-submit.ipynb`
- `birdclef-2026-nfnet-submit/birdclef-2026-nfnet-submit.py`

#### 技术架构

**eca_nfnet_l0 提交（CPU）**

- 从挂载数据集加载 fold0 最佳 checkpoint
- 梅尔频谱 → 模型前向传播 → sigmoid → submission.csv
- 仅 CPU，90 分钟限制

---

## SED CNN 复现

#### 文件
- `birdclef-2026-sed-repro/birdclef-2026-sed-repro.ipynb`

#### 技术架构

**SED CNN 架构：**

- **Backbone**：`tf_efficientnet_b0.ns_jft_in1k`
- **池化**：GEM 频率池化（GeM pooling）
- **Attention SED Head**：
  - 注意力池化 + 分类卷积
  - 输出：clipwise 概率 + segmentwise logits
- **输入**：256×256 梅尔频谱图（3 通道）
- **检查点**：`final_fold0.pt`

**模型类：**
```
SEDModel:
  - Backbone: timm EfficientNet
  - GEMFreqPool: 广义平均池化
  - AttentionSEDHead: 注意力 SED 头

AttentionSEDHead:
  - fc: 全连接 + ReLU + Dropout
  - att_conv: 注意力卷积 (1x1)
  - cls_conv: 分类卷积 (1x1)
  - 输出: clipwise_prob + segmentwise_logit
```

**梅尔频谱变换：**
- sr=32000，n_fft=2048，hop_length=512
- n_mels=256，fmin=0，fmax=16000
- top_db=80.0
- Resize 到 256×256
- 归一化 + 3 通道复制

---

## Perch v2 复现

#### 文件
- `birdclef-2026-perch-v2-repro/birdclef-2026-perch-v2-repro.ipynb` — LB 0.908

#### 技术架构

**仅推理 notebook，基于公开 Perch v2 starter**

通过针对性改进时序平滑策略和概率校准实现 **0.908 公共 LB**，不改变核心模型或探针架构。

**无需 GPU。在 Kaggle 时间限制内完全 CPU 运行。**

**流水线：**
```
音频 (.ogg, 60s)
  → 12 × 5s 非重叠窗口
    → Perch v2 提取 logits + 1536 维嵌入
      → 贝叶斯先验融合
        → PCA 降维 (64 维)
          → 逻辑回归探针
            → 混合输出
```

**关键技术：**

1. **Perch v2 推理**：
   - Google Perch v2 CPU 模型
   - 1536 维嵌入 + 原始 logits
   - 缓存机制（`full_perch_meta.parquet` + `full_perch_arrays.npz`）

2. **标签映射**：
   - Perch v2 训练于 14,795 个科学名类别
   - 234 个竞赛物种通过 `scientific_name` 映射到 Perch 类别索引
   - 未映射物种：属级代理（同属任何 Perch 类别的最大 logit）

3. **类别类型**：
   - Texture classes（两栖类、昆虫）：位置决定的重复纹理
   - Event classes（其他）：稀疏声学事件
   - 不同先验融合权重

4. **先验融合**：
   - 贝叶斯先验表：站点流行度、小时流行度、联合流行度
   - 向全局均值收缩
   - 类类型特定的 lambda 权重

5. **OOF 元特征**：
   - GroupKFold(5) 按站点分组
   - 诚实的 OOF 分数（验证站点排除）
   - 元特征：原始 Perch logit、OOF 先验 logit、OOF 融合分数、前/后/均值/最大融合分数

6. **嵌入探针**：
   - PCA 降维（64 维）
   - 逻辑回归探针（每类）
   - 输入：融合分数 + 时序元特征
   - 最小正样本阈值

**优化方法：**
1. **时序平滑策略改进**：针对性优化平滑算法，不改变核心模型
2. **概率校准**：sigmoid 转换 + 阈值调整
3. **贝叶斯先验融合**：站点/小时流行度先验，提升稀疏类别表现
4. **PCA 降维**：1536 维 → 64 维，减少逻辑回归过拟合
5. **OOF 元特征工程**：GroupKFold(5) 按站点分组，构建诚实验证
6. **缓存机制**：预计算 Perch 输出，避免重复推理
7. **属级代理**：未映射物种使用同属最大 logit 近似

---

## 外部数据集成

#### 文件
- `birdclef-2026-work/xc_embed_kernel/xc_embed.ipynb`

#### 技术架构

**XC 音频 → Perch v2 嵌入（BirdCLEF+ 2026 外部数据）**

- 下载 11,563 条 XC 录音（Aves，Q A|B，非 ND 许可，上限 500/种，159 种）
- 重采样到 32kHz 单声道
- 运行 Perch v2
- 保存嵌入 + logits

**输出：**
- `/kaggle/working/xc_perch_embeddings.{npz,parquet}`
- 用于附加到主 fork

**要求：**
- enable_gpu=true
- enable_internet=true
- 数据集 `yasunorim/xc-birdclef-2026-target-urls`
- 模型 `google/bird-vocalization-classifier/TensorFlow2/perch_v2_cpu/1`

---

## 技术总结

### 模型架构对比

| 方案 | 特征提取器 | 分类头 | 时序建模 | LB 分数 |
|------|-----------|--------|---------|---------|
| ProtoSSM v5 | Perch v2 (1536d) | ProtoSSM + MLP | BiSSM (4 层) | 0.929 |
| BEATs SED | BEATs (768d) | AttentionSEDHead | 帧序列 | 0.912 |
| NFNet | 梅尔频谱 | eca_nfnet_l0 | 无 | - |
| SED CNN | 梅尔频谱 | EfficientNet + Attention | 无 | - |
| Perch v2 | Perch v2 (1536d) | LR Probes | 时序平滑 | 0.908 |
| LB 0.948 | Perch v2 + ProtoSSM | 多模型集成 | BiSSM + TTA | 0.948 |

### 关键技术汇总

#### 特征提取
- **Google Perch v2**：1536 维嵌入，AudioSet 预训练
- **BEATs**：768 维帧嵌入，AudioSet 2M 预训练，对昆虫/两栖类强
- **梅尔频谱**：256×256 或 224×224，直接输入 CNN

#### 时序建模
- **Selective SSM**：状态空间模型，捕获时序动态
- **交叉注意力**：SSM 层间的时序注意力
- **ResidualSSM**：第二遍校正
- **时序平滑**：Delta shift smoothing，TTA

#### 知识蒸馏
- **Perch logits 蒸馏**：辅助损失，权重 0.1
- **门控蒸馏**：ProtoSSM 分类头

#### 数据增强
- **Mixup**：α=0.3~0.5
- **CutMix**：时序序列混合
- **SpecAugment**：频率+时间掩码
- **嵌入增强**：mixup、dropout、噪声

#### 损失函数
- **Focal loss**：γ=2.0~2.5，处理类别不均衡
- **BCE with label smoothing**：0.02~0.03
- **原型对比损失**：度量学习
- **分类学辅助损失**：多任务学习

#### 后处理
- **TTA**：时间平移测试时增强
- **温度缩放**：每类群不同温度
- **排名感知缩放**：power transform
- **Delta 平滑**：时序平滑
- **逐类阈值**：OOF 优化
- **文件级置信度**：top-K 均值缩放

#### 集成策略
- **ProtoSSM + MLP**：OOF 优化混合权重
- **3 路混合**：ProtoSSM + MLP + BirdNET
- **5 折集成**：AttentionSEDHead 平均
- **盲混合**：多 notebook 加权

#### 元数据融合
- **贝叶斯先验表**：站点、小时、月份
- **元数据注入**：站点/小时嵌入
- **GroupKFold**：按站点分组交叉验证
