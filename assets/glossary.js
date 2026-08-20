/* 全站术语速查：正文中的常见术语首次出现时可点击查看。 */
(function () {
  "use strict";

  var TERMS = [
    { id: "transformer", names: ["Transformer"], group: "模型结构", meaning: "一种处理序列信息的神经网络结构。它让句子里的每个词按需要关注其他词。", role: "现代大语言模型最常见的骨架。", code: "layer = nn.TransformerEncoderLayer(d_model=512, nhead=8)" },
    { id: "token", names: ["Token", "token"], group: "文本表示", meaning: "模型实际读取的文本小单位；它不一定等于一个汉字或一个英文单词。", role: "文本要先拆成 token，模型才可以把它变成数字。", code: "ids = tokenizer(\"你好，世界\")[\"input_ids\"]" },
    { id: "tokenizer", names: ["Tokenizer", "tokenizer", "分词器"], group: "文本表示", meaning: "把原始文字拆成 token，再把 token 映射为数字编号的工具。", role: "它是文字进入语言模型前的第一道门。", code: "tokens = tokenizer.tokenize(\"机器学习很有趣\")" },
    { id: "embedding", names: ["Embedding", "embedding", "词嵌入", "嵌入向量"], group: "文本表示", meaning: "用一串浮点数表示词、句子或图片的方式；含义相近的内容通常更接近。", role: "让模型能用数字表达语义，并能计算相似度。", code: "vector = model.get_input_embeddings()(ids)" },
    { id: "attention", names: ["自注意力", "多头注意力", "注意力机制", "Attention", "attention"], group: "模型结构", meaning: "让当前位置根据任务需要，为其他位置分配不同关注程度的计算。", role: "帮助模型把相关词的信息聚在一起，例如把代词和它指代的名词关联。", code: "score = softmax(Q @ K.transpose(-1, -2))\nout = score @ V" },
    { id: "qkv", names: ["Query", "Key", "Value", "Q、K、V", "Q/K/V"], group: "注意力", meaning: "注意力中的三组数字：Q 表示“我在找什么”，K 表示“我能匹配什么”，V 是实际要传递的信息。", role: "Q 和 K 决定关注多少，权重再拿来混合 V。", code: "weights = softmax(Q @ K.T)\nout = weights @ V" },
    { id: "residual", names: ["残差连接", "残差"], group: "模型结构", meaning: "把一层的输入直接加回它的输出，形成一条保底通路。", role: "即使新计算不理想，原信息仍能往后传；深层网络更容易训练。", code: "y = x + block(x)" },
    { id: "layernorm", names: ["LayerNorm", "层归一化"], group: "训练稳定性", meaning: "按单个样本的特征维度整理数字的均值和大小。", role: "避免数字在网络中越传越大或太小。", code: "norm = nn.LayerNorm(hidden_size)\ny = norm(x)" },
    { id: "rmsnorm", names: ["RMSNorm"], group: "训练稳定性", meaning: "一种更简单的归一化：主要按数字整体大小缩放，不额外强制减去均值。", role: "常用于 LLaMA 一类模型，让数值稳定且计算更省一些。", code: "x = x / x.pow(2).mean(-1, keepdim=True).sqrt()" },
    { id: "ffn", names: ["FFN", "前馈网络"], group: "模型结构", meaning: "Transformer 每层中给每个位置单独使用的小加工网络。", role: "注意力负责“看谁”，FFN 负责“把看到的信息怎么加工”。", code: "y = linear2(F.relu(linear1(x)))" },
    { id: "swiglu", names: ["SwiGLU"], group: "模型结构", meaning: "带门控的前馈网络；一条支路提供内容，另一条支路决定内容通过多少。", role: "比简单 ReLU 更细地筛选特征，现代大模型常用。", code: "y = W2(silu(W1(x)) * W3(x))" },
    { id: "relu", names: ["ReLU"], group: "激活函数", meaning: "一种简单激活函数：负数变成 0，正数保留。", role: "给神经网络加入非线性，否则多层线性层仍近似一层线性层。", code: "y = torch.relu(x)" },
    { id: "rope", names: ["RoPE", "旋转位置编码"], group: "位置信息", meaning: "在注意力内部按位置旋转 Q、K 的数字，使比较结果带上相对距离和顺序。", role: "让模型区分“猫咬狗”和“狗咬猫”这类词相同、顺序不同的句子。", code: "Q, K = apply_rotary_pos_emb(Q, K, position_ids)" },
    { id: "backprop", names: ["反向传播", "反向传递"], group: "训练", meaning: "从损失开始，倒着计算每个参数该往哪个方向改、改多少的过程。", role: "训练神经网络时用来获得梯度。", code: "loss.backward()" },
    { id: "gradient", names: ["梯度下降", "梯度"], group: "训练", meaning: "梯度告诉参数：稍微增大或减小会让错误变好还是变坏。", role: "优化器利用梯度更新模型参数。", code: "param.data -= learning_rate * param.grad" },
    { id: "loss", names: ["损失函数", "损失", "loss"], group: "训练", meaning: "用一个数字衡量模型答案离正确答案有多远；一般越小越好。", role: "它把“哪里答错了”变成可供训练优化的目标。", code: "loss = F.cross_entropy(logits, labels)" },
    { id: "learning-rate", names: ["学习率", "learning rate"], group: "训练", meaning: "每次更新参数时迈多大一步。", role: "太大可能越走越乱，太小则学习很慢。", code: "optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)" },
    { id: "batch", names: ["批大小", "batch size", "batch"], group: "训练", meaning: "一次送给模型、再统一计算一次更新的一小批样本数量。", role: "它影响显存、训练速度和梯度的稳定程度。", code: "for x, y in DataLoader(dataset, batch_size=32):\n    train_step(x, y)" },
    { id: "epoch", names: ["epoch", "轮次"], group: "训练", meaning: "训练数据被完整看过一遍，叫一个 epoch。", role: "用于描述训练进度；更多 epoch 不一定更好，可能过拟合。", code: "for epoch in range(10):\n    train_one_epoch()" },
    { id: "overfitting", names: ["过拟合"], group: "泛化", meaning: "模型把训练数据记得太死，换到新数据反而表现不好。", role: "提醒你不要只看训练集分数，要看验证集或测试集。", code: "if val_loss > train_loss:\n    print(\"可能过拟合\")" },
    { id: "regularization", names: ["正则化"], group: "泛化", meaning: "故意限制模型不要把训练数据记得过死的一类方法。", role: "减少过拟合，让模型更可能适应新数据。", code: "optimizer = AdamW(params, weight_decay=0.01)" },
    { id: "dropout", names: ["Dropout", "dropout"], group: "泛化", meaning: "训练时随机暂时关闭一部分神经元输出。", role: "迫使模型别过度依赖某几个特征，从而减轻过拟合。", code: "drop = nn.Dropout(p=0.1)\ny = drop(x)" },
    { id: "adam", names: ["AdamW", "Adam"], group: "优化器", meaning: "常用优化器；它会参考梯度的方向与历史大小，自动调整不同参数的步子。", role: "替你实际执行“根据梯度更新参数”。AdamW 还正确处理权重衰减。", code: "optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)" },
    { id: "pytorch", names: ["PyTorch"], group: "工具", meaning: "Python 中常用的深度学习框架，提供张量、自动求导、GPU 计算和模型组件。", role: "用它可以搭建、训练、保存和部署神经网络。", code: "import torch\nx = torch.randn(2, 3)" },
    { id: "tensor", names: ["Tensor", "tensor", "张量"], group: "数据表示", meaning: "带形状和数据类型的多维数字盒子；标量、向量、矩阵都是张量的特例。", role: "深度学习框架用张量存放输入、参数和中间结果。", code: "x = torch.tensor([[1., 2.], [3., 4.]])" },
    { id: "shape", names: ["shape", "形状"], group: "数据表示", meaning: "描述张量每个维度有多长，例如 (32, 128) 常表示 32 个样本、每个有 128 个特征。", role: "许多报错都来自 shape 对不上。", code: "print(x.shape)  # 例如 torch.Size([32, 128])" },
    { id: "dtype", names: ["dtype", "数据类型"], group: "数据表示", meaning: "张量中每个数字的存储类型，例如 float32、float16、int64。", role: "它影响精度、内存占用，以及某些运算能否进行。", code: "x = x.to(torch.float16)" },
    { id: "broadcast", names: ["广播", "broadcasting"], group: "数组运算", meaning: "让形状不同但兼容的数组自动扩展，从而能逐元素计算的规则。", role: "避免手写循环，也要小心意外扩展到错误形状。", code: "x = torch.ones(2, 3)\nbias = torch.tensor([1., 2., 3.])\ny = x + bias" },
    { id: "autograd", names: ["autograd", "自动求导"], group: "训练", meaning: "框架自动记录运算关系，并在需要时计算梯度的机制。", role: "省去手动推导反向传播的大量工作。", code: "x.requires_grad_()\ny = (x ** 2).sum()\ny.backward()" },
    { id: "rag", names: ["RAG"], group: "大模型应用", meaning: "检索增强生成：先从资料库找相关内容，再把资料与问题一起交给模型回答。", role: "让模型能依据私有或最新资料回答，并尽量减少胡编。", code: "docs = retriever.search(query)\nanswer = llm(query, context=docs)" },
    { id: "lora", names: ["LoRA"], group: "微调", meaning: "低秩适配：冻结大部分原模型，只训练少量新增的小矩阵。", role: "用更少显存和训练参数，让模型适应特定任务或风格。", code: "config = LoraConfig(r=8, lora_alpha=16)\nmodel = get_peft_model(model, config)" },
    { id: "finetuning", names: ["微调", "fine-tuning"], group: "训练", meaning: "在已有预训练模型基础上，用特定任务或领域数据继续训练。", role: "把通用能力适配成更贴合你的任务的能力。", code: "trainer.train()  # 用领域数据继续训练" },
    { id: "quantization", names: ["量化"], group: "推理优化", meaning: "用更少的比特表示模型权重或中间数据，例如把 float16 改成 int8/4bit。", role: "减少显存和带宽需求，通常能让部署更便宜。", code: "model = AutoModel.from_pretrained(name, load_in_4bit=True)" },
    { id: "kv-cache", names: ["KV Cache", "KV-Cache", "KV 缓存"], group: "推理优化", meaning: "生成下一个 token 时，保存过去 token 的注意力 K、V，避免每次从头重算。", role: "显著加快逐字生成，但会占用显存。", code: "outputs = model(input_ids, use_cache=True)\npast = outputs.past_key_values" },
    { id: "gpu", names: ["GPU", "CUDA"], group: "硬件", meaning: "GPU 是擅长大量并行数学计算的处理器；CUDA 是让程序使用 NVIDIA GPU 的软件平台。", role: "深度学习的大量矩阵计算在 GPU 上通常比 CPU 快得多。", code: "device = torch.device(\"cuda\")\nmodel.to(device)" },
    { id: "inference", names: ["推理", "inference"], group: "运行模型", meaning: "用已经训练好的模型接收新输入并给出结果的阶段。", role: "和训练不同：通常不计算梯度，只追求速度、成本和稳定性。", code: "with torch.no_grad():\n    output = model(x)" },
    { id: "sql-join", names: ["JOIN", "join"], group: "SQL", meaning: "按关联字段把两张表的行组合起来的操作。", role: "例如把订单表和用户表按 user_id 合并。", code: "SELECT *\nFROM orders o\nJOIN users u ON o.user_id = u.id;" },
    { id: "null", names: ["NULL"], group: "SQL", meaning: "表示“未知或缺失”，不是 0、不是空字符串，也不等于任何值（包括它自己）。", role: "SQL 中要用 IS NULL / IS NOT NULL 判断它。", code: "SELECT * FROM users\nWHERE email IS NULL;" },
    { id: "hash", names: ["哈希函数", "哈希"], group: "安全", meaning: "把任意长度数据变成固定长度摘要的函数；通常很难从摘要反推出原文。", role: "常用于完整性校验、密码存储和签名构造。", code: "digest = hashlib.sha256(data).hexdigest()" },
    { id: "rsa", names: ["RSA"], group: "安全", meaning: "基于大整数分解困难性的公开密钥密码体制。", role: "可用于加密较短信息或验证数字签名；实际常与对称加密配合。", code: "# 公钥加密，私钥解密；或私钥签名，公钥验证" },
    { id: "ab-test", names: ["A/B 测试", "AB实验", "A/B实验"], group: "评估", meaning: "把用户随机分到 A、B 两个方案，比较一个预先定义指标的实验。", role: "帮助判断一次改动是否真的带来效果，而不是碰巧波动。", code: "uplift = metric_B - metric_A" }
  ];

  var MAX_TERMS_PER_PAGE = 14;
  var byId = Object.create(null);
  TERMS.forEach(function (term) { byId[term.id] = term; });

  function insertStyles() {
    var style = document.createElement("style");
    style.textContent = ".glossary-term{appearance:none;border:0;border-bottom:2px dotted var(--accent,#b65310);background:transparent;color:inherit;font:inherit;line-height:inherit;padding:0;cursor:pointer;text-decoration:none}.glossary-term:hover{color:var(--accent,#b65310);border-bottom-style:solid}.glossary-term:focus-visible{outline:3px solid #ffb000;outline-offset:3px;border-radius:2px}#site-glossary{width:min(560px,calc(100% - 26px));max-height:min(720px,calc(100% - 26px));border:1px solid var(--border,#d8dce4);border-radius:16px;padding:0;color:var(--fg,#172033);background:var(--card,#fff);box-shadow:0 20px 65px rgba(0,0,0,.28)}#site-glossary::backdrop{background:rgba(20,28,42,.48)}.glossary-sheet{padding:22px}.glossary-top{display:flex;gap:14px;align-items:flex-start;justify-content:space-between}.glossary-group{margin:0 0 3px;color:var(--accent,#b65310);font-size:.85em;font-weight:700}.glossary-title{margin:0;font-size:1.45em;line-height:1.3}.glossary-close{width:44px;height:44px;flex:0 0 44px;border:1px solid var(--border,#d8dce4);border-radius:10px;background:transparent;color:inherit;font:inherit;font-size:1.4em;cursor:pointer}.glossary-close:hover{background:var(--quote-bg,#f2f5f8)}.glossary-close:focus-visible{outline:3px solid #ffb000;outline-offset:2px}.glossary-section{margin:19px 0 0}.glossary-label{margin:0 0 5px;font-weight:750}.glossary-copy{margin:0;line-height:1.75}.glossary-code{margin:8px 0 0;padding:12px;border-radius:9px;overflow:auto;background:#202b3b;color:#f8fafc;font:13px/1.6 \"CodeCJK\",Consolas,monospace;white-space:pre-wrap}.glossary-hint{margin:18px 0 0;padding-top:12px;border-top:1px dashed var(--border,#d8dce4);color:var(--muted,#596579);font-size:.88em}@media(max-width:640px){.glossary-sheet{padding:18px}.glossary-code{font-size:12px}}";
    document.head.appendChild(style);
  }

  function createDialog() {
    var dialog = document.createElement("dialog");
    dialog.id = "site-glossary";
    dialog.setAttribute("aria-labelledby", "glossary-title");
    dialog.innerHTML = "<div class=\"glossary-sheet\"><div class=\"glossary-top\"><div><p class=\"glossary-group\" id=\"glossary-group\"></p><h2 class=\"glossary-title\" id=\"glossary-title\"></h2></div><button type=\"button\" class=\"glossary-close\" aria-label=\"关闭术语解释\">×</button></div><div class=\"glossary-section\"><p class=\"glossary-label\">它是什么</p><p class=\"glossary-copy\" id=\"glossary-meaning\"></p></div><div class=\"glossary-section\"><p class=\"glossary-label\">它有什么用</p><p class=\"glossary-copy\" id=\"glossary-role\"></p></div><div class=\"glossary-section\"><p class=\"glossary-label\">最小示例</p><pre class=\"glossary-code\" id=\"glossary-code\"></pre></div><p class=\"glossary-hint\">按 Esc、点击窗口外面，或点 × 都可以关闭。</p></div>";
    dialog.querySelector(".glossary-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
    document.body.appendChild(dialog);
    return dialog;
  }

  function showTerm(dialog, term) {
    dialog.querySelector("#glossary-group").textContent = term.group;
    dialog.querySelector("#glossary-title").textContent = term.names[0];
    dialog.querySelector("#glossary-meaning").textContent = term.meaning;
    dialog.querySelector("#glossary-role").textContent = term.role;
    dialog.querySelector("#glossary-code").textContent = term.code;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    return !parent || parent.closest("script,style,pre,code,a,button,textarea,select,option,svg,math,#site-glossary,.glossary-term");
  }

  function findMatches(text, used, remaining) {
    var lower = text.toLowerCase();
    var candidates = [];
    TERMS.forEach(function (term) {
      if (used[term.id]) return;
      term.names.forEach(function (name) {
        var index = 0;
        var needle = name.toLowerCase();
        while (index < text.length) {
          var found = lower.indexOf(needle, index);
          if (found === -1) break;
          var before = text.charAt(found - 1);
          var after = text.charAt(found + name.length);
          var ascii = /^[a-z0-9-]$/i.test(name.charAt(0));
          if (!ascii || (!/[a-z0-9_]/i.test(before) && !/[a-z0-9_]/i.test(after))) candidates.push({ start: found, end: found + name.length, term: term });
          index = found + name.length;
        }
      });
    });
    candidates.sort(function (a, b) { return a.start - b.start || b.end - b.start - (a.end - a.start); });
    var result = [], end = -1;
    candidates.forEach(function (item) {
      if (result.length < remaining && item.start >= end && !used[item.term.id]) { result.push(item); end = item.end; used[item.term.id] = true; }
    });
    return result;
  }

  function annotate(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);
    var used = Object.create(null), count = 0;
    nodes.forEach(function (textNode) {
      if (count >= MAX_TERMS_PER_PAGE || shouldSkip(textNode)) return;
      var text = textNode.nodeValue;
      if (!text || !text.trim()) return;
      var matches = findMatches(text, used, MAX_TERMS_PER_PAGE - count);
      if (!matches.length) return;
      var fragment = document.createDocumentFragment(), cursor = 0;
      matches.forEach(function (match) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.start)));
        var button = document.createElement("button");
        button.type = "button";
        button.className = "glossary-term";
        button.dataset.glossaryId = match.term.id;
        button.setAttribute("aria-label", "查看术语：" + text.slice(match.start, match.end));
        button.textContent = text.slice(match.start, match.end);
        fragment.appendChild(button);
        cursor = match.end;
        count++;
      });
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  function run() {
    insertStyles();
    var dialog = createDialog();
    annotate(document.querySelector("main") || document.body);
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest(".glossary-term");
      if (!trigger) return;
      var term = byId[trigger.dataset.glossaryId];
      if (term) showTerm(dialog, term);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
