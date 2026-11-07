/* Life page: the coffee ceremony. Scrolling through the section pours the three rounds. */
(function(){
if(!document.getElementById('cfA'))return;
/* ======================= coffee scene ======================= */
const NS='http://www.w3.org/2000/svg';
const ROUNDS=[
  {name:'Abol',tag:'First round',text:'Born in Ethiopia, where coffee is a ceremony, never a quick cup.'},
  {name:'Tona',tag:'Second round',text:'Lived in Rwanda and Maryland. New places, same pot on the stove.'},
  {name:'Baraka',tag:'The blessing',text:'Now in California. Married, outdoors and still pouring for friends.'}
];
const CUPS=[300,420,540], RIM=352, BASE=392, CUPH=BASE-RIM;
const PIV={x:0,y:-58}, TIP={x:98,y:-150}, POUR=58;

function cupPath(x){return `M${x-27} ${RIM} L${x-19} ${BASE} Q${x} ${BASE+8} ${x+19} ${BASE} L${x+27} ${RIM} Z`}
function buildScene(host,id){
  host.insertAdjacentHTML('beforeend',`
  <svg class="cf-svg" viewBox="0 0 840 470" role="img" aria-label="A clay jebena pouring coffee into three small cups on a wooden tray">
    <defs>
      <radialGradient id="${id}clay" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#5A3A2A"/><stop offset=".55" stop-color="#2A1A13"/><stop offset="1" stop-color="#140C08"/></radialGradient>
      <linearGradient id="${id}wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A06B42"/><stop offset="1" stop-color="#6B4227"/></linearGradient>
      <linearGradient id="${id}cup" x1="0" x2="1"><stop offset="0" stop-color="#E9E4DA"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D6CFC3"/></linearGradient>
      ${CUPS.map((x,i)=>`<clipPath id="${id}c${i}"><path d="${cupPath(x)}"/></clipPath>`).join('')}
    </defs>
    <!-- grass and flowers, the floor of a ceremony -->
    <g opacity=".9">${Array.from({length:46},(_,i)=>{const x=110+i*14+(i*37%9),y=430+(i*53%22),r=(i*29%40)-20;return `<path d="M${x} ${y} q2 -10 ${r/6} -16" stroke="${i%3?'#7FA35B':'#5E8A45'}" stroke-width="2" fill="none" stroke-linecap="round"/>`}).join('')}
      ${[[150,440,'#F2C14E'],[690,446,'#F2C14E'],[230,452,'#E9874B'],[620,432,'#F2C14E'],[760,440,'#E9874B']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.6" fill="#7A3A17"/>`).join('')}</g>
    <!-- tray (rekebot) in 3D: top, front lip and legs -->
    <ellipse cx="420" cy="430" rx="250" ry="22" fill="rgba(60,30,10,.18)"/>
    <path d="M190 400 L196 424 Q420 452 644 424 L650 400 Z" fill="url(#${id}wood)"/>
    <ellipse cx="420" cy="400" rx="230" ry="34" fill="#B37A4C"/>
    <ellipse cx="420" cy="398" rx="214" ry="28" fill="#C48A5A"/>
    <path d="M230 398 Q420 380 610 398" stroke="#A8744A" stroke-width="1.2" fill="none" opacity=".6"/>
    <path d="M250 404 Q420 390 590 404" stroke="#A8744A" stroke-width="1" fill="none" opacity=".5"/>
    <!-- incense burner -->
    <g transform="translate(108 404)"><path d="M-22 0 Q0 18 22 0 Z" fill="#7A4A2E"/><rect x="-6" y="0" width="12" height="18" fill="#5E3A24"/><ellipse cx="0" cy="18" rx="16" ry="4" fill="#5E3A24"/><circle cx="0" cy="-2" r="3" fill="#E9874B"/></g>
    <g class="cf-smoke"><path d="M108 398 C 96 370, 124 350, 108 322 S 96 270, 116 240"/><path d="M110 398 C 124 372, 96 348, 114 318 S 126 274, 104 250"/></g>
    <!-- cups -->
    ${CUPS.map((x,i)=>`<g class="cup-hit" data-i="${i}" tabindex="${id==='B'?0:-1}" role="${id==='B'?'button':'presentation'}" aria-label="Pour ${ROUNDS[i].name}">
      <ellipse cx="${x}" cy="${BASE+6}" rx="24" ry="5" fill="rgba(60,30,10,.25)"/>
      <path d="${cupPath(x)}" fill="url(#${id}cup)"/>
      <g clip-path="url(#${id}c${i})"><rect class="fill" x="${x-30}" y="${BASE+10}" width="60" height="60" fill="#4A2618"/><ellipse class="surf" cx="${x}" cy="${BASE+10}" rx="26" ry="4.5" fill="#7A4628"/></g>
      <path d="M${x-18} ${RIM+12} q2 10 4 22" stroke="#fff" stroke-width="3" opacity=".7" fill="none" stroke-linecap="round"/>
      <ellipse class="cup-ring" cx="${x}" cy="${RIM}" rx="27" ry="5.5" fill="none" stroke="#CFC7BA" stroke-width="1.4"/>
      <path d="M${x-22} ${RIM+18} h44" stroke="#2F6F8F" stroke-width="2" opacity=".55"/>
      <g class="cf-steam"><path d="M${x-8} ${RIM-8} c-6 -14 8 -20 0 -36"/><path d="M${x+8} ${RIM-6} c6 -14 -8 -22 2 -38"/></g>
    </g>`).join('')}
    <!-- stream -->
    <path class="stream" d="" stroke="#4A2618" stroke-width="5" stroke-linecap="round" fill="none"/>
    <!-- the jebena -->
    <g class="jebena">
      <path d="M48 -86 C 70 -100, 82 -126, 98 -150" stroke="url(#${id}clay)" stroke-width="13" fill="none" stroke-linecap="round"/>
      <path d="M48 -86 C 70 -100, 82 -126, 98 -150" stroke="#6B4A38" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-2 -3)"/>
      <path d="M-14 -150 C -62 -150, -72 -96, -44 -80" stroke="#1E120C" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="-58" r="58" fill="url(#${id}clay)"/>
      <path d="M-16 -104 C -16 -130, -12 -150, -10 -178 L 10 -178 C 12 -150, 16 -130, 16 -104 Z" fill="url(#${id}clay)"/>
      <ellipse cx="0" cy="-180" rx="15" ry="5" fill="#3A2419" stroke="#140C08" stroke-width="2"/>
      <path d="M-50 -60 Q0 -40 50 -60" stroke="#C9A27A" stroke-width="2" fill="none" opacity=".55"/>
      <path d="M-46 -48 Q0 -28 46 -48" stroke="#C9A27A" stroke-width="1.2" fill="none" opacity=".4" stroke-dasharray="3 5"/>
      <ellipse cx="-22" cy="-82" rx="14" ry="22" fill="#fff" opacity=".12" transform="rotate(-25 -22 -82)"/>
      <!-- woven grass stopper -->
      <path d="M-9 -182 l-4 -18 M0 -183 l0 -20 M9 -182 l4 -18" stroke="#C8A05A" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>
  <div class="cf-labels">${ROUNDS.map(r=>`<div class="cf-l"><b>${r.name}</b><small>${r.tag}</small><p>${r.text}</p></div>`).join('')}</div>`);
  const svg=host.querySelector('svg');
  return {svg,jeb:svg.querySelector('.jebena'),stream:svg.querySelector('.stream'),
    fills:[...svg.querySelectorAll('.fill')],surfs:[...svg.querySelectorAll('.surf')],steam:[...svg.querySelectorAll('.cf-steam')],labels:[...host.querySelectorAll('.cf-l')]};
}
const rot=(p,a)=>{const r=a*Math.PI/180,dx=p.x-PIV.x,dy=p.y-PIV.y;return{x:PIV.x+dx*Math.cos(r)-dy*Math.sin(r),y:PIV.y+dx*Math.sin(r)+dy*Math.cos(r)}};
const tipFull=rot(TIP,POUR);
const spot=i=>i<0?{x:150,y:330}:{x:CUPS[i]+4-tipFull.x,y:262-tipFull.y};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2, lerp=(a,b,t)=>a+(b-a)*t;
/* p in [0,3]: whole rounds poured */
function render(S,p){
  const i=Math.min(2,Math.floor(p)), t=p>=3?1:p-i;
  const from=spot(i-1), to=spot(i), m=ease(clamp(t/.18));
  const g={x:lerp(from.x,to.x,m),y:lerp(from.y,to.y,m)-Math.sin(m*Math.PI)*24};
  let a=0; if(t>.18&&t<.32)a=POUR*ease((t-.18)/.14); else if(t>=.32&&t<.8)a=POUR; else if(t>=.8&&t<.94)a=POUR*(1-ease((t-.8)/.14));
  if(p>=3)a=0;
  S.jeb.setAttribute('transform',`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${a.toFixed(1)} ${PIV.x} ${PIV.y})`);
  S.fills.forEach((f,k)=>{
    const lv=k<i?1:k>i?0:clamp((t-.3)/.5); const full=p>=3?1:lv;
    const y=BASE+8-full*(CUPH+2);
    f.setAttribute('y',y); S.surfs[k].setAttribute('cy',y); S.surfs[k].style.opacity=full>0?1:0;
    S.steam[k].classList.toggle('on',full>.95);
    S.labels[k].classList.toggle('on',full>.6);
  });
  const cur=Math.max(0,S.labels.map(l=>l.classList.contains('on')).lastIndexOf(true));
  S.labels.forEach((l,k)=>l.classList.toggle('cur',k===cur));
  if(a>POUR*.8&&p<3){const tip=rot(TIP,a),tx=g.x+tip.x,ty=g.y+tip.y,lv=clamp((t-.3)/.5),sy=BASE+8-lv*(CUPH+2);
    S.stream.setAttribute('d',`M${tx.toFixed(1)} ${ty.toFixed(1)} Q${(tx+5).toFixed(1)} ${((ty+sy)/2).toFixed(1)} ${(CUPS[i]+2)} ${sy.toFixed(1)}`);S.stream.style.opacity=1}
  else S.stream.style.opacity=0;
}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1A: scroll drives the pour */
const A=buildScene(document.getElementById('cfA'),'A'), wrap=document.getElementById('cfScroll'), bar=document.querySelector('.cf-progress i'), hint=document.querySelector('.cf-hint');
/* progress runs only while the frame is pinned: from the track reaching the nav to the frame letting go,
   with a short hold at the end so the full table is seen before it scrolls away */
const pin=wrap.querySelector('.cf-sticky');
function onScroll(){const r=wrap.getBoundingClientRect(),top=parseFloat(getComputedStyle(pin).top)||0,tot=Math.max(1,r.height-pin.offsetHeight),pr=clamp((top-r.top)/(tot*.9));render(A,pr*3);bar.style.width=(pr*100)+'%';hint.style.opacity=pr>.98?0:1}
/* narrow screens crop the scene to the table so the cups stay readable */
const narrow=matchMedia('(max-width: 760px)'), short=matchMedia('(max-height: 560px)');
function frame(){A.svg.setAttribute('viewBox',narrow.matches?'78 96 684 370':'0 0 840 470')}
function mode(){frame();if(reduce||short.matches){removeEventListener('scroll',onScroll);render(A,3);A.labels.forEach(l=>l.classList.add('on'))}else{addEventListener('scroll',onScroll,{passive:true});onScroll()}}
narrow.addEventListener('change',mode);short.addEventListener('change',mode);mode();

})();
