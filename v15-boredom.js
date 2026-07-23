(function(){
'use strict';
const BoredomHubV15={
  pools:{
    quick:['امشِ دقيقتين في المكان وعدّ 30 خطوة','اشرب كوب ماء ببطء','رتّب سطحًا صغيرًا حولك','اكتب ثلاث حاجات نفسك تعملها هذا الأسبوع','افتح الشباك وخذ خمس أنفاس هادئة','اختر صورة قديمة واكتب ذكراها في سطر','اعمل مشروبًا تحبه بدون موبايل','اقرأ صفحتين من أي كتاب'],
    funny:['قلّد مذيع نشرة أخبار وهو يصف يومك','ارسم قطة بيدك غير المعتادة','اختر شيئًا قريبًا وسوّق له كأنه اختراع القرن','امشِ عشر خطوات كأنك بطل فيلم أكشن','اكتب عنوانًا مضحكًا لفيلم عن يومك','حاول تقول جملة «خيط حرير على حيط خليل» ثلاث مرات بسرعة'],
    questions:['لو كان يومك لونًا، ما اللون ولماذا؟','ما الشيء الصغير الذي يحسن مزاجك فورًا؟','لو عندك ساعة بلا مسؤوليات، ماذا ستفعل؟','أي مهارة غريبة تتمنى تتقنها؟','ما أجمل مجاملة ما زلت تتذكرها؟','لو تقدر ترسل رسالة لنفسك قبل سنة، ماذا تقول؟'],
    facts:['للأخطبوط ثلاثة قلوب.','يوم كوكب الزهرة أطول من سنته.','أسماك القرش أقدم على الأرض من الأشجار.','تتمدد المعادن بالحرارة؛ لذلك يزداد ارتفاع برج إيفل قليلًا صيفًا.','الموز يُعدّ ثمرة توت نباتيًا، بينما الفراولة ليست كذلك.','فضلات حيوان الومبت مكعبة الشكل.'],
    would:['تعيش أسبوعًا بلا إنترنت أم بلا حلويات؟','تقرأ الأفكار أم تتحدث كل اللغات؟','تسافر للماضي أم للمستقبل؟','تضحك كلما توترت أم تعطس كلما فرحت؟','تملك وقتًا أكثر أم طاقة أكثر؟'],
    truth:['ما أكثر عادة تؤجل تغييرها؟','ما آخر شيء جعلك تضحك من قلبك؟','ما قرار صغير أنت فخور به؟','ما الشيء الذي تحتاج أن تقول له: كفاية؟'],
    dare:['أرسل رسالة امتنان لشخص تحبه','تحرك دقيقة كاملة الآن','ضع الموبايل بعيدًا لخمس دقائق','قل لنفسك بصوت مسموع شيئًا تقدّره فيها','التقط صورة لشيء جميل قريب منك'],
    ten:['اذكر خمسة أشياء لونها أخضر','قف على قدم واحدة','اكتب اسم ثلاث مدن','ابتسم بدون سبب حتى ينتهي الوقت','اذكر ثلاث نعم حولك الآن'],
    missions:['مهمتك السرية: اجعل شخصًا يبتسم اليوم','مهمتك السرية: اترك مكانًا أنظف مما وجدته','مهمتك السرية: اشرب ماء قبل أي مشروب آخر','مهمتك السرية: امدح مجهود شخص بصدق','مهمتك السرية: عشر دقائق بلا شاشة'],
    riddles:[
      ['شيء كلما أخذت منه كبر، ما هو؟','الحفرة'],
      ['له أسنان ولا يعض، ما هو؟','المشط'],
      ['يمشي بلا قدمين ويبكي بلا عينين، ما هو؟','السحاب'],
      ['ما الذي يكتب ولا يقرأ؟','القلم']
    ]
  },
  state(){return Storage.get('boredom_v15',{xp:0,coins:0,done:0,level:1})},
  save(s){s.level=Math.floor(s.xp/50)+1;Storage.set('boredom_v15',s)},
  pick(a){return a[Math.floor(Math.random()*a.length)]},
  open(){
    const s=this.state();
    Modal.open(`<div class="boredom-shell">
      <div class="boredom-head"><span class="boredom-emoji">😎</span><div><h2>أنا زهقان</h2><p>جرعة خفيفة تكسر الملل من غير تمرير ساعتين على الموبايل 😄</p></div></div>
      <div class="boredom-stats"><span>⭐ مستوى ${s.level}</span><span>⚡ ${s.xp} XP</span><span>🪙 ${s.coins}</span></div>
      <div class="boredom-main">
        <label class="label">درجة الزهق: <strong id="boredomLevelText">5/10</strong></label>
        <input id="boredomLevel" type="range" class="slider" min="1" max="10" value="5" oninput="document.getElementById('boredomLevelText').textContent=this.value+'/10'">
        <button class="btn boredom-surprise block lg" onclick="BoredomHubV15.surprise()">🎲 فاجئني بحاجة دلوقتي</button>
      </div>
      <div class="boredom-grid">
        ${[['quick','⚡','حاجة سريعة'],['funny','😂','تحدٍ مضحك'],['questions','🤔','سؤال غريب'],['facts','🧠','معلومة حقيقية'],['would','⚖️','تختار إيه؟'],['truth','🪞','صراحة'],['dare','🔥','تحدٍ آمن'],['ten','⏱️','لعبة 10 ثوانٍ'],['missions','🕵️','مهمة سرية'],['riddles','🧩','لغز']].map(x=>`<button onclick="BoredomHubV15.category('${x[0]}')"><span>${x[1]}</span>${x[2]}</button>`).join('')}
      </div>
      <button class="btn ghost block" onclick="Modal.close()">رجوع</button>
    </div>`);
  },
  surprise(){const keys=['quick','funny','questions','facts','would','truth','dare','ten','missions','riddles'];this.category(this.pick(keys))},
  category(key){
    const val=this.pick(this.pools[key]);
    if(key==='ten'){this.timer(val);return}
    const text=Array.isArray(val)?val[0]:val;
    const answer=Array.isArray(val)?val[1]:'';
    Modal.open(`<div class="boredom-shell boredom-result">
      <div class="boredom-card"><div class="boredom-big">${key==='facts'?'🧠':key==='riddles'?'🧩':'✨'}</div><div class="boredom-text">${Utils.escapeHTML(text)}</div>
      ${answer?`<button class="btn outline block mt-3" onclick="this.nextElementSibling.classList.remove('hidden');this.remove()">أظهر الإجابة</button><div class="boredom-answer hidden">${Utils.escapeHTML(answer)}</div>`:''}</div>
      <div class="chips"><button class="btn primary" onclick="BoredomHubV15.complete()">تمت ✅</button><button class="btn gold" onclick="BoredomHubV15.category('${key}')">واحدة ثانية</button><button class="btn ghost" onclick="BoredomHubV15.open()">القائمة</button></div>
    </div>`);
  },
  timer(text){
    Modal.open(`<div class="boredom-shell boredom-result"><div class="boredom-card"><div class="boredom-big">⏱️</div><div class="boredom-text">${Utils.escapeHTML(text)}</div><div id="boredomTimer" class="boredom-timer">10</div><button class="btn primary block" onclick="BoredomHubV15.startTimer()">ابدأ</button></div><button class="btn ghost block" onclick="BoredomHubV15.open()">القائمة</button></div>`);
  },
  startTimer(){
    let n=10,el=document.getElementById('boredomTimer');if(!el)return;
    const id=setInterval(()=>{n--;el.textContent=n;if(n<=0){clearInterval(id);el.textContent='تم! 🎉';NotificationAudioV12?.play('success');setTimeout(()=>this.complete(),700)}},1000);
  },
  complete(){
    const s=this.state();s.xp+=10;s.coins+=5;s.done++;this.save(s);
    Toast.show('كسرت الزهق! +10 خبرة و+5 عملات 🎉','success',6500);
    this.open();
  }
};
window.BoredomHubV15=BoredomHubV15;App.openBoredom=()=>BoredomHubV15.open();

const oldHomeV15=UI.renderHome.bind(UI);
UI.renderHome=async function(...a){const r=await oldHomeV15(...a),c=document.getElementById('homeContent');if(c&&!document.getElementById('boredomHomeV15')){const d=document.createElement('div');d.id='boredomHomeV15';d.className='card boredom-home';d.innerHTML='<div><div class="card-title">😎 أنا زهقان</div><div class="card-sub">ألعاب سريعة، تحديات خفيفة، أسئلة ومهمات تكسر الملل.</div></div><button class="btn primary" onclick="BoredomHubV15.open()">اكسر الزهق</button>';const hero=c.querySelector('.v14-opening-card,.v13-hero,.card');hero?.insertAdjacentElement('afterend',d)||c.prepend(d)}return r};

const oldWorshipV15=UI.renderWorship.bind(UI);
UI.renderWorship=async function(...a){const r=await oldWorshipV15(...a),c=document.getElementById('worshipContent');if(c&&!document.getElementById('adhkarHubV15')){const d=document.createElement('div');d.id='adhkarHubV15';d.className='card adhkar-hub-v15';d.innerHTML=`<div class="card-title"><span>📿 الأذكار كاملة وواضحة</span><span class="badge teal">اليوم والليلة</span></div><div class="card-sub">الصباح والمساء والنوم والاستيقاظ وأذكار المواقف في قسم مستقل.</div><button class="btn primary block lg mt-3" onclick="Nav.go('azkar')">افتح قسم الأذكار</button><div class="chips"><button class="btn sm outline" onclick="AdhkarSession.start('morning')">🌅 أذكار الصباح</button><button class="btn sm outline" onclick="AdhkarSession.start('evening')">🌙 أذكار المساء</button></div>`;c.prepend(d)}return r};

const oldItemsV15=SmartNowV13.items.bind(SmartNowV13);
SmartNowV13.items=async function(){const r=await oldItemsV15();r.items.splice(Math.min(1,r.items.length),0,{icon:'😎',title:'أنا زهقان',sub:'نشاط مفاجئ يغيّر الجو',action:'boredom'});if(!r.items.some(x=>x.action==='all_adhkar'))r.items.push({icon:'📿',title:'الأذكار كاملة',sub:'الصباح والمساء واليوم والليلة',action:'all_adhkar'});return r};
const oldRunV15=SmartNowV13.run.bind(SmartNowV13);
SmartNowV13.run=async function(a){if(a==='boredom'){BoredomHubV15.open();return}if(a==='all_adhkar'){Modal.close();Nav.go('azkar');return}if(a==='morning'||a==='evening'){AdhkarSession.start(a);return}return oldRunV15(a)};

if(window.NotificationAudioV12){
  NotificationAudioV12.volume=Storage.get('notification_volume_v15',.85);
  NotificationAudioV12.setVolume=function(v){this.volume=Math.max(.15,Math.min(1,Number(v)||.85));Storage.set('notification_volume_v15',this.volume);this.play('success')};
  NotificationAudioV12.play=function(type='info'){
    if(!this.enabled)return;this.unlock();if(!this.ctx||this.ctx.state!=='running')return;
    const now=this.ctx.currentTime,notes=type==='error'?[392,294,247]:type==='success'?[523,659,784]:[440,554,659];
    notes.forEach((freq,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=freq;const peak=Math.min(.42,.22*this.volume);g.gain.setValueAtTime(.0001,now+i*.13);g.gain.exponentialRampToValueAtTime(peak,now+i*.13+.025);g.gain.exponentialRampToValueAtTime(.0001,now+i*.13+.28);o.connect(g);g.connect(this.ctx.destination);o.start(now+i*.13);o.stop(now+i*.13+.3)});
  };
}
try{
  const oldSettingsV15=UI.renderSettings.bind(UI);
  UI.renderSettings=async function(...a){const r=await oldSettingsV15(...a),c=document.getElementById('settingsContent');if(c&&!document.getElementById('volumeSettingV15')){const d=document.createElement('div');d.id='volumeSettingV15';d.className='set-row';d.innerHTML=`<div class="sr-icon">🔊</div><div class="sr-body"><div class="sr-title">مستوى صوت التنبيهات</div><div class="sr-sub">الصوت داخل التطبيق أثناء فتحه</div><input class="slider mt-2" type="range" min="15" max="100" value="${Math.round((NotificationAudioV12.volume||.85)*100)}" oninput="NotificationAudioV12.setVolume(this.value/100)"></div>`;c.appendChild(d)}return r};
}catch(_){}

const css=document.createElement('style');css.id='v15-boredom-styles';css.textContent=`
.boredom-shell{direction:rtl}.boredom-head{display:flex;gap:13px;align-items:center;padding:16px;border-radius:20px;background:linear-gradient(135deg,#101827,#172554);color:#fff;margin-bottom:12px}.boredom-head h2{font-size:22px}.boredom-head p{font-size:13px;opacity:.85}.boredom-emoji{font-size:48px}.boredom-stats{display:flex;justify-content:space-around;gap:6px;background:#111827;color:#a7f3d0;padding:9px;border-radius:14px;margin-bottom:12px;font-size:12px;font-weight:700}.boredom-main,.boredom-card{padding:16px;border-radius:20px;background:linear-gradient(145deg,#111827,#1e293b);color:#fff;margin-bottom:12px}.boredom-surprise{margin-top:14px;background:linear-gradient(135deg,#7c3aed,#db2777)!important}.boredom-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}.boredom-grid button{background:#111827;color:#fff;border:1px solid #334155;border-radius:14px;padding:13px 8px;font-weight:700}.boredom-grid button span{display:block;font-size:25px;margin-bottom:4px}.boredom-result{text-align:center}.boredom-big{font-size:56px}.boredom-text{font-size:20px;line-height:1.9;font-weight:700;margin:12px 0}.boredom-answer{margin-top:12px;padding:12px;border-radius:12px;background:#064e3b;color:#fff;font-weight:800}.boredom-timer{font-size:64px;font-weight:900;color:#fbbf24;margin:12px}.boredom-home{display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,var(--purple-soft),var(--surface));border:2px solid var(--purple)}.adhkar-hub-v15{border:2px solid var(--gold);background:linear-gradient(135deg,var(--gold-soft),var(--surface))}@media(max-width:380px){.boredom-home{align-items:stretch;flex-direction:column}.boredom-grid{grid-template-columns:1fr 1fr}}`;
document.head.appendChild(css);

try{CONFIG.version='1.5.0-web'}catch(_){}
})();
