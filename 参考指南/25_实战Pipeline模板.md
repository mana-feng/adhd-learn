# 实战Pipeline模板

---

## 一、NLP分类Pipeline

### 1.1 项目结构

```
project/
|-- config.py          # 超参数配置
|-- dataset.py         # 数据加载与预处理
|-- model.py           # 模型定义
|-- trainer.py         # 训练逻辑
|-- inference.py       # 推理与提交
|-- utils.py           # 工具函数
|-- main.py            # 入口
```

### 1.2 核心Pipeline

```
Step 1: 数据预处理
  - 文本清洗(HTML/特殊字符/编码)
  - 对抗验证(训练/测试分布检测)
  - K-Fold划分(5折stratified)

Step 2: 模型训练(每折)
  - 预训练模型加载(DeBERTa-v3-large)
  - 对抗训练(FGM, epsilon=1.0)
  - 学习率调度(CosineWarmup)
  - 早停(patience=3)
  - 保存最佳模型和OO F预测

Step 3: 伪标签(可选)
  - 用5折模型给测试集打伪标签
  - 筛选置信度>0.9的样本
  - 加入训练集重新训练

Step 4: 融合
  - 多模型OOF预测加权平均
  - 多模型测试预测加权平均
  - 权重通过OOF分数优化

Step 5: 后处理
  - 阈值搜索(网格搜索最优阈值)
  - 规则修正(业务规则)
  - 生成提交文件
```

### 1.3 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| max_length | 256/512 | 根据文本长度分布选择 |
| batch_size | 16/32 | 根据GPU显存调整 |
| learning_rate | 2e-5 | 分类头学习率 |
| layer_lr_decay | 0.9 | 底层学习率衰减 |
| weight_decay | 0.01 | L2正则 |
| warmup_ratio | 0.1 | 预热步数占比 |
| epochs | 5~10 | 配合早停 |
| fgm_epsilon | 1.0 | 对抗训练扰动幅度 |
| rdrop_alpha | 5.0 | R-Drop KL散度权重 |

---

## 二、CV分类Pipeline

### 2.1 项目结构

```
project/
|-- config.py          # 超参数配置
|-- dataset.py         # 数据加载与增强
|-- model.py           # 模型定义
|-- train.py           # 训练逻辑
|-- inference.py       # TTA推理
|-- ensemble.py        # 模型融合
|-- main.py            # 入口
```

### 2.2 核心Pipeline

```
Step 1: 数据准备
  - 图像EDA(尺寸/通道/类别分布)
  - 对抗验证
  - K-Fold划分(5折stratified)

Step 2: 数据增强
  - 训练: RandAugment + CutMix + Mixup
  - 验证: CenterCrop + Normalize
  - 推理: MultiCropTTA

Step 3: 模型训练(每折)
  - Backbone: EfficientNetV2-M/L 或 ConvNeXt-S/B
  - 损失: CE + LabelSmoothing(0.1) 或 ArcFace
  - 优化器: AdamW + CosineWarmup
  - 混合精度训练(FP16)
  - EMA(decay=0.999)
  - 保存最佳模型和OOF预测

Step 4: TTA推理
  - 原图 + 水平翻转 + 垂直翻转
  - 多尺度(0.75x/1.0x/1.25x)
  - 多裁剪(5-crop/10-crop)
  - 取softmax平均

Step 5: 融合
  - 多模型softmax概率加权平均
  - 权重通过OOF分数优化

Step 6: 后处理
  - 阈值搜索
  - 规则修正
  - 生成提交文件
```

### 2.3 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| image_size | 384/512/640 | 越大越准但越慢 |
| batch_size | 16/32 | FP16下可增大 |
| learning_rate | 1e-4 ~ 3e-4 | 比NLP大 |
| warmup_epochs | 5 | 预热epoch数 |
| epochs | 30~50 | 配合早停 |
| label_smoothing | 0.1 | 标签平滑 |
| mixup_alpha | 0.2 | Mixup参数 |
| cutmix_alpha | 1.0 | CutMix参数 |
| ema_decay | 0.999 | EMA衰减 |

---

## 三、CV检测Pipeline

### 3.1 核心Pipeline

```
Step 1: 数据分析
  - 目标尺寸分布(决定Anchor/输入尺寸)
  - 类别分布(是否不均衡)
  - 图像尺寸分布(是否需要SAHI)

Step 2: Anchor定制
  - K-means聚类目标框尺寸
  - 计算IoU评估Anchor质量
  - 替换默认Anchor

Step 3: 模型训练
  - YOLOv5/X 或 EfficientDet 或 DINO
  - 多尺度训练(img_size=640~1280)
  - Mosaic + Mixup增强
  - 类别权重(不均衡时)

Step 4: SAHI推理(小目标)
  - 切片大小: 1024x1024
  - 重叠率: 0.25
  - 合并方式: WBF

Step 5: TTA推理
  - 翻转(水平/垂直)
  - 多尺度(0.8x/1.0x/1.2x)

Step 6: 融合
  - 多模型WBF融合(iou_thr=0.6)
  - 置信度阈值搜索

Step 7: 后处理
  - Soft-NMS
  - 类别特定阈值
  - 极小框过滤
```

### 3.2 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| img_size | 640/1024/1280 | 根据目标大小选择 |
| batch_size | 4/8 | 检测模型显存占用大 |
| learning_rate | 1e-3 ~ 1e-2 | 比分类大 |
| mosaic_prob | 0.5 | Mosaic增强概率 |
| mixup_prob | 0.1 | Mixup概率 |
| iou_thr_wbf | 0.5~0.7 | WBF IoU阈值 |
| skip_box_thr | 0.0001 | WBF低分框过滤 |
| conf_thr | 网格搜索 | 置信度阈值 |

---

## 四、CV分割Pipeline

### 4.1 核心Pipeline

```
Step 1: 数据分析
  - 图像尺寸分布
  - 类别像素占比
  - 边界复杂度

Step 2: 模型训练
  - Encoder: EfficientNetV2 / ConvNeXt / Swin
  - Decoder: UNet++ / DeepLabV3+ / FPN
  - 损失: BCE + Dice 或 BCE + Lovasz
  - 增强强增强(旋转/翻转/弹性变形/CutMix)

Step 3: 多尺度推理
  - 0.75x/1.0x/1.25x/1.5x
  - 取sigmoid平均

Step 4: TTA
  - 翻转(水平/垂直/对角)
  - 旋转(90/180/270度)

Step 5: 融合
  - 多模型概率平均
  - 多尺度概率平均

Step 6: 后处理
  - CRF精修边界
  - 阈值搜索(每类别独立阈值)
  - 小区域过滤
  - 生成提交文件(RLE编码)
```

### 4.2 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| image_size | 256/384/512 | 分割通常比分类小 |
| batch_size | 8/16 | 分割显存占用大 |
| learning_rate | 1e-4 ~ 5e-4 | - |
| encoder_lr | 1e-5 | encoder学习率更小 |
| loss_bce_weight | 0.5 | BCE损失权重 |
| loss_dice_weight | 0.5 | Dice损失权重 |
| tta_scales | [0.75,1.0,1.25] | TTA尺度 |

---

## 五、时序预测Pipeline

### 5.1 核心Pipeline

```
Step 1: 时间线分析
  - 检测分布变化点
  - 对抗验证(训练/测试分布)
  - 确定验证策略(时间划分/滚动验证)

Step 2: 特征工程
  - 时间特征: year/month/day/dayofweek/hour
  - 周期编码: sin(2*pi*day/7), cos(2*pi*day/7)
  - 滞后特征: lag_1/lag_7/lag_14/lag_28
  - 滚动统计: rolling_mean_7/rolling_std_14
  - 扩展统计: expanding_mean/expanding_std
  - 差分特征: diff_1/diff_7
  - 交叉特征: 类别x时间统计

Step 3: 模型训练
  - LightGBM(主力)
  - XGBoost(多样性)
  - CatBoost(类别特征)
  - 多折时间序列CV

Step 4: 融合
  - 加权平均(权重=OOF分数)
  - Stacking(可选)

Step 5: 后处理
  - 截断(预测值限制在合理范围)
  - 平滑(移动平均)
  - 规则修正
```

### 5.2 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| num_leaves | 31/63/127 | LightGBM叶子数 |
| learning_rate | 0.01~0.05 | 配合n_estimators |
| n_estimators | 1000~10000 | 配合早停 |
| max_depth | -1(不限制) | 时序通常不限制深度 |
| min_child_samples | 20/50 | 防止过拟合 |
| reg_alpha | 0.1~1.0 | L1正则 |
| reg_lambda | 0.1~1.0 | L2正则 |
| lag_window | [1,7,14,28] | 滞后窗口 |

---

## 六、推荐系统Pipeline

### 6.1 核心Pipeline

```
Step 1: 数据分析
  - 用户/物品分布
  - 冷启动比例
  - 交互稀疏度

Step 2: 召回阶段(多路)
  - ItemCF(相似物品召回)
  - UserCF(相似用户召回)
  - 热门物品召回
  - 向量召回(双塔DNN)
  - 序列召回(SASRec)
  - 合并去重(1000~3000候选)

Step 3: 特征工程
  - 用户统计特征(点击率/活跃度)
  - 物品统计特征(热度/类别)
  - 交叉统计特征(用户-类别点击率)
  - 序列特征(最近N个交互物品的Embedding)

Step 4: 排序模型
  - DeepFM / DCN V2 / DIN
  - 多目标(MMOE/PLE)
  - 特征重要性筛选

Step 5: 重排
  - 多样性过滤(同类去重)
  - 新鲜度加权
  - 业务规则修正

Step 6: 融合
  - 多模型排序分数加权
  - 倒数排名融合(RRF)
```

### 6.2 关键超参数

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| recall_top_k | 100~500 | 每路召回数量 |
| embed_dim | 64/128 | Embedding维度 |
| hidden_dims | [256,128,64] | 隐藏层维度 |
| learning_rate | 1e-3 | 推荐模型通常较大 |
| batch_size | 4096/8192 | 推荐数据量大 |
| neg_sample_ratio | 1:4 | 正负样本比 |
| dnn_dropout | 0.1~0.3 | DNN Dropout |

---

## 七、通用实验管理模板

### 7.1 实验记录表

| 字段 | 说明 |
|------|------|
| experiment_id | 实验编号 |
| description | 改动描述 |
| model | 模型名称 |
| hyperparams | 关键超参数 |
| cv_score | CV分数 |
| lb_score | LB分数(如有) |
| oof_path | OOF预测文件路径 |
| model_path | 模型文件路径 |
| notes | 备注 |

### 7.2 提交记录表

| 字段 | 说明 |
|------|------|
| submit_id | 提交编号 |
| model_ids | 使用的模型编号 |
| ensemble_method | 融合方式 |
| lb_score | LB分数 |
| cv_score | CV分数 |
| timestamp | 提交时间 |
