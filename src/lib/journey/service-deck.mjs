import {deckFrames,servicePose,serviceStackOrder} from './journey-model.mjs';

// One persistent node per service. A flip changes the order, never its content.
export function createServiceDeck(element,services,{reduced=false,onSelect=()=>{}}={}){
  let current=0,target=0,direction=1,running=false,disposed=false,task=null,animations=[];
  if(!element)return {select:()=>Promise.resolve(),move:()=>Promise.resolve(),snapshot:()=>({current,target,running}),destroy(){}};
  const count=services.length,doc=element.ownerDocument;
  const cards=services.map((service,index)=>{
    let card=element.querySelector('[data-service-id="'+index+'"]');
    if(!card){
      card=doc.createElement('article');card.dataset.serviceId=String(index);
      const number=doc.createElement('span');number.className='service-number';
      number.textContent=String(index+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
      const title=doc.createElement('h3');title.textContent=service.name;
      const description=doc.createElement('p');description.textContent=service.description;
      card.append(number,title,description);
    }
    return card;
  });
  function place(index){
    const order=serviceStackOrder(index,count);
    order.forEach((id,slot)=>{
      const card=cards[id];
      card.className='service-card service-'+(slot===0?'current':slot===1?'under':'bottom');
      card.dataset.serviceSlot=String(slot);card.style.transform=servicePose(slot);
      card.setAttribute('aria-hidden',String(slot!==0));
    });
    element.replaceChildren(...order.map(id=>cards[id]));current=index;
  }
  async function transition(next,travelDirection){
    const before=serviceStackOrder(current,count),after=serviceStackOrder(next,count);
    const frames=deckFrames(travelDirection),options={duration:720,easing:'cubic-bezier(.22,.75,.22,1)',fill:'forwards'};
    animations=cards.map((card,id)=>{
      const from=before.indexOf(id),to=after.indexOf(id);
      const path=id===current?frames.outgoing:id===next?frames.incoming:null;
      const keyframes=path?path.map(frame=>({...frame})):[{transform:servicePose(from)},{transform:servicePose(to)}];
      keyframes[0].transform=servicePose(from);keyframes[keyframes.length-1].transform=servicePose(to);
      return card.animate(keyframes,options);
    });
    try{await Promise.all(animations.map(animation=>animation.finished));}catch{}
    if(disposed)return;
    place(next);animations.forEach(animation=>animation.cancel());animations=[];
  }
  function select(index,preferredDirection){
    if(disposed||!count)return Promise.resolve();
    direction=preferredDirection||Math.sign(index-target)||direction;
    target=((index%count)+count)%count;onSelect(target);
    if(reduced||typeof cards[0].animate!=='function'){place(target);return Promise.resolve();}
    if(running)return task;
    if(target===current)return Promise.resolve();
    running=true;element.setAttribute('aria-busy','true');
    task=(async()=>{
      try{while(!disposed&&target!==current)await transition(target,direction);}
      finally{running=false;element.removeAttribute('aria-busy');task=null;}
    })();
    return task;
  }
  place(current);
  return {select,move:step=>select(target+step,Math.sign(step)),snapshot:()=>({current,target,running}),destroy(){disposed=true;animations.forEach(animation=>animation.cancel());}};
}
