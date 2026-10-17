
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const dayNames=['周日','周一','周二','周三','周四','周五','周六'];
const iso=d=>d.toISOString().slice(0,10), todayKey=()=>iso(new Date());
const DEFAULT_PRODUCTS=[
{name:'优色林清痘净颜精华',cat:'2%水杨酸+淡印活性',stock:2,role:'当前酸类主力',repurchase:'否',group:'acid',priority:1},
{name:'理肤泉三酸精华',cat:'复合酸',stock:1,role:'封存候补',repurchase:'否',group:'acid',priority:2},
{name:'理肤泉B5霜',cat:'修护',stock:1,role:'急救/保湿',repurchase:'可选',group:'repair'},
{name:'科颜萃B5精华',cat:'修护保湿',stock:1,role:'日常修护',repurchase:'可选',group:'repair'},
{name:'DR.WU焕肤抛光修护精粹乳',cat:'修护乳',stock:1,role:'日常保湿',repurchase:'否',group:'repair'},
{name:'DR.WU美白淡斑焕肤精粹水',cat:'提亮型精粹水',stock:1,role:'辅助提亮',repurchase:'否',group:'bright'},
{name:'DR.WU透光美白赋活面霜',cat:'提亮面霜',stock:1,role:'保湿+提亮',repurchase:'否',group:'bright'},
{name:'阿达帕林',cat:'维A类控痘',stock:1,role:'长期核心',repurchase:'是',group:'retinoid'},
{name:'12%烟酰胺+2%α熊果苷+1%传明酸精华',cat:'高浓度提亮',stock:1,role:'库存消耗',repurchase:'否',group:'bright'}
];
const SKIN={
'周一':['阿达帕林','洁面 / 脸干 → 阿达帕林 → 修护乳/B5','不叠加酸'],
'周二':['酸类主力','洁面 → 当前酸类主力 → B5/修护乳','不叠加阿达帕林'],
'周三':['提亮修护','洁面 → 提亮精华 → DR.WU面霜/修护乳','刺激时纯修护'],
'周四':['阿达帕林','洁面 / 脸干 → 阿达帕林 → 修护乳/B5','不叠加酸'],
'周五':['酸类主力/修护','洁面 → 当前酸类主力（耐受时）→ 修护','皮肤干就休息'],
'周六':['温和美白','洁面 → DR.WU精粹水 → 美白霜','温和清库存'],
'周日':['纯修护','洁面 → B5 → 修护乳/B5霜','不安排强活性']
};
const EX={
'周一':['下肢力量','45–60 分钟','深蹲 + 臀桥 15 分钟'],
'周二':['快走 / 散步','30 分钟','饭后走 10 分钟'],
'周三':['上肢 + 核心','45–60 分钟','15 分钟简化训练'],
'周四':['恢复 / 步行','20–40 分钟','饭后走 10 分钟'],
'周五':['全身力量','45 分钟','15 分钟全身'],
'周六':['喜欢的运动','30–60 分钟','轻松走路'],
'周日':['休息','—','散步即可']
};
const MODES={
normal:{name:'普通模式',cls:'',title:'按正常节奏生活。',sub:'不追求满分，保持基本盘。'},
travel:{name:'出差模式',cls:'travel',title:'Travel Minimum',sub:'蛋白质早餐 · 饭后走路 · 15分钟训练 · 基础护肤 · 英语10分钟'},
pms:{name:'PMS 模式',cls:'pms',title:'PMS：降低摩擦，不降低照顾',sub:'允许食欲和能量波动；运动可降级，优先睡眠与规律进食。'},
recovery:{name:'恢复模式',cls:'recovery',title:'恢复模式：先把屏障和精力拉回来',sub:'护肤纯修护 · 运动只散步 · 睡眠优先 · 不补作业。'}
};
function load(){
 try{return JSON.parse(localStorage.getItem('jasmineOS'))||null}catch{return null}
}
let state=load()||{
 version:3, mode:'normal', products:DEFAULT_PRODUCTS, logs:{}, weeklyNotes:{},
 cycle:{lastPeriod:'',length:30}, settings:{bedTime:'00:00',reminderTime:'21:30'}
};
if(!state.products?.length) state.products=DEFAULT_PRODUCTS;
function save(){localStorage.setItem('jasmineOS',JSON.stringify(state))}
function log(){
 const k=todayKey();
 if(!state.logs[k]) state.logs[k]={
  skincare:false,diet:false,exercise:false,study:false,sleep:false,review:false,
  dietItems:{protein:false,veg:false,walk:false,sweets:false},emotionFood:'无',
  studyItems:{input:false,output:false},sleepHours:null,pms:[]
 };
 return state.logs[k];
}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function activeAcid(){
 return state.products.filter(p=>p.group==='acid'&&Number(p.stock)>0).sort((a,b)=>(a.priority||99)-(b.priority||99))[0];
}
function modeAdjustedSkin(day){
 const m=state.mode;
 if(m==='recovery') return ['纯修护','洁面 → B5 → 修护乳/B5霜','暂停所有强活性'];
 if(m==='travel') return ['基础护肤','洁面 → 修护乳；白天防晒','出差只守基本盘'];
 const base=[...SKIN[day]];
 const acid=activeAcid();
 if(base[0].includes('酸类')) {
   if(acid) base[1]=`洁面 → ${acid.name} → B5/修护乳`;
   else base[1]='洁面 → 纯修护（酸类库存已清空）';
 }
 if(m==='pms' && (day==='周五'||day==='周六')) return ['修护优先','洁面 → B5 → 修护乳/面霜','状态差时不刷酸'];
 return base;
}
function modeAdjustedExercise(day){
 const b=[...EX[day]];
 if(state.mode==='travel') return ['出差最低训练','15 分钟', '深蹲 + 臀桥 + 俯卧撑/墙推 + 平板'];
 if(state.mode==='pms') return [b[0]+'（可降级）',b[1],'散步 10–20 分钟也算完成'];
 if(state.mode==='recovery') return ['恢复活动','10–30 分钟','轻松散步即可'];
 return b;
}
function renderHeader(){
 const d=new Date();$('#dateLabel').textContent=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 · ${dayNames[d.getDay()]}`;
 $('#modeButton').textContent=MODES[state.mode].name;
}
function renderMode(){
 const m=MODES[state.mode];
 $('#modeBanner').innerHTML=state.mode==='normal'?'':`<div class="banner ${m.cls}"><strong>${m.title}</strong><div class="sub">${m.sub}</div></div>`;
 $('#heroSub').textContent=m.sub;
 $$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
}
function renderToday(){
 const l=log(), tasks=[
 ['skincare','护肤','完成今晚计划；不叠加互斥活性'],
 ['diet','饮食','蛋白质 + 蔬菜 + 饭后走路'],
 ['exercise','运动','正式版或最低版本'],
 ['study','英语','输入或输出至少 10 分钟'],
 ['sleep','睡眠','给自己 ≥ 7 小时睡眠机会'],
 ['review','30秒复盘','今天有一件事做得不错就够了']
 ];
 const box=$('#coreTasks');box.innerHTML='';
 tasks.forEach(([k,t,s])=>{const e=document.createElement('label');e.className='task';e.innerHTML=`<input type=checkbox data-core="${k}" ${l[k]?'checked':''}><div class=task-main><div class=title>${t}</div><div class=sub>${s}</div></div>`;box.appendChild(e)});
 $$('[data-core]').forEach(i=>i.onchange=()=>{l[i.dataset.core]=i.checked;save();renderToday()});
 const done=tasks.filter(([k])=>l[k]).length,pct=Math.round(done/tasks.length*100);
 $('#doneCount').textContent=`${done} / ${tasks.length}`;$('#ringText').textContent=pct+'%';$('#ring').style.background=`conic-gradient(var(--sage) ${pct}%,#E7E3DD ${pct}%)`;
 const day=dayNames[new Date().getDay()], s=modeAdjustedSkin(day);
 $('#tonightSkin').innerHTML=`<h3>${day} · ${s[0]}</h3><p>${s[1]}</p><span class=badge>${s[2]}</span>`;
 const e=modeAdjustedExercise(day);$('#todayExercise').innerHTML=`<h3>${e[0]}</h3><p>${e[1]}</p><span class=badge>最低版：${e[2]}</span>`;
 renderMetrics(7,'#weekMetrics');
}
function renderMetrics(days,target){
 const keys=[['skincare','护肤'],['diet','饮食'],['exercise','运动'],['study','英语']];
 const today=new Date(), rows=Object.entries(state.logs).filter(([d])=>{const diff=(today-new Date(d))/86400000;return diff>=0&&diff<days});
 const el=$(target);el.innerHTML='';
 keys.forEach(([k,name])=>{const p=rows.length?Math.round(rows.filter(([,v])=>v[k]).length/rows.length*100):0;el.insertAdjacentHTML('beforeend',`<div class="metric card"><span>${name}</span><strong>${p}%</strong></div>`)});
}
function renderSkin(){
 const day=dayNames[new Date().getDay()], box=$('#skinWeek');box.innerHTML='';
 ['周一','周二','周三','周四','周五','周六','周日'].forEach(d=>{const s=modeAdjustedSkin(d);box.insertAdjacentHTML('beforeend',`<div class="row ${d===day?'today':''}"><div style="width:46px;font-weight:800">${d}</div><div><div class=title>${s[0]}</div><div class=sub>${s[1]}</div><span class=badge>${s[2]}</span></div></div>`)});
 const acid=activeAcid(), next=state.products.filter(p=>p.group==='acid'&&Number(p.stock)>0).sort((a,b)=>(a.priority||99)-(b.priority||99))[1];
 $('#inventoryNotice').innerHTML=acid?`<div class=handoff><strong>当前酸类主力：</strong>${acid.name}${next?`<br><span class=sub>用完后自动候补：${next.name}</span>`:''}</div>`:`<div class=handoff>酸类库存已清空。以后无需同时囤多瓶酸。</div>`;
 const pbox=$('#productList');pbox.innerHTML='';
 state.products.forEach((p,i)=>pbox.insertAdjacentHTML('beforeend',`<div class=product><div class=product-head><div><div class=title>${p.name}</div><small>${p.cat} · ${p.role}</small></div><div class=stock><button data-dec="${i}">−</button><strong>${Number(p.stock).toFixed(1)}</strong><button data-inc="${i}">＋</button></div></div><div class=sub>回购：${p.repurchase||'待决定'}</div></div>`));
 $$('[data-dec]').forEach(b=>b.onclick=()=>{let p=state.products[+b.dataset.dec];p.stock=Math.max(0,Number(p.stock)-.5);save();renderAll(); if(p.stock===0)toast(`${p.name} 已空瓶`)});
 $$('[data-inc]').forEach(b=>b.onclick=()=>{state.products[+b.dataset.inc].stock=Number(state.products[+b.dataset.inc].stock)+.5;save();renderAll()});
}
function renderDiet(){
 const l=log(),items=[['protein','每餐优先蛋白质'],['veg','至少两餐有蔬菜/纤维'],['walk','至少一次饭后走 10–15 分钟'],['sweets','甜食尽量不空腹单独吃']];
 const b=$('#dietItems');b.innerHTML='';items.forEach(([k,t])=>b.insertAdjacentHTML('beforeend',`<label class=checkline><input type=checkbox data-diet="${k}" ${l.dietItems[k]?'checked':''}><span>${t}</span></label>`));
 $$('[data-diet]').forEach(i=>i.onchange=()=>{l.dietItems[i.dataset.diet]=i.checked;l.diet=Object.values(l.dietItems).filter(Boolean).length>=3;save();renderToday()});
 const vals=['无','轻微','明显'];$('#emotionFoodChips').innerHTML=vals.map(v=>`<button class="chip ${l.emotionFood===v?'active':''}" data-emotion="${v}">${v}</button>`).join('');
 $$('[data-emotion]').forEach(b=>b.onclick=()=>{l.emotionFood=b.dataset.emotion;save();renderDiet()});
}
function renderExercise(){
 const day=dayNames[new Date().getDay()], e=modeAdjustedExercise(day), l=log();
 $('#exerciseCard').innerHTML=`<div class=eyebrow>${day}</div><h2>${e[0]}</h2><p>${e[1]}</p><button id=fullExercise class="primary full">${l.exercise?'已完成 ✓':'完成正式版'}</button>`;
 $('#minimumExercise').textContent=e[2];
 $('#fullExercise').onclick=()=>{l.exercise=!l.exercise;save();renderAll()};
 $('#minExerciseDone').textContent=l.exercise?'已完成 ✓':'完成最低版本';
 $('#minExerciseDone').onclick=()=>{l.exercise=true;save();renderAll();toast('最低版本也算完成')};
}
function renderStudy(){
 const l=log();$$('.study-btn').forEach(b=>{const k=b.dataset.study;b.textContent=l.studyItems[k]?'已完成 ✓':'标记完成';b.classList.toggle('primary',l.studyItems[k]);b.onclick=()=>{l.studyItems[k]=!l.studyItems[k];l.study=Object.values(l.studyItems).some(Boolean);save();renderAll()}});
}
function renderCycle(){
 $('#lastPeriodDate').value=state.cycle.lastPeriod||'';$('#cycleLength').value=state.cycle.length||30;
 const l=log(),vals=['无','食欲↑','水肿','情绪波动','疲劳','痛经'];
 $('#pmsChips').innerHTML=vals.map(v=>`<button class="chip ${l.pms.includes(v)?'active':''}" data-pms="${v}">${v}</button>`).join('');
 $$('[data-pms]').forEach(b=>b.onclick=()=>{const v=b.dataset.pms;l.pms=l.pms.includes(v)?l.pms.filter(x=>x!==v):[...l.pms,v];save();renderCycle()});
 if(state.cycle.lastPeriod){
   const last=new Date(state.cycle.lastPeriod),len=Number(state.cycle.length||30),next=new Date(last);next.setDate(last.getDate()+len);
   const diff=Math.ceil((next-new Date(todayKey()))/86400000);
   $('#cycleEstimateTitle').textContent='粗略周期提示';
   $('#cycleEstimateText').textContent=diff>=0?`按 ${len} 天周期估算，距离下一次月经约 ${diff} 天。`:`估算日期已过 ${Math.abs(diff)} 天；如果周期持续明显延迟，可记录后再评估。`;
 }
}
function renderSleep(){
 const l=log();$('#sleepHours').value=l.sleepHours??'';$('#bedTime').value=state.settings.bedTime||'00:00';
}
function renderReview(){renderMetrics(30,'#monthMetrics');const ws=weekStartKey();$('#weeklyNote').value=state.weeklyNotes[ws]||''}
function weekStartKey(){const d=new Date(),x=d.getDay()===0?6:d.getDay()-1;d.setDate(d.getDate()-x);return iso(d)}
function renderSettings(){
 $('#reminderTime').value=state.settings.reminderTime||'21:30';$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
}
function renderAll(){renderHeader();renderMode();renderToday();renderSkin();renderDiet();renderExercise();renderStudy();renderCycle();renderSleep();renderReview();renderSettings()}

$$('.nav').forEach(b=>b.onclick=()=>{$$('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.target).classList.add('active');scrollTo({top:0,behavior:'smooth'})});
$$('[data-goto]').forEach(b=>b.onclick=()=>document.querySelector(`.nav[data-target="${b.dataset.goto}"]`)?.click());
$$('[data-skin-tab]').forEach(b=>b.onclick=()=>{$$('[data-skin-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');['plan','inventory','rules'].forEach(t=>$(`#skin${t[0].toUpperCase()+t.slice(1)}Pane`).classList.toggle('hidden',b.dataset.skinTab!==t))});
$('#modeButton').onclick=()=>$('#modeDialog').showModal();$('#closeMode').onclick=()=>$('#modeDialog').close();
$$('[data-dialog-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.dialogMode;save();$('#modeDialog').close();renderAll()});
$$('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();renderAll();toast(`已切换：${MODES[state.mode].name}`)});
$('#saveCycle').onclick=()=>{state.cycle.lastPeriod=$('#lastPeriodDate').value;state.cycle.length=Number($('#cycleLength').value||30);save();renderAll();toast('周期设置已保存')};
$('#saveSleep').onclick=()=>{const l=log();l.sleepHours=Number($('#sleepHours').value||0)||null;l.sleep=(l.sleepHours||0)>=7;state.settings.bedTime=$('#bedTime').value;save();renderAll();toast('睡眠已保存')};
$('#saveWeekly').onclick=()=>{state.weeklyNotes[weekStartKey()]=$('#weeklyNote').value;save();toast('本周复盘已保存')};
$('#addProduct').onclick=()=>$('#productDialog').showModal();$('#cancelProduct').onclick=()=>$('#productDialog').close();
$('#productForm').onsubmit=e=>{e.preventDefault();state.products.push({name:$('#pName').value.trim(),cat:$('#pCategory').value.trim()||'未分类',stock:Number($('#pStock').value||1),role:$('#pRole').value.trim()||'库存',repurchase:$('#pRepurchase').value,group:'other'});save();$('#productDialog').close();e.target.reset();renderAll()};
$('#enableNotifications').onclick=async()=>{if(!('Notification'in window))return toast('当前浏览器不支持通知');const p=await Notification.requestPermission();toast(p==='granted'?'已允许通知':'未获得通知权限')};
$('#reminderTime').onchange=()=>{state.settings.reminderTime=$('#reminderTime').value;save()};
setInterval(()=>{if(Notification.permission!=='granted')return;const d=new Date(),t=state.settings.reminderTime;if(!t)return;const now=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;const key=`notify-${todayKey()}-${t}`;if(now===t&&!sessionStorage.getItem(key)){new Notification('Jasmine OS',{body:'30秒回顾：护肤、运动、英语、睡眠准备。'});sessionStorage.setItem(key,'1')}},30000);
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Jasmine_OS_backup_${todayKey()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('#importData').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();renderAll();toast('备份已导入')}catch{alert('备份文件无法读取')}};r.readAsText(f)};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
renderAll();
