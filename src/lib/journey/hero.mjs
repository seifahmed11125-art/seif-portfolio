// The production hero's SVG, breakpoints, scroll length and assembly timings.
// It uses native document scrolling before the camera journey begins.
import {clamp,smooth} from './journey-model.mjs';
import {MOBILE_LAYOUT_QUERY} from './responsive.mjs';
const labels=['Scroll to assemble','Finish sequence','Replay sequence'];
const pieces=[
  {name:'part-a',x:-44,y:-17,angle:-16,start:.07,end:.48},
  {name:'part-b',x:35,y:0,angle:13,start:.18,end:.64},
  {name:'part-c',x:-27,y:34,angle:-11,start:.29,end:.75},
  {name:'part-dot',x:20,y:39,angle:0,start:.57,end:.88}
];
export function heroFrame(value,compact=false,reduced=false){
  const p=reduced?0:clamp(value,0,1),expansion=smooth(.17,.83,p);
  const intro=smooth(.29,.61,p),statement=smooth(.61,.9,p);
  const entry=compact?[46,5,12,5]:[17,7,12,51],exit=compact?[20,4,12,4]:[11,3.5,11,3.5];
  const vars={
    'intro-opacity':1-intro,'intro-offset':(compact?-12:-54)*intro+'px',
    'board-opacity':1-smooth(.55,.89,p),'end-opacity':statement,
    'end-offset':(1-statement)*18+'px','grid-alpha':1-statement*.8,
    'mark-x':compact?'0%':(expansion*37).toFixed(2)+'%',
    'mark-y':'0%',
    'mark-size':(compact?.94+expansion*.06:1+expansion*.27).toFixed(3),
    'mobile-board-scale':(.96+expansion*.04).toFixed(3),
    'reel-progress':p.toFixed(3),'dot-alpha':reduced?1:.34+statement*.66
  };
  entry.forEach((edge,i)=>{vars['edge-'+i]=(edge+(exit[i]-edge)*expansion).toFixed(2)+'%';});
  for(const {name,x,y,angle,start,end} of pieces){
    const remaining=reduced?0:1-smooth(start,end,p);
    vars[name]=`translate(${x*remaining}px, ${y*remaining}px) rotate(${angle*remaining}deg)`;
  }
  return {vars,phase:p<.25?0:p<.72?1:2,workHidden:intro>.7,progress:p};
}
export function mobileLogoTransforms(value,reduced=false){
  return pieces.map(({x,y,angle,start,end})=>{
    const remaining=reduced?0:1-smooth(start,end,clamp(value,0,1));
    return 'translate3d('+(x/440*100*remaining).toFixed(3)+'%,'+(y/440*100*remaining).toFixed(3)+'%,0) rotate('+(angle*remaining).toFixed(3)+'deg)';
  });
}
export function mountHeroScene(hero,doc=document,win=window){
  if(!hero)return {measure(){},destroy(){}};
  const stage=hero.querySelector('.reel-stage'),work=hero.querySelector('.reel-work'),media=hero.querySelector('.reel-media');
  const intro=hero.querySelector('.reel-intro'),statement=hero.querySelector('.reel-statement'),grid=hero.querySelector('.reel-grid'),guides=hero.querySelector('.reel-guides');
  const mobileArt=hero.querySelector('.reel-mobile-art'),mobileGrid=hero.querySelector('.reel-mobile-grid'),mobilePieces=Array.from(hero.querySelectorAll('[data-logo-part]'));
  const counter=hero.querySelector('.reel-counter'),cueText=hero.querySelector('.reel-cue-text'),cueArrow=hero.querySelector('.reel-cue-arrow'),progressBar=hero.querySelector('.reel-progress i');
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),compact=win.matchMedia(MOBILE_LAYOUT_QUERY);
  let pending=0,top=0,length=1,previous=-1,phase=-1,paintedMobile=null;
  const style=(element,property,value)=>{if(element&&element.style[property]!==value)element.style[property]=value;};
  function draw(){
    pending=0;
    const progress=reduced.matches?0:clamp((win.scrollY-top)/length,0,1);
    if(progress===previous)return;
    previous=progress;
    const state=heroFrame(progress,compact.matches,reduced.matches);
    if(paintedMobile!==compact.matches){
      [intro,statement,grid,guides,mobileGrid].forEach(element=>{element?.style.removeProperty('opacity');element?.style.removeProperty('transform');});
      progressBar.style.removeProperty('transform');paintedMobile=compact.matches;
    }
    if(compact.matches){
      // Move cached HTML layers instead of repainting SVG geometry on iOS.
      style(intro,'opacity',String(state.vars['intro-opacity']));
      style(intro,'transform','translate3d(0,'+state.vars['intro-offset']+',0)');
      style(statement,'opacity',String(state.vars['end-opacity']));
      style(statement,'transform','translate3d(0,'+state.vars['end-offset']+',0)');
      style(grid,'opacity',String(state.vars['grid-alpha']));style(guides,'opacity',String(state.vars['board-opacity']));
      mobileLogoTransforms(progress,reduced.matches).forEach((transform,index)=>{
        style(mobilePieces[index],'transform',transform);
        style(mobilePieces[index],'willChange',!reduced.matches&&progress>pieces[index].start&&progress<pieces[index].end?'transform':'auto');
      });
      style(mobilePieces[3],'opacity',String(state.vars['dot-alpha']));
      style(progressBar,'transform','scaleX('+state.vars['reel-progress']+')');
    }else for(const [key,value] of Object.entries(state.vars))stage.style.setProperty('--'+key,String(value));
    hero.dataset.progress=state.vars['reel-progress'];
    if(phase!==state.phase){
      phase=state.phase;hero.dataset.phase=String(phase);counter.textContent='0'+(phase+1);
      cueText.textContent=labels[phase];cueArrow.textContent=phase===2?'↺':'↓';
    }
    if(work.inert!==state.workHidden)work.inert=state.workHidden;
  }
  function queue(){
    if(previous===1&&win.scrollY>=top+length||previous===0&&win.scrollY<=top)return;
    if(!pending&&!doc.hidden)pending=win.requestAnimationFrame(draw);
  }
  function measure(){
    top=win.scrollY+hero.getBoundingClientRect().top;
    length=Math.max(1,hero.offsetHeight-stage.offsetHeight);previous=-1;queue();
    if(compact.matches&&mobileArt){
      const size=Math.max(1,Math.min(media.clientWidth,media.clientHeight,480));
      style(mobileArt,'width',size+'px');style(mobileArt,'height',size+'px');
    }
  }
  function jump(){if(!reduced.matches)win.scrollTo({top:phase===2?top:top+length*.97,behavior:'smooth'});}
  hero.dataset.ready='true';
  const observer=win.ResizeObserver?new win.ResizeObserver(measure):null;
  observer?.observe(hero);observer?.observe(stage);observer?.observe(media);
  const cue=hero.querySelector('.reel-cue');cue.addEventListener('click',jump);
  win.addEventListener('scroll',queue,{passive:true});win.addEventListener('resize',measure,{passive:true});
  doc.addEventListener('visibilitychange',queue);
  reduced.addEventListener?.('change',measure);compact.addEventListener?.('change',measure);
  measure();
  function revealIntro(){
    if(hero.dataset.entered==='true')return;
    hero.dataset.entered='true';
  }
  return {measure,revealIntro,destroy(){
    win.cancelAnimationFrame(pending);observer?.disconnect();cue.removeEventListener('click',jump);
    win.removeEventListener('scroll',queue);win.removeEventListener('resize',measure);
    doc.removeEventListener('visibilitychange',queue);reduced.removeEventListener?.('change',measure);compact.removeEventListener?.('change',measure);
  }};
}
