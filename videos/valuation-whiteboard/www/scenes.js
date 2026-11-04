// Scene content for the five whiteboard lessons. build(videoId, tl) -> {items, meta, duration}
(function(){
const COL={ink:"#1f2a44",blue:"#2f6fe4",teal:"#2a9d8f",red:"#d64545",gold:"#e8b826",hl:"#fff07a",grey:"#8a93a3",green:"#3a9a5b",pink:"#ffd6d6",mint:"#d6f3ea"};
const LEAD=0.5, GAP=0.55, TAIL=1.6;

function makeCtx(vt){
  const starts=[];let acc=LEAD;
  vt.scenes.forEach((s,i)=>{starts[i]=acc;acc+=s.duration+GAP;});
  const duration=acc-GAP+TAIL;
  const S=i=>starts[i];
  const C=(i,j,f)=>{const cues=vt.scenes[i].cues;const c=cues[Math.min(j,cues.length-1)];return starts[i]+c.start+(f||0)*(c.end-c.start);};
  const E=(i,j)=>{const cues=vt.scenes[i].cues;const c=cues[Math.min(j,cues.length-1)];return starts[i]+c.end;};
  // captions: split long sentences into two chunks proportionally
  const caps=[];
  vt.scenes.forEach((s,i)=>s.cues.forEach(c=>{
    const st=starts[i]+c.start,en=starts[i]+c.end;
    if(c.text.length<=62){caps.push({start:st,end:en+0.15,text:c.text});return;}
    const mid=Math.floor(c.text.length/2);let cut=-1;
    for(const sep of [", ",": ",". "," "]){const a=c.text.lastIndexOf(sep,mid+12);if(a>mid-26){cut=a+sep.length-1;break;}}
    if(cut<0)cut=c.text.indexOf(" ",mid);
    const t1=c.text.slice(0,cut).trim(),t2=c.text.slice(cut).trim();const f=t1.length/c.text.length;
    const tm=st+(en-st)*f;caps.push({start:st,end:tm,text:t1});caps.push({start:tm,end:en+0.15,text:t2});
  }));
  return {S,C,E,caps,duration,starts};
}
// ---- primitives
const T=(t,x,y,text,o)=>Object.assign({kind:"text",t,x,y,text,size:44,dur:Math.max(0.5,Math.min(1.8,(text||"").length/16))},o||{});
const P=(t,d,o)=>Object.assign({kind:"path",t,d,dur:0.7},o||{});
const HL=(t,x,y,w,h,o)=>Object.assign({kind:"hl",t,x,y,w,h,dur:0.5},o||{});
const CLR=t=>({kind:"clear",t:t-0.5}); // clear during the inter-scene gap so the fade (0.45 s) ends before new ink
const FOCUS=(t,x,y)=>({kind:"focus",t,x,y});
const ring=(t,cx,cy,rx,ry,o)=>P(t,H.ellipse(cx,cy,rx,ry,(cx*7+cy)|0),Object.assign({color:COL.teal,sw:5,dur:0.8},o||{}));
const arrow=(t,x1,y1,x2,y2,curve,o)=>P(t,H.arrow(x1,y1,x2,y2,curve||0,(x1+y2)|0),Object.assign({color:COL.blue,sw:5,dur:0.6},o||{}));
// ---- icons (return arrays)
function shop(t,x,y,w,seed){const h=w*0.62;const its=[];
  its.push(P(t,H.rect(x,y+h*0.3,w,h*0.7,seed),{dur:0.6}));
  const pts=[[x-w*0.06,y+h*0.3],[x+w*0.5,y],[x+w*1.06,y+h*0.3]];its.push(P(t+0.3,H.poly(pts,seed+1,false),{dur:0.5}));
  // awning scallops
  let d="";const n=5;for(let i=0;i<n;i++){const ax=x-w*0.06+i*(w*1.12/n);d+=`M${ax} ${y+h*0.3} q${w*1.12/n/2} ${h*0.16} ${w*1.12/n} 0 `;}its.push(P(t+0.55,d,{dur:0.5}));
  its.push(P(t+0.8,H.rect(x+w*0.38,y+h*0.55,w*0.24,h*0.45,seed+2),{dur:0.4}));
  its.push(P(t+1.0,H.rect(x+w*0.08,y+h*0.5,w*0.2,h*0.22,seed+3),{dur:0.3}));
  its.push(P(t+1.0,H.rect(x+w*0.72,y+h*0.5,w*0.2,h*0.22,seed+4),{dur:0.3}));
  return its;}
function coins(t,x,y,n,seed){const its=[];for(let i=0;i<n;i++){its.push(P(t+i*0.18,H.ellipse(x,y-i*16,46,13,seed+i),{dur:0.35,fill:"#e9ecf2",fillOp:1}));}return its;}
function house(t,x,y,w,seed){const h=w*0.75;const its=[];
  its.push(P(t,H.rect(x,y+h*0.4,w,h*0.6,seed),{dur:0.6}));
  its.push(P(t+0.3,H.poly([[x-w*0.1,y+h*0.42],[x+w*0.5,y],[x+w*1.1,y+h*0.42]],seed+1,false),{dur:0.5}));
  its.push(P(t+0.7,H.rect(x+w*0.4,y+h*0.62,w*0.2,h*0.38,seed+2),{dur:0.4}));
  its.push(P(t+0.9,H.rect(x+w*0.1,y+h*0.55,w*0.18,h*0.18,seed+3),{dur:0.3}));
  its.push(P(t+0.9,H.rect(x+w*0.72,y+h*0.55,w*0.18,h*0.18,seed+4),{dur:0.3}));
  its.push(P(t+0.5,H.rect(x+w*0.72,y+h*0.08,w*0.12,h*0.25,seed+5),{dur:0.3}));
  return its;}
function factory(t,x,y,w,seed){const h=w*0.6;const its=[];
  its.push(P(t,H.rect(x,y+h*0.45,w,h*0.55,seed),{dur:0.6}));
  const pts=[[x,y+h*0.45]];const n=3;for(let i=0;i<n;i++){const a=x+i*w/n;pts.push([a,y+h*0.1],[a+w/n,y+h*0.45]);}
  its.push(P(t+0.3,H.poly(pts,seed+1,false),{dur:0.6}));
  its.push(P(t+0.7,H.rect(x+w*0.1,y-h*0.15,w*0.1,h*0.6,seed+2),{dur:0.4}));
  its.push(P(t+0.9,H.rect(x+w*0.4,y+h*0.7,w*0.15,h*0.3,seed+3),{dur:0.3}));
  return its;}
function book(t,x,y,w,seed){const h=w*0.72;const its=[];
  its.push(P(t,H.rect(x,y,w,h,seed),{dur:0.6}));
  its.push(P(t+0.3,H.line(x+w*0.5,y,x+w*0.5,y+h,seed+1),{dur:0.4}));
  for(let i=0;i<4;i++){its.push(P(t+0.5+i*0.12,H.line(x+w*0.08,y+h*(0.22+i*0.18),x+w*0.42,y+h*(0.22+i*0.18),seed+2+i),{dur:0.3,sw:3.5,color:COL.grey}));}
  for(let i=0;i<4;i++){its.push(P(t+0.6+i*0.12,H.line(x+w*0.58,y+h*(0.22+i*0.18),x+w*0.92,y+h*(0.22+i*0.18),seed+6+i),{dur:0.3,sw:3.5,color:COL.grey}));}
  return its;}
function bank(t,x,y,w,seed){const h=w*0.7;const its=[];
  its.push(P(t,H.poly([[x,y+h*0.3],[x+w*0.5,y],[x+w,y+h*0.3]],seed,true),{dur:0.5}));
  for(let i=0;i<4;i++){const cx=x+w*0.12+i*w*0.25;its.push(P(t+0.3+i*0.1,H.rect(cx,y+h*0.38,w*0.1,h*0.45,seed+1+i),{dur:0.3}));}
  its.push(P(t+0.8,H.rect(x-w*0.03,y+h*0.86,w*1.06,h*0.14,seed+9),{dur:0.3}));
  return its;}
function laptop(t,x,y,w,seed){const h=w*0.6;const its=[];
  its.push(P(t,H.rect(x+w*0.1,y,w*0.8,h*0.6,seed),{dur:0.5}));
  its.push(P(t+0.4,H.rect(x,y+h*0.62,w,h*0.12,seed+1),{dur:0.4}));
  its.push(P(t+0.6,H.line(x+w*0.25,y+h*0.2,x+w*0.6,y+h*0.2,seed+2),{dur:0.2,sw:3.5,color:COL.grey}));
  its.push(P(t+0.7,H.line(x+w*0.25,y+h*0.35,x+w*0.7,y+h*0.35,seed+3),{dur:0.2,sw:3.5,color:COL.grey}));
  return its;}
function clock(t,x,y,r,seed){return [P(t,H.ellipse(x,y,r,r,seed),{dur:0.6}),P(t+0.5,`M${x} ${y} L${x} ${y-r*0.6} M${x} ${y} L${x+r*0.45} ${y+r*0.2}`,{dur:0.4,sw:5})];}
function warn(t,x,y,s,seed){return [P(t,H.poly([[x,y+s],[x+s/2,y],[x+s,y+s]],seed,true),{dur:0.5,color:COL.red,sw:5}),P(t+0.4,`M${x+s/2} ${y+s*0.32} L${x+s/2} ${y+s*0.66} M${x+s/2} ${y+s*0.8} L${x+s/2} ${y+s*0.86}`,{dur:0.3,color:COL.red,sw:6})];}
function lens(t,x,y,r,seed){return [P(t,H.ellipse(x,y,r,r,seed),{dur:0.7,sw:6}),P(t+0.5,H.line(x+r*0.72,y+r*0.72,x+r*1.35,y+r*1.35,seed+1),{dur:0.3,sw:9})];}
function tick(t,x,y,s){return P(t,H.tick(x,y,s),{color:COL.green,sw:7,dur:0.4});}
function cross(t,x,y,s){return P(t,H.cross(x,y,s),{color:COL.red,sw:7,dur:0.4});}
function pill(t,x,y,w,h,text,sub,seed){const its=[P(t,H.rect(x,y,w,h,seed),{dur:0.5,sw:4}),T(t+0.2,x+w/2,y+h*0.62,text,{anchor:"middle",font:"caveat",size:52,color:COL.blue})];if(sub)its.push(T(t+0.5,x+w/2,y+h+40,sub,{anchor:"middle",size:32,color:COL.grey}));return its;}

const builders={};

// ================= VIDEO 1: WHY VALUATION
builders["01-why-valuation"]=function(vt){
  const {S,C,E,caps,duration}=makeCtx(vt);const I=[];
  const sA=560,sB=1240,sy=330,sw=300;
  I.push(T(C(0,0),960,190,"Which shop is cheaper?",{anchor:"middle",font:"caveat",size:78}));
  I.push(...shop(C(0,0,0.3),sA,sy,sw,11),...shop(C(0,0,0.5),sB,sy,sw,31));
  I.push(T(C(0,0,0.8),sA+sw/2,sy+250,"Shop A",{anchor:"middle",size:40}),T(C(0,0,0.9),sB+sw/2,sy+250,"Shop B",{anchor:"middle",size:40}));
  I.push(FOCUS(C(0,1),sA+150,450),T(C(0,1,0.3),sA+sw/2,sy-38,"₹10 lakh",{anchor:"middle",font:"caveat",size:60,color:COL.blue}));
  I.push(FOCUS(C(0,2),sB+150,450),T(C(0,2,0.3),sB+sw/2,sy-38,"₹50 lakh",{anchor:"middle",font:"caveat",size:60,color:COL.blue}));
  I.push(FOCUS(C(0,3),960,480),T(C(0,3),960,540,"?",{anchor:"middle",font:"caveat",size:170,color:COL.red,dur:0.5,end:C(1,0)}));
  I.push(T(C(0,5),960,700,"price alone can't tell you",{anchor:"middle",size:36,color:COL.grey,end:C(1,0)}));
  // scene 2: profit
  I.push(FOCUS(C(1,1),960,720),T(C(1,1),960,700,"what you really buy = the yearly profit",{anchor:"middle",size:40,color:COL.teal}));
  I.push(FOCUS(C(1,2),sA+150,780),...coins(C(1,2),sA+70,790,1,41),T(C(1,2,0.2),sA+150,790,"earns ₹1 lakh / yr",{size:36}));
  I.push(FOCUS(C(1,3),sB+150,780),...coins(C(1,3),sB+60,790,3,51),T(C(1,3,0.2),sB+140,790,"earns ₹10 lakh / yr",{size:36}));
  // scene 3: payback
  I.push(FOCUS(C(2,0),sA+150,880),T(C(2,0),sA+150,880,"10 ÷ 1 = 10 years",{anchor:"middle",size:42}));
  I.push(FOCUS(C(2,1),sB+150,880),T(C(2,1),sB+150,880,"50 ÷ 10 = 5 years",{anchor:"middle",size:42}),ring(C(2,1,0.7),sB+150,866,200,40));
  I.push(tick(C(2,2),sB+330,sy+90,60),HL(C(2,2,0.3),sB-40,sy+205,380,56),T(C(2,2,0.35),sB+150,sy+250,"the cheaper deal",{anchor:"middle",size:40,color:COL.ink}));
  // scene 4: price vs value
  I.push(CLR(S(3)));
  I.push(T(C(3,0),960,210,"The whole game of valuation",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(3,1),960,400),T(C(3,1),960,420,"PRICE  =  what you pay",{anchor:"middle",font:"caveat",size:72,color:COL.blue}));
  I.push(FOCUS(C(3,2),960,540),T(C(3,2),960,560,"VALUE  =  what you get",{anchor:"middle",font:"caveat",size:72,color:COL.teal}));
  I.push(P(C(3,3),H.line(640,640,1280,640,77),{dur:0.5,sw:5}));
  I.push(FOCUS(C(3,3,0.4),960,760),HL(C(3,3,0.4),520,715,880,70),T(C(3,3,0.45),960,770,"Valuation ratio  =  Price ÷ Value",{anchor:"middle",font:"caveat",size:64}));
  I.push(T(C(3,3,0.8),960,860,"compare any business with any other",{anchor:"middle",size:34,color:COL.grey}));
  // scene 5: accounts -> three ratios
  I.push(CLR(S(4)));
  I.push(T(C(4,0),960,200,"A share is just a slice of a shop",{anchor:"middle",font:"caveat",size:66}));
  I.push(FOCUS(C(4,1),700,480),...book(C(4,1),520,330,360,61),T(C(4,1,0.3),700,660,"the company's accounts",{anchor:"middle",size:36}));
  I.push(T(C(4,1,0.45),560,420,"profit",{size:32,color:COL.blue}),T(C(4,1,0.6),560,500,"assets",{size:32,color:COL.teal}),T(C(4,1,0.75),560,580,"debt",{size:32,color:COL.red}));
  I.push(FOCUS(C(4,2),1350,380),arrow(C(4,2),900,460,1180,380,-40),...pill(C(4,2,0.15),1200,330,300,90,"P/E","profit",71));
  I.push(FOCUS(C(4,2,0.4),1350,540),arrow(C(4,2,0.4),900,480,1180,530,0),...pill(C(4,2,0.5),1200,490,300,90,"P/B","assets",73));
  I.push(FOCUS(C(4,2,0.7),1350,700),arrow(C(4,2,0.7),900,500,1180,690,40),...pill(C(4,2,0.8),1200,650,300,90,"EV / EBITDA","whole business",75));
  return {items:I,meta:{caps,chapterTimes:[{t:0,i:0},{t:S(2),i:1},{t:S(3),i:2}]},duration};
};

// ================= VIDEO 2: P/E
builders["02-pe-ratio"]=function(vt){
  const {S,C,E,caps,duration}=makeCtx(vt);const I=[];
  I.push(FOCUS(0,960,200),T(C(0,0),960,210,"P/E  =  Price ÷ Earnings",{anchor:"middle",font:"caveat",size:84}));
  I.push(T(C(0,2),960,300,"most used · most misused",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(0,3),960,520),...book(C(0,3),780,400,360,81),T(C(0,3,0.5),960,730,"built from the accounts, line by line",{anchor:"middle",size:36}));
  // P&L ledger
  I.push(CLR(S(1)));
  const lx=430,ly=190,lw=620;
  I.push(FOCUS(C(1,0),740,400),P(C(1,0),H.rect(lx,ly,lw,590,91),{dur:0.9,sw:4}),T(C(1,0,0.3),lx+lw/2,ly+58,"PROFIT & LOSS  (₹ crore)",{anchor:"middle",size:34,color:COL.grey}));
  const row=(t,y,label,amt,o)=>[T(t,lx+40,y,label,Object.assign({size:42},o||{})),T(t+0.25,lx+lw-40,y,amt,Object.assign({anchor:"end",size:42},o||{}))];
  I.push(...row(C(1,1),ly+140,"Revenue","1,000"));
  I.push(...row(C(1,2),ly+215,"−  Costs","820"));
  I.push(...row(C(1,3),ly+290,"−  Interest","30"));
  I.push(...row(C(1,4),ly+365,"−  Tax","50"));
  I.push(P(C(1,5),H.line(lx+40,ly+405,lx+lw-40,ly+405,92),{dur:0.4,sw:4}));
  I.push(HL(C(1,5,0.5),lx+30,ly+440,lw-60,62),...row(C(1,5,0.55),ly+485,"Net profit","100",{color:COL.blue,font:"caveat",size:56}));
  I.push(T(C(1,5,0.8),lx+lw/2,ly+550,"1,000 − 820 − 30 − 50 = 100 ✓",{anchor:"middle",size:30,color:COL.grey}));
  // EPS
  I.push(FOCUS(C(2,0),1450,420),arrow(C(2,0),lx+lw+10,ly+470,1190,440,-30));
  I.push(T(C(2,0,0.2),1450,400,"₹100 cr ÷ 10 cr shares",{anchor:"middle",size:46}));
  I.push(T(C(2,0,0.6),1450,480,"= ₹10 per share",{anchor:"middle",font:"caveat",size:60,color:COL.blue}));
  I.push(FOCUS(C(2,1),1450,560),T(C(2,1),1450,575,"EPS  →  the E",{anchor:"middle",size:44,color:COL.teal}),ring(C(2,1,0.4),1450,560,200,42));
  // price & P/E
  I.push(FOCUS(C(3,0),1450,690),T(C(3,1),1450,690,"Price today = ₹200",{anchor:"middle",size:46}));
  I.push(FOCUS(C(3,2),1450,800),T(C(3,2),1450,800,"P/E = 200 ÷ 10",{anchor:"middle",size:50}));
  I.push(T(C(3,2,0.65),1450,900,"= 20×",{anchor:"middle",font:"caveat",size:96,color:COL.blue}),ring(C(3,2,0.85),1450,870,150,62));
  // reading it
  I.push(CLR(S(4)));
  I.push(T(C(4,0),960,200,"What does a P/E of 20 mean?",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(4,1),960,340),...coins(C(4,1),520,370,2,101),T(C(4,1,0.2),600,350,"you pay ₹20 for every ₹1 of yearly profit",{size:44}));
  I.push(FOCUS(C(4,2),960,500),...clock(C(4,2),540,500,42,111),T(C(4,2,0.2),600,515,"20 years to earn it back (if profit stays flat)",{size:44}));
  I.push(FOCUS(C(4,3),960,660),HL(C(4,3,0.3),520,625,900,66),T(C(4,3),600,675,"Earnings yield = 1 ÷ 20 = 5% a year",{size:48,color:COL.ink}));
  I.push(FOCUS(C(4,4),960,820),T(C(4,4),600,830,"vs. a fixed deposit: which pays you more?",{size:40,color:COL.grey}));
  // warnings
  I.push(CLR(S(5)));
  I.push(T(C(5,0),960,200,"Three warnings",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(5,1),960,330),...warn(C(5,1),480,290,60,121),T(C(5,1,0.2),580,340,"High P/E ≠ expensive  →  market expects growth",{size:42}));
  I.push(FOCUS(C(5,2),960,480),...warn(C(5,2),480,440,60,131),T(C(5,2,0.2),580,490,"Low P/E ≠ cheap  →  profits may be about to fall",{size:42}));
  I.push(FOCUS(C(5,3),960,630),...warn(C(5,3),480,590,60,141),T(C(5,3,0.2),580,640,"No profit  →  no P/E at all",{size:42}));
  I.push(FOCUS(C(5,4),960,800),HL(C(5,4,0.2),500,760,980,70),T(C(5,4),960,815,"Compare with: same industry  +  own history",{anchor:"middle",font:"caveat",size:56}));
  return {items:I,meta:{caps,chapterTimes:[{t:0,i:0},{t:S(2),i:1},{t:S(4),i:2}]},duration};
};

// ================= VIDEO 3: P/B
builders["03-pb-ratio"]=function(vt){
  const {S,C,E,caps,duration}=makeCtx(vt);const I=[];
  I.push(FOCUS(0,960,200),T(C(0,0),960,210,"P/B  =  Price ÷ Book value",{anchor:"middle",font:"caveat",size:84}));
  I.push(T(C(0,2),960,300,"doesn't care about profit",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(0,3),960,520),...lens(C(0,3),880,500,90,151),T(C(0,3,0.4),960,720,"worth on paper  =  owns  −  owes",{anchor:"middle",font:"caveat",size:60,color:COL.teal}));
  // balance sheet T
  I.push(CLR(S(1)));
  I.push(T(C(1,0),1120,200,"BALANCE SHEET  (₹ crore)",{anchor:"middle",size:34,color:COL.grey}));
  I.push(FOCUS(C(1,0),1120,450),P(C(1,0,0.2),H.line(500,262,1740,262,161),{dur:0.6,sw:5}),P(C(1,0,0.5),H.line(1120,240,1120,760,162),{dur:0.6,sw:5}));
  I.push(T(C(1,1),810,245,"OWNS  (assets)",{anchor:"middle",size:40,color:COL.teal}),T(C(1,3),1430,245,"OWES  (liabilities)",{anchor:"middle",size:40,color:COL.red}));
  const L=[["cash",0],["factories",0.25],["inventory",0.5],["money customers owe",0.75]];
  L.forEach(([s,f],i)=>I.push(T(C(1,1,f+0.2),620,340+i*70,"• "+s,{size:38})));
  I.push(...coins(C(1,1,0.2),560,335,1,171));
  I.push(FOCUS(C(1,2),810,680),T(C(1,2),810,700,"₹500 cr",{anchor:"middle",font:"caveat",size:76,color:COL.teal}));
  I.push(T(C(1,3,0.3),1230,340,"• loans",{size:38}),T(C(1,3,0.6),1230,410,"• unpaid bills",{size:38}));
  I.push(FOCUS(C(1,4),1430,680),T(C(1,4),1430,700,"₹300 cr",{anchor:"middle",font:"caveat",size:76,color:COL.red}));
  // book value
  I.push(FOCUS(C(2,0),1120,850),HL(C(2,0,0.4),760,805,720,70),T(C(2,0),1120,855,"500 − 300  =  ₹200 cr",{anchor:"middle",font:"caveat",size:64}));
  I.push(T(C(2,0,0.7),1120,925,"Book value  =  shareholders' equity  =  what's left for the owners",{anchor:"middle",size:34,color:COL.grey}));
  // per share & P/B
  I.push(CLR(S(3)));
  I.push(FOCUS(C(3,0),960,300),T(C(3,0),960,300,"₹200 cr ÷ 10 cr shares  =  ₹20 per share",{anchor:"middle",size:50}));
  I.push(FOCUS(C(3,1),960,440),T(C(3,1),960,440,"Share price  =  ₹40",{anchor:"middle",size:50}));
  I.push(FOCUS(C(3,2),960,640),T(C(3,2),960,620,"P/B  =  40 ÷ 20",{anchor:"middle",size:56}));
  I.push(T(C(3,2,0.7),960,760,"= 2×",{anchor:"middle",font:"caveat",size:110,color:COL.blue}),ring(C(3,2,0.9),960,725,170,70));
  // reading the number line
  I.push(CLR(S(4)));
  I.push(T(C(4,0),960,200,"Reading P/B",{anchor:"middle",font:"caveat",size:72}));
  I.push(P(C(4,0),H.arrow(480,520,1500,520,0,181),{dur:0.9,sw:5}));
  [0,1,2,3].forEach(v=>{const x=560+v*300;I.push(P(C(4,0,0.4)+v*0.1,H.line(x,505,x,535,190+v),{dur:0.2,sw:4}),T(C(4,0,0.5)+v*0.1,x,590,String(v)+"×",{anchor:"middle",size:40}));});
  I.push(FOCUS(C(4,0,0.6),1160,520),P(C(4,0,0.7),H.ellipse(1160,520,16,16,199),{dur:0.3,fill:COL.blue,fillOp:1,color:COL.blue}),T(C(4,0,0.8),1160,440,"market pays ₹2 for ₹1 of net assets",{anchor:"middle",size:36,color:COL.blue}));
  I.push(FOCUS(C(4,1),700,680),HL(C(4,1),540,640,660,56),T(C(4,1),560,680,"below 1× : assets for less than book",{size:36}));
  I.push(FOCUS(C(4,2),700,800),T(C(4,2),560,790,"a bargain…",{size:40,color:COL.green}),T(C(4,2,0.5),800,790,"or the books are overstated?",{size:40,color:COL.red}));
  // where it works / fails
  I.push(CLR(S(5)));
  I.push(FOCUS(C(5,0),700,400),T(C(5,0),700,210,"Works well",{anchor:"middle",font:"caveat",size:60,color:COL.green}),...bank(C(5,0,0.1),600,250,200,201));
  I.push(T(C(5,0,0.35),620,460,"banks",{size:40}),tick(C(5,0,0.45),790,430,36),T(C(5,0,0.5),620,520,"insurers",{size:40}),tick(C(5,0,0.6),790,490,36),T(C(5,0,0.65),620,580,"asset-heavy firms",{size:40}),tick(C(5,0,0.75),975,550,36));
  I.push(T(C(5,0,0.85),700,650,"the balance sheet IS the business",{anchor:"middle",size:32,color:COL.grey}));
  I.push(FOCUS(C(5,1),1300,400),T(C(5,1),1300,210,"Fails",{anchor:"middle",font:"caveat",size:60,color:COL.red}),...laptop(C(5,1,0.1),1200,250,200,211));
  I.push(T(C(5,1,0.35),1200,460,"software",{size:40}),cross(C(5,1,0.45),1400,430,32),T(C(5,1,0.5),1200,520,"brands",{size:40}),cross(C(5,1,0.6),1400,490,32));
  I.push(T(C(5,1,0.75),1300,650,"people & ideas aren't on the books",{anchor:"middle",size:32,color:COL.grey}));
  I.push(FOCUS(C(5,2),960,800),HL(C(5,2,0.2),430,770,1060,70),T(C(5,2),960,825,"Pair it with ROE:  20% ROE deserves a higher P/B than 5%",{anchor:"middle",font:"caveat",size:50}));
  return {items:I,meta:{caps,chapterTimes:[{t:0,i:0},{t:S(2),i:1},{t:S(4),i:2}]},duration};
};

// ================= VIDEO 4: EV/EBITDA
builders["04-ev-ebitda"]=function(vt){
  const {S,C,E,caps,duration}=makeCtx(vt);const I=[];
  I.push(FOCUS(0,960,200),T(C(0,0),960,210,"EV / EBITDA",{anchor:"middle",font:"caveat",size:90}));
  I.push(T(C(0,2),960,300,"the fairest comparison tool",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(0,3),960,560),...house(C(0,3),800,380,320,221),T(C(0,3,0.6),1200,470,"LOAN",{font:"caveat",size:54,color:COL.red}),P(C(0,3,0.55),H.rect(1180,420,150,70,222),{dur:0.4,color:COL.red}));
  I.push(T(C(0,3,0.8),960,720,"buying a house that still has a loan on it",{anchor:"middle",size:36}));
  // EV build-up
  I.push(CLR(S(1)));
  I.push(...house(C(1,0),430,330,320,231),T(C(1,0,0.5),830,420,"LOAN",{font:"caveat",size:48,color:COL.red}),P(C(1,0,0.45),H.rect(810,375,140,66,232),{dur:0.4,color:COL.red}));
  const ex=1400;
  I.push(FOCUS(C(1,0),ex,300),T(C(1,0),ex,300,"Market cap = price × shares",{anchor:"middle",size:40}));
  I.push(FOCUS(C(1,1),ex,380),T(C(1,1),ex,385,"₹1,000 cr",{anchor:"middle",font:"caveat",size:64,color:COL.blue}));
  I.push(FOCUS(C(1,2),ex,490),T(C(1,2),ex,495,"+  Debt   ₹400 cr",{anchor:"middle",size:50,color:COL.red}));
  I.push(FOCUS(C(1,3),ex,590),T(C(1,3),ex,595,"−  Cash   ₹100 cr",{anchor:"middle",size:50,color:COL.green}));
  I.push(P(C(1,4),H.line(1100,640,1700,640,241),{dur:0.4,sw:5}));
  I.push(FOCUS(C(1,5),ex,720),HL(C(1,5,0.3),1060,680,680,80),T(C(1,5),ex,735,"Enterprise value  =  ₹1,300 cr",{anchor:"middle",font:"caveat",size:62}));
  I.push(T(C(1,4,0.3),ex,850,"the real cost of the whole business",{anchor:"middle",size:36,color:COL.grey}));
  I.push(T(C(1,5,0.8),ex,900,"1,000 + 400 − 100 = 1,300 ✓",{anchor:"middle",size:30,color:COL.grey}));
  // EBITDA
  I.push(CLR(S(2)));
  I.push(T(C(2,0),960,200,"The earnings side",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(2,1),960,330),T(C(2,1),960,340,"Operating profit  ₹150 cr",{anchor:"middle",size:50}));
  I.push(FOCUS(C(2,2),960,450),T(C(2,2),960,450,"+  Depreciation & amortisation  ₹50 cr",{anchor:"middle",size:50,color:COL.teal}));
  I.push(T(C(2,2,0.6),960,510,"(paper charge for wear & tear on machines)",{anchor:"middle",size:32,color:COL.grey}));
  I.push(P(C(2,3),H.line(560,560,1360,560,251),{dur:0.4,sw:5}));
  I.push(FOCUS(C(2,3),960,640),HL(C(2,3,0.3),660,600,600,80),T(C(2,3),960,655,"EBITDA  =  ₹200 cr",{anchor:"middle",font:"caveat",size:70}));
  I.push(T(C(2,3,0.5),960,760,"Earnings Before Interest, Tax, Depreciation & Amortisation",{anchor:"middle",size:36,color:COL.grey}));
  I.push(T(C(2,3,0.9),960,840,"150 + 50 = 200 ✓",{anchor:"middle",size:30,color:COL.grey}));
  // the ratio
  I.push(CLR(S(3)));
  I.push(FOCUS(C(3,0),960,320),T(C(3,0),960,320,"EV ÷ EBITDA  =  1,300 ÷ 200",{anchor:"middle",size:60}));
  I.push(T(C(3,0,0.7),960,520,"= 6.5×",{anchor:"middle",font:"caveat",size:130,color:COL.blue}),ring(C(3,0,0.9),960,480,220,85));
  I.push(FOCUS(C(3,1),960,700),...clock(C(3,1),560,690,42,261),T(C(3,1,0.2),620,705,"6.5 years of cash operating profit, loans included",{size:42}));
  // why bother
  I.push(CLR(S(4)));
  I.push(T(C(4,0),960,200,"Why bother?",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(4,1),960,290),T(C(4,1),960,290,"P/E gets distorted by debt and tax rates",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(4,2),700,480),...factory(C(4,2),540,380,300,271),T(C(4,2,0.4),690,600,"funded by loans",{anchor:"middle",size:36,color:COL.red}));
  I.push(FOCUS(C(4,2,0.5),1250,480),...factory(C(4,2,0.5),1090,380,300,281),T(C(4,2,0.9),1240,600,"funded by equity",{anchor:"middle",size:36,color:COL.green}));
  I.push(T(C(4,2,0.7),960,690,"net profit:  different",{anchor:"middle",size:44,color:COL.red}));
  I.push(FOCUS(C(4,3),960,780),HL(C(4,3,0.2),640,735,640,66),T(C(4,3),960,785,"EV / EBITDA:  the same",{anchor:"middle",font:"caveat",size:58}));
  I.push(T(C(4,3,0.7),960,870,"it compares the engine, not the financing",{anchor:"middle",size:36,color:COL.grey}));
  // the catch
  I.push(CLR(S(5)));
  I.push(FOCUS(C(5,0),960,340),...warn(C(5,0),480,280,80,291),T(C(5,0),600,330,"The catch: EBITDA ignores the cost",{size:48}),T(C(5,0,0.5),600,395,"of replacing those machines",{size:48}));
  I.push(FOCUS(C(5,1),960,540),T(C(5,1),600,560,"heavy equipment spend  →  worth less than EBITDA suggests",{size:40}));
  I.push(FOCUS(C(5,2),960,720),HL(C(5,2,0.2),560,680,800,70),T(C(5,2),960,730,"Always glance at CAPEX too",{anchor:"middle",font:"caveat",size:60}));
  return {items:I,meta:{caps,chapterTimes:[{t:0,i:0},{t:S(2),i:1},{t:S(4),i:2}]},duration};
};

// ================= VIDEO 5: PUTTING IT TOGETHER
builders["05-putting-it-together"]=function(vt){
  const {S,C,E,caps,duration}=makeCtx(vt);const I=[];
  I.push(T(C(0,0),960,200,"Three lenses",{anchor:"middle",font:"caveat",size:78}));
  const lensAt=(t,x,name,sub,col)=>[FOCUS(t,x,480),P(t,H.ellipse(x,480,150,150,(x|0)),{dur:0.8,sw:6,color:col}),T(t+0.3,x,470,name,{anchor:"middle",font:"caveat",size:name.length>4?56:72,color:col}),T(t+0.6,x,540,sub,{anchor:"middle",size:32})];
  I.push(...lensAt(C(0,1),600,"P/E","profit",COL.blue));
  I.push(...lensAt(C(0,2),960,"P/B","assets",COL.teal));
  I.push(...lensAt(C(0,3),1320,"EV/EBITDA","whole business + debt",COL.red));
  I.push(FOCUS(C(0,4),960,760),T(C(0,4),960,720,"no single one is the answer",{anchor:"middle",size:40,color:COL.grey}));
  I.push(HL(C(0,5,0.2),640,760,640,66),T(C(0,5),960,810,"read them together",{anchor:"middle",font:"caveat",size:60}));
  // check 1 peers
  I.push(CLR(S(1)));
  I.push(T(C(1,0),960,200,"Check 1:  compare with peers",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(1,1),700,460),P(C(1,1),H.rect(460,300,480,300,301),{dur:0.6}),...laptop(C(1,1,0.05),620,330,160,302),T(C(1,1,0.3),700,500,"IT company",{anchor:"middle",size:40}),T(C(1,1,0.4),700,560,"P/E 30",{anchor:"middle",font:"caveat",size:56,color:COL.blue}),tick(C(1,1,0.5),860,320,50),T(C(1,1,0.55),700,650,"normal",{anchor:"middle",size:40,color:COL.green}));
  I.push(FOCUS(C(1,1,0.6),1260,460),P(C(1,1,0.6),H.rect(1020,300,480,300,311),{dur:0.6}),...factory(C(1,1,0.65),1170,330,180,312),T(C(1,1,0.8),1260,500,"Cement maker",{anchor:"middle",size:40}),T(C(1,1,0.85),1260,560,"P/E 30",{anchor:"middle",font:"caveat",size:56,color:COL.blue}),...warn(C(1,1,0.9),1400,310,56,313),T(C(1,1,0.95),1260,650,"alarming",{anchor:"middle",size:40,color:COL.red}));
  I.push(FOCUS(C(1,2),960,800),HL(C(1,2,0.2),430,760,1060,66),T(C(1,2),960,810,"a ratio only means something next to similar businesses",{anchor:"middle",size:40}));
  // check 2 history
  I.push(CLR(S(2)));
  I.push(T(C(2,0),960,200,"Check 2:  compare with its own history",{anchor:"middle",font:"caveat",size:72}));
  I.push(P(C(2,0,0.3),H.arrow(520,720,1480,720,0,321),{dur:0.7,sw:5}),P(C(2,0,0.5),H.arrow(520,720,520,280,0,322),{dur:0.7,sw:5}));
  I.push(T(C(2,0,0.6),540,300,"P/E",{size:34,color:COL.grey}),T(C(2,0,0.6),1440,770,"years",{size:34,color:COL.grey}));
  I.push(FOCUS(C(2,1),900,560),P(C(2,1),H.poly([[560,560],[700,575],[840,555],[980,565],[1100,540]],331,false),{dur:1.2,sw:6,color:COL.blue}));
  I.push(T(C(2,1,0.3),830,520,"15×",{anchor:"middle",font:"caveat",size:50,color:COL.blue}));
  I.push(FOCUS(C(2,1,0.5),1300,400),P(C(2,1,0.5),H.poly([[1100,540],[1200,470],[1300,400],[1400,380]],332,false),{dur:0.8,sw:6,color:COL.red}));
  I.push(T(C(2,1,0.75),1380,340,"25×",{anchor:"middle",font:"caveat",size:50,color:COL.red}),ring(C(2,1,0.85),1380,355,90,45,{color:COL.red}));
  I.push(T(C(2,1,0.9),1250,620,"what changed?",{anchor:"middle",size:44}));
  I.push(FOCUS(C(2,2),960,850),T(C(2,2),960,860,"new growth…  or just a hot market?",{anchor:"middle",font:"caveat",size:56}));
  // check 3 quality
  I.push(CLR(S(3)));
  I.push(T(C(3,0),960,200,"Check 3:  the quality behind the number",{anchor:"middle",font:"caveat",size:72}));
  const chk=(t,y,q)=>[FOCUS(t,960,y),P(t,H.rect(560,y-44,56,56,(y|0)),{dur:0.4}),T(t+0.2,650,y,q,{size:48}),tick(t+0.6,566,y-40,46)];
  I.push(...chk(C(3,1),330,"Return on equity high?"));
  I.push(...chk(C(3,2),450,"Debt low?"));
  I.push(...chk(C(3,3),570,"Cash flow real, not just accounting profit?"));
  I.push(FOCUS(C(3,4),960,760),HL(C(3,4,0.2),460,715,1000,70,{color:COL.pink}),T(C(3,4),960,765,"cheap ratio  +  bad business  =  a trap, not a bargain",{anchor:"middle",font:"caveat",size:52,color:COL.red}));
  // A vs B
  I.push(CLR(S(4)));
  I.push(T(C(4,0),960,190,"A quick worked example",{anchor:"middle",font:"caveat",size:66}));
  const tx=560,ty=230,cw=[420,300,300],rh=78;
  I.push(FOCUS(C(4,0),960,500),P(C(4,0,0.2),H.rect(tx,ty,1020,rh*6,401),{dur:0.9,sw:4}));
  I.push(P(C(4,0,0.5),H.line(tx+cw[0],ty,tx+cw[0],ty+rh*6,402),{dur:0.5}),P(C(4,0,0.6),H.line(tx+cw[0]+cw[1],ty,tx+cw[0]+cw[1],ty+rh*6,403),{dur:0.5}),P(C(4,0,0.7),H.line(tx,ty+rh,tx+1020,ty+rh,404),{dur:0.5}));
  I.push(T(C(4,0,0.8),tx+cw[0]+cw[1]/2,ty+54,"Company A",{anchor:"middle",font:"caveat",size:50,color:COL.blue}),T(C(4,0,0.9),tx+cw[0]+cw[1]+cw[2]/2,ty+54,"Company B",{anchor:"middle",font:"caveat",size:50,color:COL.teal}));
  const rows=["P/E","P/B","EV / EBITDA","Return on equity","Sales growth"];
  rows.forEach((r,i)=>I.push(T(C(4,1,0.05)+i*0.08,tx+20,ty+rh*(i+1)+54,r,{size:40})));
  const A=["12","1","5","6%","shrinking"],B=["25","5","14","22%","+15% / yr"];
  const cell=(t,col,i,v,c)=>T(t,tx+cw[0]+(col?cw[1]:0)+cw[col?2:1]/2,ty+rh*(i+1)+54,v,{anchor:"middle",font:"caveat",size:48,color:c});
  I.push(FOCUS(C(4,1),tx+cw[0]+cw[1]/2,ty+300));
  [0,1,2].forEach(i=>I.push(cell(C(4,1,0.2+i*0.25),0,i,A[i],COL.ink)));
  [3,4].forEach(i=>I.push(cell(C(4,2,(i-3)*0.5),0,i,A[i],COL.red)));
  I.push(FOCUS(C(4,3),tx+cw[0]+cw[1]+cw[2]/2,ty+300));
  [0,1,2].forEach(i=>I.push(cell(C(4,3,0.2+i*0.25),1,i,B[i],COL.ink)));
  [3,4].forEach(i=>I.push(cell(C(4,4,(i-3)*0.5),1,i,B[i],COL.green)));
  I.push(FOCUS(C(4,5),tx+cw[0]+cw[1]/2,ty+rh*6+40),T(C(4,5),tx+cw[0]+cw[1]/2,ty+rh*6+60,"looks cheap",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(4,6),tx+cw[0]+cw[1]+cw[2]/2,ty+rh*6+40),T(C(4,6),tx+cw[0]+cw[1]+cw[2]/2,ty+rh*6+60,"looks expensive",{anchor:"middle",size:40,color:COL.grey}));
  I.push(FOCUS(C(4,7),tx+cw[0]+cw[1]+cw[2]/2,ty+300),ring(C(4,7,0.1),tx+cw[0]+cw[1]+cw[2]/2,ty+rh*3.6,150,212),T(C(4,7,0.3),tx+cw[0]+cw[1]+cw[2]/2,ty+rh*6+120,"worth paying up for",{anchor:"middle",font:"caveat",size:46,color:COL.teal}));
  I.push(cross(C(4,7,0.6),tx+cw[0]+cw[1]/2-24,ty+rh*6+78,48),T(C(4,7,0.7),tx+cw[0]+cw[1]/2,ty+rh*6+170,"many got burned",{anchor:"middle",size:34,color:COL.red}));
  // closing
  I.push(CLR(S(5)));
  I.push(FOCUS(C(5,0),960,230),T(C(5,0),960,230,"The ratio is the start, not the end",{anchor:"middle",font:"caveat",size:72}));
  I.push(FOCUS(C(5,1),640,460),P(C(5,1),H.rect(440,380,440,180,501),{dur:0.6}),T(C(5,1,0.2),660,450,"PRICE",{anchor:"middle",font:"caveat",size:64,color:COL.blue}),T(C(5,1,0.5),660,520,"what the market thinks",{anchor:"middle",size:34}));
  I.push(FOCUS(C(5,2),1280,460),P(C(5,2),H.rect(1040,380,440,180,511),{dur:0.6}),T(C(5,2,0.2),1260,450,"ACCOUNTS",{anchor:"middle",font:"caveat",size:64,color:COL.teal}),T(C(5,2,0.5),1260,520,"what the business is",{anchor:"middle",size:34}));
  I.push(arrow(C(5,3),900,470,1020,470,0),arrow(C(5,3,0.2),1020,490,900,490,0));
  I.push(FOCUS(C(5,3),960,700),HL(C(5,3,0.3),420,660,1080,74),T(C(5,3),960,712,"Valuation  =  checking one against the other",{anchor:"middle",font:"caveat",size:60}));
  I.push(T(C(5,3,0.8),960,800,"…before you hand over your money",{anchor:"middle",size:40,color:COL.grey}));
  return {items:I,meta:{caps,chapterTimes:[{t:0,i:0},{t:S(1),i:1},{t:S(4),i:2}]},duration};
};

window.buildVideo=function(id,vt,label,chapters){const r=builders[id](vt);r.meta.label=label;r.meta.chapters=chapters;return r;};
})();
