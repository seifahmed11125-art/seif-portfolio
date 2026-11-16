// Keep this breakpoint in sync with journey-mobile.css.
export const MOBILE_LAYOUT_QUERY='(max-width: 900px), (max-width: 1100px) and (pointer: coarse)';
export const SHORT_LANDSCAPE_QUERY='(max-height: 560px) and (orientation: landscape)';

export function nativeStationAt(scrollY,offsets,height){
  const marker=scrollY+height*.35;
  let selected=0;
  for(let index=1;index<offsets.length;index++)if(marker>=offsets[index])selected=index;
  return selected;
}

export function nativeGalleryOffset(left,viewportWidth,contentWidth){
  return Math.max(0,Math.min(left,contentWidth-viewportWidth));
}

export function nativeGalleryIndex(scrollLeft,viewportWidth,contentWidth,cards,preferred=0){
  let selected=cards[preferred]?preferred:0;
  let distance=cards[selected]?Math.abs(scrollLeft-nativeGalleryOffset(cards[selected].offsetLeft,viewportWidth,contentWidth)):Infinity;
  cards.forEach((card,index)=>{
    const next=Math.abs(scrollLeft-nativeGalleryOffset(card.offsetLeft,viewportWidth,contentWidth));
    if(next<distance-.5){distance=next;selected=index;}
  });
  return selected;
}
