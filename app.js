/* TNPSC Group 4 Daily Mock Test engine. Question data and TEST_NO come from data/dayN.js */
/* ---------- Setup ---------- */
const DURATION = 180 * 60, MARK = 1.5;
const KEY = 'tnpsc4_test_' + TEST_NO, HKEY = 'tnpsc4_history';
const SECS = {
  T:{en:'General Tamil', ta:'பொதுத் தமிழ்', n:100, max:150},
  G:{en:'General Studies', ta:'பொது அறிவு', n:75, max:112.5},
  A:{en:'Aptitude & Mental Ability', ta:'திறனறிவு', n:25, max:37.5}
};
const DNAME = {e:'Easy', m:'Moderate', h:'Difficult'};
const NUMRE = /^₹?\d+(\.\d+)?\s*(%|°|கி\.மீ|வினாடி)?$/;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const Q = ALL.map((r,i)=>{
  let opts = r.slice(4,8).map((t,j)=>({t, c:j===0}));
  if (opts.every(o=>NUMRE.test(o.t))) opts.sort((a,b)=>parseFloat(a.t.replace('₹',''))-parseFloat(b.t.replace('₹','')));
  else { const R = rng(i*9301+49297); for(let k=3;k>0;k--){const j=Math.floor(R()*(k+1)); [opts[k],opts[j]]=[opts[j],opts[k]];} }
  return {i, sec:r[0], topic:r[1], d:r[2], q:r[3], opts, ans:opts.findIndex(o=>o.c), exp:r[8]};
});
const LET = ['A','B','C','D'];
const $ = s => document.querySelector(s);
function h(tag, attrs, ...kids){
  const e = document.createElement(tag);
  for (const k in (attrs||{})){
    if (k==='class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k]===true) e.setAttribute(k,'');
    else if (attrs[k]!==false && attrs[k]!=null) e.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach(c => { if (c!=null && c!==false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
const fmt = n => (Math.round(n*100)/100).toString();
const two = n => String(n).padStart(2,'0');
const hms = s => { s=Math.max(0,Math.floor(s)); return two(Math.floor(s/3600))+':'+two(Math.floor(s%3600/60))+':'+two(s%60); };

let S = { started:null, ended:null, answers:{}, cur:0, view:'start' };
function save(){ try{ localStorage.setItem(KEY, JSON.stringify({started:S.started, ended:S.ended, answers:S.answers, cur:S.cur})); }catch(e){} }
function load(){ try{ const j = JSON.parse(localStorage.getItem(KEY)||'null'); if(j && j.started){ S.started=j.started; S.ended=j.ended; S.answers=j.answers||{}; S.cur=j.cur||0; S.view = j.ended ? 'result' : 'exam'; } }catch(e){} }
function clearSave(){ try{ localStorage.removeItem(KEY); }catch(e){} }

const remaining = () => DURATION - ((S.ended||Date.now()) - S.started)/1000;
function stats(){
  const st = {ans:0, ok:0, no:0, sec:{T:0,G:0,A:0}, secAns:{T:0,G:0,A:0}};
  Q.forEach(q=>{ const a=S.answers[q.i]; if(a==null) return; st.ans++; if(a===q.ans){st.ok++; st.sec[q.sec]++;} else st.no++; st.secAns[q.sec]++; });
  return st;
}

/* ---------- Views ---------- */
function renderStart(){
  const resume = S.started && !S.ended;
  const rows = Object.entries(SECS).map(([k,s])=>h('tr',{},h('td',{},s.en+' ('+s.ta+')'),h('td',{class:'n'},s.n),h('td',{class:'n'},'1.5'),h('td',{class:'n'},fmt(s.max))));
  rows.push(h('tr',{},h('td',{},h('b',{},'Total')),h('td',{class:'n'},h('b',{},'200')),h('td',{class:'n'},''),h('td',{class:'n'},h('b',{},'300'))));
  return h('section',{class:'start'},
    h('div',{class:'card'},
      h('h2',{},'Day '+TEST_NO+' · Full-Length Mock Test'),
      h('p',{class:'hint'},'Target: 250+ out of 300 · Exam date: 10 January 2027'),
      h('div',{class:'tw'},h('table',{},h('thead',{},h('tr',{},h('th',{},'Section'),h('th',{class:'n'},'Questions'),h('th',{class:'n'},'Marks each'),h('th',{class:'n'},'Total'))),h('tbody',{},rows))),
      h('ul',{class:'plain'},
        h('li',{},'Duration: 180 minutes. The countdown starts when you press Start and continues even if you close this page. The exam submits itself at 00:00:00.'),
        h('li',{},'Every question has four options (A–D). Tap one to answer. You see right or wrong at once, with an explanation.'),
        h('li',{},'Once answered, a question is locked. You cannot change it.'),
        h('li',{},'No negative marking. Unanswered questions score zero.'),
        h('li',{},'Questions 1–100 General Tamil · 101–175 General Studies · 176–200 Aptitude. The set markers on the palette (Sets 1–4) split the paper into 50-question blocks, but it is one exam with one timer and one score.'),
        h('li',{},'All 200 questions are newly written practice questions. None is a previous-year question.'),
        h('li',{},'Your progress is saved in this browser only.')
      ),
      h('div',{class:'nav'},
        h('button',{class:'btn',id:'startBtn',onclick:()=>{ if(!S.started){ S.started=Date.now(); S.ended=null; S.answers={}; S.cur=0; save(); } S.view='exam'; render(); }}, resume ? 'Resume Examination' : 'Start Examination')
      )
    )
  );
}

function renderExam(){
  const q = Q[S.cur], a = S.answers[q.i], answered = a != null;
  const sec = SECS[q.sec];
  const setNo = Math.floor(q.i/50)+1;
  const opts = q.opts.map((o,k)=>{
    let cls='opt', mk='';
    if (answered){
      if (k===q.ans){cls+=' correct'; mk='✓';}
      else if (k===a){cls+=' wrong'; mk='✗';}
      else cls+=' dim';
    }
    return h('button',{class:cls,'aria-disabled':answered?'true':'false',onclick:()=>choose(k)},
      h('span',{class:'l'},LET[k]), h('span',{class:'t'},o.t), h('span',{class:'mk','aria-hidden':'true'},mk));
  });
  let fb = null;
  if (answered){
    const ok = a===q.ans;
    fb = h('div',{class:'fb '+(ok?'ok':'no'),role:'status'},
      h('h3',{},ok ? '✓ Correct Answer!' : '✗ Incorrect Answer!'),
      !ok && h('div',{},'சரியான விடை / Correct answer: ',h('b',{},LET[q.ans]+'. '+q.opts[q.ans].t)),
      h('div',{class:'ex'},q.exp)
    );
  }
  const left = remaining();
  const card = h('div',{class:'card'},
    h('div',{class:'qhead'},
      h('span',{class:'qnum'},'Q'+(q.i+1)+' / 200'),
      h('span',{class:'chip'},sec.en),
      h('span',{class:'chip'},q.topic),
      h('span',{class:'chip d-'+q.d},DNAME[q.d]),
      h('span',{class:'chip'},'Set '+setNo+' of 4')
    ),
    h('div',{class:'qtext'},q.q),
    h('div',{class:'opts',role:'group','aria-label':'Options'},opts),
    fb,
    h('div',{class:'nav'},
      h('button',{class:'btn ghost',disabled:S.cur===0,onclick:()=>go(S.cur-1)},'← Previous'),
      h('button',{class:'btn ghost',disabled:S.cur===199,onclick:()=>go(S.cur+1)},'Next →'),
      h('span',{class:'sp'}),
      h('button',{class:'btn danger',onclick:()=>{S.confirm=true;render();}},'Submit Examination')
    ),
    S.confirm && h('div',{class:'confirm',role:'alert'},
      h('div',{},'Submit now? You have answered '+stats().ans+' of 200 questions ('+(200-stats().ans)+' unanswered). Time left: '+hms(left)+'. You cannot return after submitting.'),
      h('div',{},h('button',{class:'btn danger',onclick:submit},'Yes, submit'),h('button',{class:'btn ghost',onclick:()=>{S.confirm=false;render();}},'Continue exam'))
    )
  );
  return h('div',{class:'desk'}, h('div',{}, card, h('button',{class:'btn ghost palbtn',onclick:()=>{$('#pal').classList.toggle('open');}},'Show / hide question palette')), renderPalette());
}

function renderPalette(){
  const aside = h('aside',{class:'pal card',id:'pal'});
  const groups = [['T','Section A · General Tamil (1–100)',0,100],['G','Section B · General Studies (101–175)',100,175],['A','Section C · Aptitude (176–200)',175,200]];
  groups.forEach(([k,title,s,e])=>{
    aside.append(h('h4',{},title));
    const g = h('div',{class:'grid'});
    for(let i=s;i<e;i++){
      const a=S.answers[i]; let c='pb';
      if(a!=null) c += a===Q[i].ans ? ' ok' : ' no';
      if(i===S.cur) c+=' cur';
      if(i%50===0) c+=' setstart';
      g.append(h('button',{class:c,'aria-label':'Question '+(i+1),onclick:()=>go(i)},String(i+1)));
    }
    aside.append(g);
  });
  aside.append(h('div',{class:'legend'},
    h('span',{},h('i',{}),'Unanswered'),h('span',{},h('i',{style:'background:var(--ok-bg);border-color:var(--ok)'}),'Correct'),
    h('span',{},h('i',{style:'background:var(--bad-bg);border-color:var(--bad)'}),'Wrong'),
    h('span',{},h('i',{style:'border-left:3px solid var(--accent)'}),'Start of a 50-question set')));
  return aside;
}

function choose(k){
  const q=Q[S.cur]; if(S.answers[q.i]!=null) return;
  S.answers[q.i]=k; save(); render(true);
}
function go(i){ S.cur=Math.max(0,Math.min(199,i)); S.confirm=false; save(); render(); window.scrollTo({top:0}); }
function submit(){ S.ended=Date.now(); S.confirm=false; S.view='result'; save(); pushHistory(); render(); window.scrollTo({top:0}); }

/* ---------- Results ---------- */
function analysis(){
  const st = stats();
  const marks = st.ok*MARK;
  const topics = {};
  Q.forEach(q=>{
    const t = topics[q.topic] || (topics[q.topic] = {topic:q.topic, sec:q.sec, n:0, ok:0, no:0, un:0});
    t.n++; const a=S.answers[q.i]; if(a==null) t.un++; else if(a===q.ans) t.ok++; else t.no++;
  });
  const tl = Object.values(topics);
  tl.forEach(t=>t.pct = t.ok/t.n*100);
  const secRows = Object.entries(SECS).map(([k,s])=>({k, ...s, ok:st.sec[k], marks:st.sec[k]*MARK, pct:st.sec[k]*MARK/s.max*100, att:st.secAns[k]}));
  const strongest = [...secRows].sort((a,b)=>b.pct-a.pct)[0];
  const weakest = [...secRows].sort((a,b)=>a.pct-b.pct)[0];
  const mistakes = tl.filter(t=>t.no>0).sort((a,b)=>b.no-a.no);
  const revise = tl.filter(t=>t.pct<60).sort((a,b)=>a.pct-b.pct);
  const tomorrow = (revise.length?revise:mistakes).slice(0,6);
  const secs = Math.min(DURATION, Math.round(((S.ended||Date.now())-S.started)/1000));
  return {st, marks, secRows, strongest, weakest, mistakes, revise, tomorrow, secs, topics:tl};
}
function pushHistory(){
  try{
    const A = analysis(), arr = JSON.parse(localStorage.getItem(HKEY)||'[]').filter(x=>x.test!==TEST_NO);
    arr.push({test:TEST_NO, marks:A.marks, tamil:A.secRows[0].marks, gs:A.secRows[1].marks, apt:A.secRows[2].marks, weak:A.revise.map(t=>t.topic)});
    localStorage.setItem(HKEY, JSON.stringify(arr));
  }catch(e){}
}
function reportText(A){
  const L = [];
  L.push('TNPSC Group 4 – Day '+TEST_NO+' performance report');
  L.push('Total: '+fmt(A.marks)+' / 300 ('+fmt(A.marks/3)+'%) · Correct '+A.st.ok+' · Wrong '+A.st.no+' · Unanswered '+(200-A.st.ans)+' · Time '+hms(A.secs));
  A.secRows.forEach(s=>L.push(s.en+': '+fmt(s.marks)+' / '+fmt(s.max)));
  L.push('Tamil qualifying (60/150): '+(A.secRows[0].marks>=60?'Passed':'Not passed'));
  L.push('Topics needing revision: '+(A.revise.map(t=>t.topic+' ('+t.ok+'/'+t.n+')').join('; ')||'none'));
  L.push('Topics with mistakes: '+(A.mistakes.map(t=>t.topic+' ('+t.no+' wrong)').join('; ')||'none'));
  return L.join('\n');
}

function renderResult(){
  const A = analysis(), st = A.st;
  const tamilOk = A.secRows[0].marks >= 60;
  const acc = st.ans ? st.ok/st.ans*100 : 0;
  const stat = (lab, val, sub) => h('div',{class:'card'},h('div',{class:'lab'},lab),h('div',{class:'big'},val),sub&&h('div',{class:'hint'},sub));
  const secTable = h('div',{class:'tw'},h('table',{},
    h('thead',{},h('tr',{},h('th',{},'Section'),h('th',{class:'n'},'Correct'),h('th',{class:'n'},'Score'),h('th',{},'Percent'))),
    h('tbody',{},A.secRows.map(s=>h('tr',{},h('td',{},s.en),h('td',{class:'n'},s.ok+' / '+s.n),h('td',{class:'n'},fmt(s.marks)+' / '+fmt(s.max)),
      h('td',{},h('div',{class:'meter'+(s.pct<40?' lowm':'')},h('i',{style:'width:'+Math.min(100,s.pct)+'%'})),h('span',{class:'hint'},fmt(Math.round(s.pct*10)/10)+'%')))))));
  const topicTable = h('div',{class:'tw'},h('table',{},
    h('thead',{},h('tr',{},h('th',{},'Topic'),h('th',{class:'n'},'Right'),h('th',{class:'n'},'Wrong'),h('th',{class:'n'},'Skipped'))),
    h('tbody',{},[...A.topics].sort((a,b)=>a.pct-b.pct).map(t=>h('tr',{},h('td',{},t.topic),h('td',{class:'n'},t.ok+'/'+t.n),h('td',{class:'n'},t.no),h('td',{class:'n'},t.un))))));
  const list = a => a.length ? h('ul',{class:'plain'},a.map(t=>h('li',{},t))) : h('p',{class:'hint'},'None. Good work.');

  const rvWrap = h('div',{});
  const flt = {v:'all'};
  const drawReview = () => {
    rvWrap.replaceChildren();
    Q.forEach(q=>{
      const a=S.answers[q.i], un=a==null, ok=a===q.ans;
      const kind = un?'un':ok?'ok':'no';
      if(flt.v!=='all' && flt.v!==kind) return;
      rvWrap.append(h('details',{class:'rv '+kind},
        h('summary',{},h('span',{class:'st'},un?'–':ok?'✓':'✗'),h('span',{class:'q'},h('b',{},(q.i+1)+'. '),q.q)),
        h('div',{class:'body'},
          'Your answer: '+(un?'Not answered':LET[a]+'. '+q.opts[a].t)+'\nCorrect answer: '+LET[q.ans]+'. '+q.opts[q.ans].t+'\n['+q.topic+' · '+DNAME[q.d]+']\n\n'+q.exp)));
    });
  };
  const fbtns = [['all','All 200'],['no','Wrong'],['un','Unanswered'],['ok','Correct']].map(([v,l])=>{
    const b = h('button',{'aria-pressed':v==='all'?'true':'false',onclick:()=>{flt.v=v;fbtns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));drawReview();}},l); return b;});
  drawReview();

  const ta = h('textarea',{readonly:true,'aria-label':'Performance report'}); ta.value = reportText(A);
  const copyMsg = h('span',{class:'hint'},'');
  const copyBtn = h('button',{class:'btn',onclick:()=>{
    const done=()=>{copyMsg.textContent=' Copied.';};
    try{ navigator.clipboard.writeText(ta.value).then(done,()=>{ta.select();copyMsg.textContent=' Select and copy the text.';}); }catch(e){ ta.select(); copyMsg.textContent=' Select and copy the text.'; }
  }},'Copy report');
  let armed=false;
  const resetBtn = h('button',{class:'btn ghost',onclick:()=>{ if(!armed){armed=true;resetBtn.textContent='Click again to erase this attempt';return;} clearSave(); S={started:null,ended:null,answers:{},cur:0,view:'start'}; render(); }},'Reset Day '+TEST_NO+' attempt');

  return h('section',{class:'res'},
    h('div',{class:'card'},h('h2',{},'Day '+TEST_NO+' · Examination Result'),
      h('p',{},'General Tamil qualifying mark (60 / 150): ',h('span',{class:'tag '+(tamilOk?'ok':'no')},tamilOk?'Achieved ✓':'Not achieved ✗'),' ',h('span',{class:'hint'},'You scored '+fmt(A.secRows[0].marks)+' / 150.'))),
    h('div',{class:'hero'},
      stat('Total marks', fmt(A.marks)+' / 300', 'Target: 250+'),
      stat('Overall percentage', fmt(Math.round(A.marks/3*100)/100)+'%'),
      stat('Accuracy', fmt(Math.round(acc*10)/10)+'%', 'Correct ÷ attempted'),
      stat('Time taken', hms(A.secs), 'of 03:00:00')),
    h('div',{class:'hero'},
      stat('Total questions', '200'), stat('Correct', String(st.ok)), stat('Wrong', String(st.no)), stat('Unanswered', String(200-st.ans))),
    h('div',{class:'card'},h('h2',{},'Section scores'),secTable),
    h('div',{class:'two'},
      h('div',{class:'card'},h('h2',{},'Performance analysis'),
        h('p',{},h('b',{},'Strongest subject: '),A.strongest.en+' ('+fmt(Math.round(A.strongest.pct))+'%)'),
        h('p',{},h('b',{},'Weakest subject: '),A.weakest.en+' ('+fmt(Math.round(A.weakest.pct))+'%)'),
        h('h4',{class:'lab'},'Topics where you made mistakes'), list(A.mistakes.map(t=>t.topic+' – '+t.no+' wrong'+(t.un?', '+t.un+' skipped':'')))),
      h('div',{class:'card'},h('h2',{},'Revision and tomorrow'),
        h('h4',{class:'lab'},'Topics that need revision (under 60%)'), list(A.revise.map(t=>t.topic+' – '+t.ok+' of '+t.n+' right')),
        h('h4',{class:'lab'},'Recommended practice for tomorrow'), list(A.tomorrow.map(t=>t.topic)))),
    h('div',{class:'card'},h('h2',{},'Topic-wise breakdown'),topicTable),
    h('div',{class:'card'},h('h2',{},'Detailed answer review'),h('div',{class:'filters'},fbtns),rvWrap),
    h('div',{class:'card'},h('h2',{},'Report for tomorrow’s test'),
      h('p',{class:'hint'},'Paste this into the chat when you ask for Day '+(TEST_NO+1)+'. I do not keep your scores between days, so this report lets me focus the next test on your weak areas.'),
      ta, h('div',{class:'nav'},copyBtn,copyMsg,h('span',{class:'sp'}),resetBtn))
  );
}

/* ---------- Render loop ---------- */
function render(keepScroll){
  const y = window.scrollY;
  const main = $('#main'); main.replaceChildren();
  const inExam = S.view==='exam';
  $('#counters').hidden = !(inExam||S.view==='result'); $('#barWrap').hidden = $('#counters').hidden;
  if (S.view==='start') main.append(renderStart());
  else if (S.view==='exam') main.append(renderExam());
  else main.append(renderResult());
  const st = stats();
  $('#cAns').textContent = st.ans; $('#cUn').textContent = 200-st.ans; $('#cOk').textContent = st.ok; $('#cNo').textContent = st.no;
  $('#cPct').textContent = Math.round(st.ans/2)+'%'; $('#bar').style.width = (st.ans/2)+'%';
  tick();
  if (keepScroll) window.scrollTo({top:y});
}
function tick(){
  const t = $('#timer');
  if (!S.started){ t.textContent = hms(DURATION); t.classList.remove('low'); return; }
  const left = remaining();
  t.textContent = hms(left); t.classList.toggle('low', left<600 && !S.ended);
  if (!S.ended && left<=0){ submit(); }
}
setInterval(tick, 1000);
document.addEventListener('keydown', e=>{
  if (S.view!=='exam' || e.target.tagName==='TEXTAREA') return;
  if (e.key==='ArrowRight') go(S.cur+1); else if (e.key==='ArrowLeft') go(S.cur-1);
});
load();
if (S.view==='exam' && remaining()<=0){ S.ended=S.started+DURATION*1000; S.view='result'; save(); pushHistory(); }
render();
