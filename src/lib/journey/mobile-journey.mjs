import {clamp,smooth} from './journey-model.mjs';

// Every chapter is a complete fitted view. Scroll moves the camera between
// chapters; it never pans down through a cropped chapter first.
export function createMobileTimeline(contentHeights,height,headerHeight,footerHeight){
  const available=Math.max(1,height-headerHeight-footerHeight-40);
  let cursor=0;
  const chapters=contentHeights.map((contentHeight,index)=>{
    const start=cursor,leave=start+height*.2;
    const end=leave+(index<contentHeights.length-1?height*.82:0);
    cursor=end;
    return {index:index+1,start,leave,end,contentHeight,scale:Math.min(1,available/Math.max(1,contentHeight)),
      anchor:start+height*.06,top:headerHeight+20};
  });
  return {chapters,available,distance:cursor,scrollHeight:cursor+height,
    signature:[height,headerHeight,footerHeight,...contentHeights].join(':')};
}

export function mobileJourneyAtOffset(offset,timeline){
  const position=clamp(offset,0,timeline.distance);
  const chapter=timeline.chapters.find(chapter=>position<=chapter.end)||timeline.chapters.at(-1);
  const traveling=position>chapter.leave&&chapter.end>chapter.leave;
  const fraction=traveling?clamp((position-chapter.leave)/(chapter.end-chapter.leave),0,1):0;
  return {position,chapter:chapter.index,traveling,fraction,
    progress:chapter.index+(traveling?smooth(0,1,fraction):0)};
}

export function remapMobileOffset(offset,before,after){
  const state=mobileJourneyAtOffset(offset,before),old=before.chapters[state.chapter-1],next=after.chapters[state.chapter-1];
  if(state.traveling)return next.leave+(next.end-next.leave)*state.fraction;
  const fraction=clamp((state.position-old.start)/Math.max(1,old.leave-old.start),0,1);
  return next.start+(next.leave-next.start)*fraction;
}
