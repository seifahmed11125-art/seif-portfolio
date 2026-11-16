import {JourneyController,cameraAt,stationPose,clamp,projectAspect,filterProjects,deckFrames,galleryOffset,journeyAtOffset,stationOffset} from './journey-model.mjs';
import {mountHeroScene} from './hero.mjs';
import {createInlinePlayers,createVideoMarkup} from './inline-video.mjs';

export function mountApp(doc=document,win=window,data){
  const root=doc.querySelector('.portfolio-experience')||doc;
  const isHome=(root.dataset?.page||doc.body.dataset.page)==='home';
  const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  const $=selector=>root.querySelector(selector);
  const $$=selector=>Array.from(root.querySelectorAll(selector));
  const listeners=[];
  function listen(target,type,handler,options){
    if(!target)return;target.addEventListener(type,handler,options);
    listeners.push(()=>target.removeEventListener(type,handler,options));
  }
  const names=['Home','About','Services','Portfolio','Contact'];
  const hashes=['home','about','services','portfolio','contact'];
  const controller=new JourneyController(1,8);
  const stations=$$('.station');
  const shell=$('.journey-shell');
  const travel=$('.journey-scroll');
  const dialog=$('.project-dialog');
  const inlinePlayers=createInlinePlayers(root);
  let activeStation=-1,serviceIndex=0,serviceFlipping=false,queuedService=null;
  let serviceAnimations=[],galleryActive=0,galleryFilter='All',galleryProjects=filterProjects(data.projects,'All',4);
  let drag=null,suppressProjectClick=false,lastFocused=null,disposed=false;
  let width=win.innerWidth,height=win.innerHeight,previousFrame=0,lastPaint=0,frameId=0;
  let travelTop=0,travelBottom=0,journeyVisible=false,renderedProgress=-1,lastPointerX=-1,lastPointerY=-1,forcePaint=true,resizeObserver=null;
  const pointer={x:0,y:0,tx:0,ty:0};
  const safeUrl=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
  const setText=(element,value)=>{if(element)element.textContent=value??'';};
  function selectServiceState(index){
    serviceIndex=index;
    $$('.service-tab').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  function serviceCard(index,position){
    const face=doc.createElement('article');face.className='service-card service-'+position;
    face.dataset.serviceId=String(index);face.setAttribute('aria-hidden',String(position!=='current'));
    const number=doc.createElement('span');number.className='service-number';
    face.append(number,doc.createElement('h3'),doc.createElement('p'));
    const service=data.services[index];
    setText(face.querySelector('.service-number'),String(index+1).padStart(2,'0')+' / '+String(data.services.length).padStart(2,'0'));
    setText(face.querySelector('h3'),service.name);
    setText(face.querySelector('p'),service.description);
    return face;
  }
  async function selectService(index){
    const next=(index+data.services.length)%data.services.length;
    if(serviceFlipping){queuedService=index;return;}
    if(next===serviceIndex)return;
    const deck=$('.service-deck'),outgoing=deck.querySelector('.service-current');
    const direction=index>serviceIndex?1:-1;
    const incoming=serviceCard(next,'under');
    const bottom=serviceCard((next+direction+data.services.length)%data.services.length,'bottom');
    selectServiceState(next);
    if(reduced||typeof outgoing.animate!=='function'){
      incoming.className='service-card service-current';incoming.setAttribute('aria-hidden','false');
      deck.replaceChildren(incoming,serviceCard((next+1)%data.services.length,'under'),serviceCard((next+2)%data.services.length,'bottom'));return;
    }
    deck.replaceChildren(outgoing,incoming,bottom);
    serviceFlipping=true;deck.setAttribute('aria-busy','true');
    const frames=deckFrames(direction),options={duration:720,easing:'cubic-bezier(.22,.75,.22,1)',fill:'forwards'};
    // Three separate cards change places; the outgoing card keeps its own text.
    serviceAnimations=[outgoing.animate(frames.outgoing,options),incoming.animate(frames.incoming,options),bottom.animate(frames.bottom,options)];
    try{await Promise.all(serviceAnimations.map(animation=>animation.finished));}catch{}
    if(disposed)return;
    incoming.className='service-card service-current';incoming.setAttribute('aria-hidden','false');
    bottom.className='service-card service-under';
    outgoing.className='service-card service-bottom';outgoing.setAttribute('aria-hidden','true');
    serviceAnimations.forEach(animation=>animation.cancel());serviceAnimations=[];
    deck.replaceChildren(incoming,bottom,outgoing);
    serviceFlipping=false;deck.removeAttribute('aria-busy');
    if(queuedService!==null){const queued=queuedService;queuedService=null;if(queued!==serviceIndex)selectService(queued);}
  }
  $$('.service-tab').forEach(button=>listen(button,'click',()=>selectService(Number(button.dataset.service))));
  listen($('.service-prev'),'click',()=>selectService(serviceIndex-1));
  listen($('.service-next'),'click',()=>selectService(serviceIndex+1));

  function closeProject(){
    doc.documentElement.style.overflow='';
    const video=dialog.querySelector('video');
    if(video){video.pause?.();video.removeAttribute('src');video.load?.();}
    if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
    requestFrame();
  }
  listen(dialog.querySelector('.dialog-close'),'click',closeProject);
  listen(dialog,'close',()=>{doc.documentElement.style.overflow='';lastFocused?.focus?.({preventScroll:true});requestFrame();});
  listen(dialog,'cancel',event=>{event.preventDefault();closeProject();});
  listen(dialog,'click',event=>{if(event.target===dialog)closeProject();});
  function openProject(project){
    if(project.category==='AI Videos'){
      const container=$$('[data-video-project]').find(element=>element.dataset.videoProject===project.id);
      return inlinePlayers.play(container,safeUrl(project.video_url));
    }
    const media=$('.dialog-media');
    media.replaceChildren();media.style.setProperty('--media-aspect',projectAspect(project));
    const image=doc.createElement('img');
    image.src=project.cover;image.alt=project.title;media.append(image);
    setText($('.dialog-category'),project.category);
    setText($('#project-dialog-title'),project.title);
    setText($('.dialog-description'),(project.description??'').replace(/\\r\\n/g,'\n'));
    const external=$('.dialog-external');
    external.href=safeUrl(project.external_link)??'#';
    external.hidden=!safeUrl(project.external_link);
    const onBehance=external.href.includes('behance.net');
    external.textContent=onBehance?'View on Behance ↗':'View Project ↗';
    lastFocused=doc.activeElement;
    doc.documentElement.style.overflow='hidden';
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    $('.dialog-close').focus({preventScroll:true});
  }
  listen(root,'click',event=>{
    const play=event.target.closest?.('[data-play-video]');
    if(play&&root.contains(play)){
      event.preventDefault();if(suppressProjectClick)return;
      const project=data.projects.find(project=>project.id===play.dataset.playVideo);
      if(project)inlinePlayers.play(play.closest('[data-video-project]'),safeUrl(project.video_url));
      return;
    }
    const link=event.target.closest?.('[data-open-project]');
    if(!link||!root.contains(link)||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(suppressProjectClick)return;
    const project=data.projects.find(project=>project.id===link.dataset.openProject);
    if(project)openProject(project);
  });
  function projectCard(project){
    const ai=project.category==='AI Videos';
    const article=doc.createElement('article');
    article.className='project-card project-card--'+(ai?'video':'design');
    article.dataset.projectId=project.id;
    if(ai)article.append(createVideoMarkup(doc,project));
    else {
    const link=doc.createElement('a');
    link.className='project-open';link.href=safeUrl(project.external_link)??'#';
    link.target='_blank';link.rel='noopener noreferrer';link.dataset.openProject=project.id;
    link.setAttribute('aria-label','View Project: '+project.title);
    const media=doc.createElement('div');
    media.className='project-media';media.style.setProperty('--media-aspect',projectAspect(project));
    const image=doc.createElement('img');image.src=project.cover;image.alt=project.title;
    image.loading='lazy';image.decoding='async';image.draggable=false;image.width=ai?640:400;image.height=ai?360:500;media.append(image);
    const overlay=doc.createElement('span');overlay.className='project-overlay';overlay.textContent='View Project ↗';media.append(overlay);
    link.append(media);
    article.append(link);
    }
    const meta=doc.createElement('div');meta.className='project-meta';
    const title=doc.createElement('h3');title.textContent=project.title;
    const category=doc.createElement('span');category.textContent=project.category;
    meta.append(title,category);article.append(meta);
    if(ai&&safeUrl(project.external_link)){
      const external=doc.createElement('a');external.className='project-external';
      external.href=safeUrl(project.external_link)??'#';external.target='_blank';external.rel='noopener noreferrer';
      external.textContent='View on Behance ↗';article.append(external);
    }
    return article;
  }

  function positionGallery(){
    const track=$('.gallery-track'),viewport=$('.gallery-window');
    if(!track||!viewport)return;
    const cards=Array.from(track.children);
    galleryActive=clamp(galleryActive,0,Math.max(cards.length-1,0));
    const active=cards[galleryActive];
    const last=cards.at(-1),contentWidth=last?last.offsetLeft+last.offsetWidth:0;
    const offset=active?galleryOffset(viewport.clientWidth,contentWidth,active.offsetLeft,active.offsetWidth):0;
    track.dataset.offset=String(offset);
    track.style.transform='translate3d('+offset+'px,0,0)';
    cards.forEach((card,i)=>{
      card.style.transform='none';
      card.style.opacity='1';
      card.dataset.selected=String(i===galleryActive);
    });
    setText($('.gallery-count'),cards.length?String(galleryActive+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0'):'00 / 00');
    if($('.gallery-prev'))$('.gallery-prev').disabled=galleryActive<=0;
    if($('.gallery-next'))$('.gallery-next').disabled=galleryActive>=cards.length-1;
  }
  function updateFilter(category){
    inlinePlayers.releaseAll();
    galleryFilter=data.categories.includes(category)?category:'All';
    $$('.category-filter').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===galleryFilter)));
    const selected=filterProjects(data.projects,galleryFilter,isHome?4:undefined);
    const container=isHome?$('.gallery-track'):$('.all-project-grid');
    container.replaceChildren(...selected.map(projectCard));
    $('.projects-empty').hidden=selected.length!==0;
    if(isHome){
      galleryProjects=selected;galleryActive=0;positionGallery();
      $('.view-all').href='/projects'+(galleryFilter==='All'?'':'?category='+encodeURIComponent(galleryFilter));
    }else{
      setText($('.all-project-count'),selected.length+' projects');
      setText($('.filter-announcement'),galleryFilter+': '+selected.length+' projects');
      const url=new URL(win.location.href);
      if(galleryFilter==='All')url.searchParams.delete('category');else url.searchParams.set('category',galleryFilter);
      win.history.replaceState({},'',url.pathname+url.search);
    }
  }
  $$('.category-filter').forEach(button=>listen(button,'click',()=>updateFilter(button.dataset.category)));
  listen($('.gallery-prev'),'click',()=>{galleryActive=Math.max(0,galleryActive-1);positionGallery();});
  listen($('.gallery-next'),'click',()=>{galleryActive=Math.min(galleryProjects.length-1,galleryActive+1);positionGallery();});
  if(isHome){
    const viewport=$('.gallery-window'),track=$('.gallery-track');
    listen(viewport,'pointerdown',event=>{
      if(event.button!==0||event.target.closest('video'))return;
      drag={startX:event.clientX,startY:event.clientY,lastX:event.clientX,offset:Number(track.dataset.offset??0),moved:false,pointerId:event.pointerId};
    });
    listen(win,'pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
      if(Math.abs(dy)>Math.abs(dx)*1.3&&Math.abs(dy)>12){drag=null;track.classList.remove('is-dragging');return;}
      if(Math.abs(dx)>8){drag.moved=true;suppressProjectClick=true;track.classList.add('is-dragging');event.preventDefault();track.style.transform='translate3d('+(drag.offset+dx*.8)+'px,0,0)';}
      drag.lastX=event.clientX;
    },{passive:false});
    listen(win,'pointerup',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX,moved=drag.moved;
      drag=null;track.classList.remove('is-dragging');
      if(moved&&Math.abs(dx)>40)galleryActive=clamp(galleryActive+(dx<0?1:-1),0,Math.max(galleryProjects.length-1,0));
      positionGallery();
      if(moved)win.setTimeout(()=>{suppressProjectClick=false;},180);
    });
    listen(win,'pointercancel',()=>{drag=null;track.classList.remove('is-dragging');positionGallery();suppressProjectClick=false;});
  }

  function enterStation(index){
    if(index===activeStation)return;
    if(index!==3)inlinePlayers.pauseAll();
    activeStation=index;
    $$('.site-header [data-station]').forEach(link=>{
      if(Number(link.dataset.station)===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    $$('.journey-route-track button').forEach((button,i)=>button.setAttribute('aria-current',i===index?'step':'false'));
    setText($('.station-number'),String(index+1).padStart(2,'0'));
    const back=$('.journey-back'),next=$('.journey-next');
    back.disabled=index===0;
    back.replaceChildren();
    const arrow=doc.createElement('span'),label=doc.createElement('span');
    arrow.textContent='←';arrow.setAttribute('aria-hidden','true');label.textContent=names[Math.max(0,index-1)];back.append(arrow,label);
    setText(next.querySelector('span'),index===4?'Home':names[index+1]);
    setText($('.station-announcement'),names[index]);
  }
  function updateJourney(force=false){
    const progress=controller.progress;
    const selected=win.scrollY<travelTop-height*.45?0:clamp(Math.round(progress),1,4);
    const selectedChanged=selected!==activeStation;
    enterStation(selected);
    shell.dataset.direction=controller.direction>0?'forward':'backward';
    if(!force&&!selectedChanged&&Math.abs(progress-renderedProgress)<.00001)return;
    renderedProgress=progress;
    stations.forEach(station=>{
      const index=Number(station.dataset.index),pose=stationPose(index,progress,width,height);
      const visible=reduced?index===selected:pose.visible;
      station.style.visibility=visible?'visible':'hidden';
      station.style.opacity=String(reduced?1:pose.opacity);
      station.style.transform=reduced?'none':'translate3d('+pose.x+'px,'+pose.y+'px,'+pose.z+'px) rotateY('+pose.rotation+'deg)';
      station.classList.toggle('is-current',index===selected);
      station.inert=index!==selected||!visible;
      station.setAttribute('aria-hidden',String(index!==selected));
    });
    $('.journey-route-progress').style.transform='scaleX('+progress/4+')';
    shell.dataset.progress=progress.toFixed(4);
  }
  function goTo(index,hash=true,instant=false){
    if(!isHome||dialog.open)return;
    const selected=clamp(index,0,4);
    if(hash)win.history.replaceState({},'','#'+hashes[selected]);
    win.scrollTo({top:selected===0?0:travelTop+stationOffset(selected,height),behavior:reduced||instant?'instant':'smooth'});
    syncScroll();
  }
  function requestFrame(){if(isHome&&!disposed&&!frameId&&!doc.hidden)frameId=win.requestAnimationFrame(frame);}
  let previousScroll=win.scrollY;
  function syncScroll(){
    if(!isHome)return;
    const y=win.scrollY,delta=y-previousScroll;previousScroll=y;
    journeyVisible=y+height>travelTop&&y<travelBottom;
    controller.goTo(journeyAtOffset(y-travelTop,height));
    if(delta)controller.direction=Math.sign(delta);
    if(reduced||!journeyVisible){controller.progress=controller.target;controller.velocity=0;renderedProgress=-1;}
    if(y<travelTop-height*.45)enterStation(0);
    if(journeyVisible)requestFrame();
  }
  if(isHome){
    $$('[data-station]').forEach(control=>listen(control,'click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();goTo(Number(control.dataset.station));
    }));
    listen($('.journey-back'),'click',()=>goTo(Math.max(0,activeStation-1)));
    listen($('.journey-next'),'click',()=>goTo((activeStation+1)%5));
    // Native wheel, touch, keyboard and scrollbar all feed the same scroll path.
    listen(win,'scroll',syncScroll,{passive:true});
    listen(win,'hashchange',()=>{const index=hashes.indexOf(win.location.hash.slice(1));if(index>=0)goTo(index,false);});
    listen(shell,'pointermove',event=>{
      if(event.pointerType==='touch')return;
      const bounds=shell.getBoundingClientRect();
      pointer.tx=(event.clientX-bounds.left)/Math.max(bounds.width,1)*2-1;
      pointer.ty=(event.clientY-bounds.top)/Math.max(bounds.height,1)*2-1;requestFrame();
    },{passive:true});
    listen(shell,'pointerleave',()=>{pointer.tx=0;pointer.ty=0;requestFrame();},{passive:true});
  }
  listen(doc,'keydown',event=>{
    if(dialog.open){if(event.key==='Escape'){event.preventDefault();closeProject();}return;}
    if(!isHome||event.ctrlKey||event.metaKey||event.altKey||/INPUT|TEXTAREA|SELECT|VIDEO/.test(event.target.tagName))return;
    if(event.key==='Home'){event.preventDefault();goTo(0);}
    if(event.key==='End'){event.preventDefault();goTo(4);}
    if(activeStation===2&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();selectService(serviceIndex+(event.key==='ArrowRight'?1:-1));}
    if(activeStation===3&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryActive=clamp(galleryActive+(event.key==='ArrowRight'?1:-1),0,Math.max(galleryProjects.length-1,0));positionGallery();}
  });

  const canvas=$('.world');
  const ctx=canvas?.getContext('2d');
  let seed=54727,dpr=1,lastCanvasProgress=-1;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const field=isHome?Array.from({length:1500},()=>({x:(random()-.5)*130,z:random()*405-35,seed:random()})):[];
  function resize(){
    width=shell?.clientWidth||win.innerWidth;height=shell?.clientHeight||win.innerHeight;
    dpr=Math.min(win.devicePixelRatio||1,1.25);
    if(canvas){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}
    positionGallery();
    if(isHome){
      travelTop=win.scrollY+travel.getBoundingClientRect().top;
      travelBottom=travelTop+travel.offsetHeight;
      forcePaint=true;syncScroll();updateJourney(true);
    }
  }
  listen(win,'resize',resize);
  function paintField(time){
    const camera=cameraAt(controller.progress),focal=width*.81,center=height*.49;
    const drift=reduced?0:time*.25;
    const isContact=clamp((controller.progress-3.2)/.8,0,1);
    const stride=width<560?3:1;
    for(let i=0;i<field.length;i+=stride){
      const p=field[i],z=p.z-camera.z;
      if(z<2||z>148)continue;
      const x=p.x-camera.x*7-pointer.x*.6;
      let y=8+Math.sin(p.x*.1+p.z*.038+drift*.25)*4.3+Math.cos(p.z*.08+p.x*.1)*2.1;
      if(i%10===0)y=-y-7;
      if(isContact>0)y=y*(1-isContact)+(22-((p.seed*40+drift*3)%40))*isContact;
      const factor=focal/(z+33),sx=width*.5+x*factor,sy=center+(y-camera.y*2)*factor;
      if(sx<-10||sx>width+10||sy<-10||sy>height+10)continue;
      const opacity=(.1+p.seed*.32)*(1-z/175),size=clamp((.5+p.seed)*factor*.055,.45,2.1);
      if(p.seed>.97){ctx.fillStyle='rgba(185,239,163,'+opacity*.1+')';ctx.beginPath();ctx.arc(sx,sy,size*4,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=i%5===0?'rgba(130,149,220,'+opacity*.65+')':'rgba(185,239,163,'+opacity*.7+')';
      ctx.fillRect(sx,sy,size,size);
      if(Math.abs(controller.velocity)>.1&&i%19===0){ctx.strokeStyle='rgba(185,239,163,'+opacity*.12+')';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(sx-width*.5)*controller.velocity*.025,sy+(sy-center)*controller.velocity*.025);ctx.stroke();}
    }
  }
  function frame(now){
    frameId=0;
    if(disposed||doc.hidden||!journeyVisible||dialog.open){previousFrame=0;return;}
    const dt=previousFrame?Math.min((now-previousFrame)/1000,.032):.016;
    previousFrame=now;
    if(!reduced)controller.advance(dt);
    pointer.x+=(pointer.tx-pointer.x)*.16;pointer.y+=(pointer.ty-pointer.y)*.16;
    updateJourney();
    const moving=Math.abs(controller.target-controller.progress)>.0002||Math.abs(controller.velocity)>.002;
    const pointerMoving=!reduced&&(Math.abs(pointer.tx-pointer.x)>.002||Math.abs(pointer.ty-pointer.y)>.002);
    const needsPaint=!!ctx&&(forcePaint||Math.abs(controller.progress-lastCanvasProgress)>.0002||Math.abs(pointer.x-lastPointerX)>.002||Math.abs(pointer.y-lastPointerY)>.002);
    let deferredPaint=false;
    if(needsPaint){
      if(forcePaint||now-lastPaint>=32){
        lastPaint=now;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
        paintField(reduced?0:controller.progress*1.5);
        forcePaint=false;lastCanvasProgress=controller.progress;lastPointerX=pointer.x;lastPointerY=pointer.y;
      }else deferredPaint=true;
    }
    if(moving||pointerMoving||deferredPaint)requestFrame();else previousFrame=0;
  }
  const heroScene=isHome?mountHeroScene($('#home'),doc,win):null;
  if(win.ResizeObserver&&shell){resizeObserver=new win.ResizeObserver(resize);resizeObserver.observe(shell);resizeObserver.observe(travel);}
  resize();
  if(isHome){
    const start=hashes.indexOf(win.location.hash.slice(1));
    if(start>0)goTo(start,false,true);
    listen(doc,'visibilitychange',()=>{previousFrame=0;if(!doc.hidden){heroScene.measure();syncScroll();forcePaint=true;requestFrame();}});
    listen(win,'pageshow',()=>{heroScene.measure();resize();});
  }else {
    updateFilter(new URL(win.location.href).searchParams.get('category')??'All');
    $('.site-header [data-station="3"]')?.setAttribute('aria-current','page');
  }
  const api={
    controller,
    goTo,
    selectService,
    updateFilter,
    openProject,
    closeProject,
    resize,
    revealIntro:()=>heroScene?.revealIntro?.(),
    snapshot:()=>({station:activeStation,progress:controller.progress,target:controller.target,service:serviceIndex,flipping:serviceFlipping,filter:galleryFilter,projectCount:(isHome?galleryProjects:filterProjects(data.projects,galleryFilter)).length,projectIndex:galleryActive}),
    destroy:()=>{disposed=true;listeners.forEach(remove=>remove());win.cancelAnimationFrame(frameId);resizeObserver?.disconnect();heroScene?.destroy();inlinePlayers.destroy();serviceAnimations.forEach(animation=>animation.cancel());if(dialog.open)closeProject();}
  };
  return api;
}
