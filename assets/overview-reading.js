/* Scoped reading state and authored formula explanations, never generic symbol guesses. */
(() => {
  'use strict';
  const root=document.querySelector('.ov-layout'); if(!root) return;
  const route=root.querySelector('#ov-route'), toggle=root.querySelector('.ov-route-toggle');
  const narrow=matchMedia('(max-width:980px)');
  function setRoute(open){route.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}
  setRoute(!narrow.matches);toggle.addEventListener('click',()=>setRoute(route.hidden));
  narrow.addEventListener('change',()=>setRoute(!narrow.matches));
  const links=[...route.querySelectorAll('nav a')], targets=links.map(a=>document.getElementById(decodeURIComponent(a.hash.slice(1))));
  let current=0,queued=false;
  function update(){current=0;targets.forEach((t,i)=>{if(t&&t.getBoundingClientRect().top<=innerHeight*.35)current=i;});links.forEach((a,i)=>i===current?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));queued=false;}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});update();
  route.addEventListener('click', e => {
    const link = e.target.closest('nav a');
    if (!link || !narrow.matches || e.defaultPrevented || e.button !== 0 ||
        e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || link.hasAttribute('download') ||
        (link.target && link.target.toLowerCase() !== '_self') ||
        link.origin !== location.origin || link.pathname !== location.pathname ||
        link.search !== location.search || !link.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); }
    catch (_) { return; }
    if (!target) return;
    const requestedHash = link.hash;
    setRoute(false);
    // Keep native fragment history and focus. After the menu changes layout,
    // finish positioning only if another action has not chosen a different hash.
    requestAnimationFrame(() => {
      if (e.defaultPrevented || !narrow.matches || location.hash !== requestedHash) return;
      target.scrollIntoView({block: 'start', behavior:
        matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    });
  });
  const key='overview-reading:v1:'+decodeURI(location.pathname),status=route.querySelector('.ov-save-status');
  function resume(id){const target=targets.find(t=>t?.id===id);if(!target)return;const a=document.createElement('a');a.href='#'+id;a.textContent='回到上次记下的位置';status.append(' ',a);}
  try{resume(localStorage.getItem(key));}catch(_){status.textContent='无法读取保存位置；可用章节链接作书签。';}
  // On narrow screens the rail is above the article. Saving from there would
  // otherwise capture the page top after the reader scrolls back to the control.
  const floating=document.createElement('button');floating.type='button';floating.className='ov-save-floating';floating.textContent='记住当前小节';document.body.append(floating);
  const feedback=document.createElement('p');feedback.className='ov-save-feedback';feedback.setAttribute('role','status');document.body.append(feedback);let feedbackTimer;
  function savePosition(){update();if(!targets[current])return;let message;try{localStorage.setItem(key,targets[current].id);message='已记住：'+links[current].textContent;status.textContent=message;resume(targets[current].id);}catch(_){message='未保存：浏览器存储不可用。请复制本节链接。';status.textContent=message;}feedback.textContent=message;feedback.classList.add('is-visible');clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>feedback.classList.remove('is-visible'),3500);}
  root.querySelector('.ov-save').addEventListener('click',savePosition);floating.addEventListener('click',savePosition);
  root.querySelectorAll('.ov-choice,.ov-score').forEach(choice=>{
    const fields=[...choice.querySelectorAll('input,textarea,select')],s=choice.querySelector('.ov-choice-status');
    const stateKey=key+(choice.classList.contains('ov-score')?':scores':':choice');
    try{const old=JSON.parse(localStorage.getItem(stateKey)||'{}');fields.forEach(f=>{if(typeof old[f.name]==='string'&&(!f.options||[...f.options].some(o=>o.value===old[f.name])))f.value=old[f.name];});}catch(_){s.textContent='无法读取此前的选择。';}
    function totals(){const weight=Number(choice.querySelector('[name=interest-weight]')?.value||1);choice.querySelectorAll('tbody tr').forEach(row=>{const values=[...row.querySelectorAll('[data-score]')].map(f=>f.value),out=row.querySelector('output');if(out)out.textContent=values.some(v=>v==='')?'未完成':String(Number(values[0])+Number(values[1])*weight+Number(values[2]));});}
    totals();choice.addEventListener('change',totals);
    choice.querySelector('.ov-choice-save').addEventListener('click',()=>{try{localStorage.setItem(stateKey,JSON.stringify(Object.fromEntries(fields.map(f=>[f.name,f.value]))));s.textContent='已保存在当前浏览器；这只是你的学习笔记，不代表任务完成。';}catch(_){s.textContent='未保存：请自行复制笔记或分数。';}});
  });
  const R=s=>s.replaceAll('@','\\');
  const definitions={
    kl:[['P(x)','加权概率','结果 x 在 P 中出现的概率。','本式按 P 加权；不是把每个结果的对数比等权相加。概率总和必须为 1，一个零项不表示总 KL 不受其他项影响。','P=(0.5,0.5) 时，两项权重各为一半。'],['@log_2@frac{P(x)}{Q(x)}','当前结果的对数概率比','比较两种分布对同一个结果给出的概率，并取以 2 为底的对数。','它与前面的 P(x) 相乘后参与求和；单项可以为负，非负的是总 KL，单位为比特。','P(x)=0.5、Q(x)=0.25 时，对数比是 1；再乘权重 0.5，这一项贡献 0.5 比特。']],
    lora:[['Wx','基础层的输出','原权重矩阵 W 与输入向量 x 相乘。','它给出原层的输出；本式再加上右边的低秩旁路。','W 为 2×2 单位矩阵，x=(2,3)，则 Wx=(2,3)。'],['B(Ax)','低秩旁路的输出','先用 A 将输入映射到 r 维，再用 B 映射回输出维度。','B(Ax) 与 Wx 都是输出向量；能与 W 相加的是权重改变量 BA，不是 B(Ax)。本页缩放取 1。','A=(1,0)、B=(0,1) 的转置，x=(2,3)，则 Ax=2、B(Ax)=(0,2)，合计 y=(2,5)。']],
    dot:[['a_i b_i','同一位置的两个数相乘','把两个向量第 i 个位置配成一对。','本式先逐位置相乘，再把所有乘积相加；长度不同不能这样配对。','(1,2) 与 (3,4) 的两项是 1×3 和 2×4，合计 11。'],['@sum_{i=1}^{d}','逐项求和','从第 1 个位置一直加到第 d 个位置。','它把 d 个乘积压成一个匹配分，不直接输出概率。','d=2 时只加两项；它不是将两个向量拼接。']],
    cosine:[['a@cdot b','点积：分子','逐位置相乘后求和。','提供方向与长度共同影响的匹配分；还需除以下面的长度乘积。','(1,0) 与 (-1,1) 的点积是 -1。'],['@lVert a@rVert@lVert b@rVert','两个向量长度的乘积','分别算长度，再相乘。','对非零向量消除整体尺度，得到只与夹角有关的余弦；任一向量为零时这个式子未定义。','(100,0) 与 (0,1) 的长度乘积是 100，但点积为 0，余弦仍为 0。']],
    softmax:[['e^{x_i}','当前候选的正数权重','把候选 i 的分数取指数。','分数差被变成权重比；还不是最终概率，必须除以总和。','分数相差 1 时，未归一化权重之比是 e，约 2.718。'],['@sum_j e^{x_j}','所有候选的权重总和','每个候选都取指数，再相加。','本式用同一个分母归一化，使各概率之和为 1。实际计算通常先减去最大分数，避免溢出。','两个相同分数得到相同权重，各占总和的一半。']],
    ce:[['y_i','真实标签的权重','硬分类标签常写成 one-hot：正确类为 1，其余为 0。','它选出当前样本真正所属类别的对数概率；软标签时也可以是一个分布。','真实类是“猫”时，猫这一项保留，其他类乘 0。'],['@log(@hat p_i)','预测概率的对数','把模型给类别 i 的概率取对数。','整体负号使正确类概率越低时损失越大；本页使用自然对数。','正确类概率 0.9 时损失约 0.105；0.01 时约 4.605。']],
    gradient:[['@eta','学习率','一次更新的步长系数，通常取正数。','缩放负梯度方向上的移动量；不是越大就下降越快，过大可能越过低点。','梯度为 4、学习率 0.1 时，本次从参数减去 0.4。'],['@nabla_@theta L','相对参数的梯度','损失对各参数的局部变化率组成的向量。','梯度指向局部最陡上升方向，本式减去它来尝试下降。有限步长不保证每次损失都降低。','一维 L=θ²，在 θ=2 时梯度为 4。']],
    rrf:[['@operatorname{rank}_r(d)','文档 d 在检索器 r 中的名次','本页名次从 1 开始。','越靠前，分母越小，该路贡献越大；名次不是相似度分数。','k=60，第一名贡献 1/61，第二名贡献 1/62。'],['k','平滑常数','本例取 60 的正数。','减弱前几名之间的差距。它不是返回文档数量 top-k；也不是越大越好。','保持名次不变，增大 k 会让各名次的贡献更接近。'],['@sum_{r@in R(d)}','汇总检索贡献','把返回过文档 d 的检索器集合记为 R(d)。','两路都有返回就加两项；未返回的那一路在本例贡献 0。','名次分别为 1、3 时：1/61 + 1/63 ≈ 0.03227。']],
  };
  let dialog,opener;
  function show(part,tex,button){
    if(!dialog){dialog=document.createElement('dialog');dialog.className='ov-dialog';dialog.id='overview-formula-dialog';dialog.setAttribute('aria-labelledby','ov-dialog-title');dialog.innerHTML='<button type="button" class="ov-dialog-close">关闭解释</button><h2 id="ov-dialog-title"></h2><div class="ov-dialog-equation"></div><h3>它是什么</h3><p class="ov-meaning"></p><h3>在当前公式中的作用</h3><p class="ov-role"></p><h3>放回本式看</h3><p class="ov-example-text"></p>';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
    opener=button;dialog.querySelector('h2').textContent=part[1];dialog.querySelector('.ov-meaning').textContent=part[2];dialog.querySelector('.ov-role').textContent=part[3];dialog.querySelector('.ov-example-text').textContent=part[4];window.katex.render(tex,dialog.querySelector('.ov-dialog-equation'),{displayMode:true,throwOnError:false});dialog.showModal();dialog.querySelector('button').focus();
  }
  function formulas(){if(!window.katex)return;
    root.querySelectorAll('.ov-formula[data-formula]').forEach(section=>{
      const parts=definitions[section.dataset.formula],display=section.querySelector('.katex-display');if(!parts||!display)return;
      const tex=display.querySelector('annotation')?.textContent;if(!tex)return;
      const found=parts.filter(p=>tex.includes(R(p[0])));if(found.length!==parts.length){console.error('Overview formula fragment mismatch',section.dataset.formula);return;}
      let marked=tex;const placeholders=[];
      // Protect the longest fragments first; never nest overlapping replacements.
      [...parts.keys()].sort((a,b)=>parts[b][0].length-parts[a][0].length).forEach(i=>{const fragment=R(parts[i][0]);const at=marked.indexOf(fragment);if(at<0)return;const token='OVPLACEHOLDER'+i+'END';marked=marked.slice(0,at)+token+marked.slice(at+fragment.length);placeholders.push([token,R('@htmlData{ov-term='+i+'}{')+fragment+'}']);});
      placeholders.forEach(([token,replacement])=>marked=marked.replace(token,replacement));
      const holder=document.createElement('div');window.katex.render(marked,holder,{displayMode:true,throwOnError:false,trust:ctx=>ctx.command==='\\htmlData'});display.replaceWith(holder);
      const hint=document.createElement('p');hint.className='ov-formula-cue';hint.textContent='点击公式中带虚线的部分，或用下方按钮看它在本式中的作用。';section.append(hint);
      const buttons=document.createElement('div');buttons.className='ov-formula-buttons';section.append(buttons);
      parts.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.textContent=p[1];b.addEventListener('click',()=>show(p,tex,b));buttons.append(b);holder.querySelectorAll('[data-ov-term="'+i+'"]').forEach(t=>{t.classList.add('formula-target');t.setAttribute('role','button');t.setAttribute('tabindex','0');t.setAttribute('aria-label','解释：'+p[1]);t.addEventListener('click',()=>show(p,tex,t));t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(p,tex,t);}});});});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',formulas);else formulas();
})();
