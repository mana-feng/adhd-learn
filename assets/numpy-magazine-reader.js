/* NumPy magazine v1. Optional lab enhancement, jump-only lookup and legacy-key reading place.
 * No article generation, network, progress writes or shared-reader edits.
 */
(function () {
 'use strict';
 const body=document.body;
 if(!body||body.dataset.numpyMagazine!=='v1'||body.dataset.polishModule!=='numpy-vectorization'||body.dataset.nmReaderReady)return;
 body.dataset.nmReaderReady='true';
 const q=(root,s)=>root.querySelector(s);
 const all=(root,s)=>Array.from(root.querySelectorAll(s));
 function text(root,s,value){all(root,s).forEach(el=>{el.textContent=String(value);});}
 function result(root,name,message){
  all(root,'[data-nm-result="'+name+'"]').forEach(el=>{
   const hooks=all(el,'[data-nm-value]');
   if(!hooks.length){el.textContent=message;return;}
   el.replaceChildren(document.createTextNode(message+' 当前格：'));
   const labels={'view-x1':'x[1]','view-v0':'v[0]','copy-x1':'x[1]','copy-c0':'c[0]'};
   hooks.forEach((node,i)=>{if(i)el.append(' / ');el.append((labels[node.dataset.nmValue]||'数值')+' = ',node);});
  });
 }
 function value(root,name,n){text(root,'[data-nm-value="'+name+'"]',n);}
 function validInput(input,min,max,integer){
  if(!input)return null;
  if(!input.reportValidity()||input.value.trim()==='')return null;
  const n=Number(input.value);
  return Number.isFinite(n)&&n>=min&&n<=max&&(!integer||Number.isInteger(n))?n:null;
 }
 function bindLab(lab){
  const type=lab.dataset.nmLab;
  const output=q(lab,'[data-nm-output]')||q(lab,'[data-nm-result]');
  const field=name=>q(lab,'[data-nm-input="'+name+'"]');
  const action=(name,fn)=>all(lab,'[data-nm-action="'+name+'"]').forEach(b=>b.addEventListener('click',fn));
  let bound=false;
  if(type==='axis'&&field('axis')&&output){
   const run=()=>{
    const axis=field('axis').value;if(axis!=='0'&&axis!=='1')return;
    const keep=!!field('keepdims')?.checked;
    output.textContent=axis==='0'?(keep?'[[5, 7, 9]]':'[5, 7, 9]'):(keep?'[[6], [15]]':'[6, 15]');
    text(lab,'[data-nm-shape]',axis==='0'?(keep?'(1, 3)':'(3,)'):(keep?'(2, 1)':'(2,)'));
    lab.dataset.nmAxis=axis;
   };
   action('run',run);field('axis').addEventListener('change',run);field('keepdims')?.addEventListener('change',run);bound=true;
  }
  if(type==='broadcast'&&field('preset')&&output){
   const presets={
    ok:'(2, 3) + (3,) → (2, 3)。从右对齐：3 与 3 相同，缺失的左维按 1 处理。',
    bad:'(2, 3) + (2,) 不兼容：最右侧 3 与 2 既不相等，也没有一方为 1。',
    expand:'(4, 1, 3) + (2, 3) → (4, 2, 3)。右对齐后，两处为 1 的维度可以扩展。'
   };
   const run=()=>{const p=field('preset').value;if(presets[p]){output.textContent=presets[p];lab.dataset.nmPreset=p;}};
   action('run',run);field('preset').addEventListener('change',run);bound=true;
  }
  if(type==='view-copy'&&field('value')&&q(lab,'[data-nm-result="view"]')&&q(lab,'[data-nm-result="copy"]')){
   let viewX=[10,20,30,40],copyX=[10,20,30,40],copyC=[20,30];
   function draw(){
    value(lab,'view-x1',viewX[1]);value(lab,'view-v0',viewX[1]);value(lab,'copy-x1',copyX[1]);value(lab,'copy-c0',copyC[0]);
    all(lab,'[data-nm-mark="view-change"]').forEach(e=>e.classList.toggle('is-changed',viewX[1]!==20));
    all(lab,'[data-nm-mark="copy-change"]').forEach(e=>e.classList.toggle('is-changed',copyC[0]!==20));
   }
   action('write-view',()=>{
    const n=validInput(field('value'),-999,999,true);if(n===null)return;
    viewX[1]=n;draw();result(lab,'view','v = ['+n+', 30]；x = [10, '+n+', 30, 40]。两个入口对应同一数据格。');
   });
   action('reset-view',()=>{viewX=[10,20,30,40];draw();result(lab,'view','视图这一轮已还原：x = [10, 20, 30, 40]，v = [20, 30]；复制对照不受影响。');});
   action('write-copy',()=>{copyC[0]=99;draw();result(lab,'copy','c = [99, 30]；x = [10, 20, 30, 40]。这一轮使用独立的初始数据与独立副本。');});
   action('reset-copy',()=>{copyX=[10,20,30,40];copyC=[20,30];draw();result(lab,'copy','复制这一轮已还原：x = [10, 20, 30, 40]，c = [20, 30]；视图实验不受影响。');});
   action('read-advanced',()=>result(lab,'advanced','读取 w = x[[1, 2]] 后改 w[0]：w = [99, 30]，x 仍为 [10, 20, 30, 40]。高级索引读取给出副本。'));
   action('write-advanced',()=>result(lab,'advanced','直接执行 x[[1, 2]] = 99：x = [10, 99, 99, 40]。这是对原数组的索引赋值，不是先读出 w 再改 w。'));
   bound=true;
  }
  if(type==='uint8'&&field('value')&&output){
   const run=()=>{const n=validInput(field('value'),0,255,true);if(n===null)return;output.textContent=n+' + 1 → '+((n+1)%256)+'（已有 uint8 数据的模 256 算术示意）。';};
   action('run',run);bound=true;
  }
  if(type==='logsum'&&field('a')&&field('b')&&output){
   const run=()=>{
    const a=validInput(field('a'),-1000,1000,false),b=validInput(field('b'),-1000,1000,false);if(a===null||b===null)return;
    const direct=Math.log(Math.exp(a)+Math.exp(b)),m=Math.max(a,b),stable=m+Math.log1p(Math.exp(Math.min(a,b)-m));
    const show=n=>Number.isFinite(n)?String(Number(n.toFixed(9))):String(n);
    value(lab,'direct',show(direct));value(lab,'stable',show(stable));
    output.textContent='直接展开：'+show(direct)+'；先减最大值再计算：'+show(stable)+'。这是浏览器浮点算术示意，不是 NumPy 实测。';
   };
   action('run',run);bound=true;
  }
  if(bound){all(lab,'[data-nm-enhance]').forEach(el=>{el.disabled=false;});lab.dataset.nmEnhanced='true';}
 }
 all(body,'.nm-lab[data-nm-lab]').forEach(bindLab);
 // Old fragment URLs must still reach content placed inside optional depth details.
 function reveal(id){const target=document.getElementById(id);if(!target)return;let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}
 function revealHash(){try{reveal(decodeURIComponent(location.hash.slice(1)));}catch(_){}}
 revealHash();addEventListener('hashchange',revealHash);
 body.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;try{const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname===location.pathname&&u.hash)reveal(decodeURIComponent(u.hash.slice(1)));}catch(_){}});
 // Results are jump links; all original rows remain present and readable.
 all(body,'.nm-search').forEach(search=>{
  const input=q(search,'[data-nm-query]'),list=q(search,'[data-nm-results]'),status=q(search,'[data-nm-search-status]');
  if(!input||!list||!status)return;
  const rows=all(body,'.nm-reference table tbody tr');
  rows.forEach((row,i)=>{if(!row.id){let id='nm-lookup-'+(i+1);while(document.getElementById(id))id+='-r';row.id=id;}});
  input.disabled=false;
  input.addEventListener('input',()=>{
   list.replaceChildren();const words=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
   if(!words.length){status.textContent='输入症状或关键词；完整表格始终保留。';return;}
   const hits=rows.filter(row=>words.every(w=>row.textContent.toLowerCase().includes(w)));
   status.textContent=hits.length?'找到 '+hits.length+' 条，以下列出前 '+Math.min(10,hits.length)+' 条定位入口。':'没有找到；可以换短一点的词，或直接读下面的完整表格。';
   hits.slice(0,10).forEach(row=>{const li=document.createElement('li'),a=document.createElement('a');a.href='#'+encodeURIComponent(row.id);a.textContent=row.cells[0]?.textContent.trim()||'查看条目';li.append(a);list.append(li);});
  });
 });
 // Preserve old reading-place:v1 strings and existing IDs, not demo storage or a migration.
 if(body.dataset.nmKind==='catalog')return;
 const stops=all(body,'[data-nm-stop][id]');if(!stops.length)return;
 const key='reading-place:v1:'+decodeURI(location.pathname);
 const originalSave=q(body,'.cross-layout .lesson-save'),originalStatus=q(body,'.cross-layout .lesson-save-status');
 const statuses=all(body,'.nm-resume-status');
 function existing(id){return typeof id==='string'&&document.getElementById(id);}
 function title(id){return existing(id)?.textContent.trim().slice(0,110)||'这一段';}
 function renderStatus(el,id,message){
  el.replaceChildren(document.createTextNode(message+' '));
  const a=document.createElement('a');a.href='#'+encodeURIComponent(id);a.textContent='回到这一段';el.append(a);
 }
 try{const id=localStorage.getItem(key);if(existing(id))statuses.forEach(el=>renderStatus(el,id,'上次记下：'+title(id)+'。'));}catch(_){statuses.forEach(el=>{el.textContent='浏览器不能读取保存位置；仍可使用小节链接。';});}
 function current(){let id=stops[0].id;stops.filter(el=>el.getClientRects().length).forEach(el=>{if(el.getBoundingClientRect().top<=innerHeight*.4)id=el.id;});return id;}
 let floatingFeedback;
 function save(button){
  const explicit=(button.dataset.nmSave||'').replace(/^#/,'');
  const id=existing(explicit)?explicit:current();
  if(!existing(id))return;
  const status=button.parentElement?.querySelector('[data-nm-save-status]')||statuses[0];
  let message;
  try{
   if(originalSave&&!explicit){
    originalSave.click();
    if(!originalStatus.querySelector('a'))throw new Error('Original reader did not confirm saving');
    const saved=localStorage.getItem(key);if(existing(saved)){message=originalStatus.textContent;[status,floatingFeedback].filter(Boolean).forEach(el=>renderStatus(el,saved,message));return;}
   }
   localStorage.setItem(key,id);message='已记住：'+title(id)+'。';
   if(originalStatus)renderStatus(originalStatus,id,message);
   [status,floatingFeedback].filter(Boolean).forEach(el=>renderStatus(el,id,message));
  }catch(_){
   message='未保存：浏览器存储不可用。可收藏或复制本节链接。';
   [status,floatingFeedback].filter(Boolean).forEach(el=>renderStatus(el,id,message));
  }
 }
 all(body,'[data-nm-save]').forEach(button=>{button.disabled=false;button.addEventListener('click',()=>save(button));});
 // 04 already owns a reachable floating save. Never add a second permanent toolbar.
 if(!q(body,'.polish-cross-save-button')&&!originalSave){
  const floating=document.createElement('div');floating.className='nm-save-floating';
  floatingFeedback=document.createElement('p');floatingFeedback.className='nm-floating-feedback';floatingFeedback.setAttribute('role','status');floatingFeedback.hidden=true;
  const button=document.createElement('button');button.type='button';button.dataset.nmSave='';button.textContent='记住当前小节';
  let timer;button.addEventListener('click',()=>{save(button);floatingFeedback.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{if(!floatingFeedback.contains(document.activeElement))floatingFeedback.hidden=true;},7000);});
  floating.append(floatingFeedback,button);body.append(floating);
 }
})();
