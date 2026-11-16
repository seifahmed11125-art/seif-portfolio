export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const stations=[0,.8,-1.05,.72,.05];
export function cameraAt(progress){
  const p=clamp(progress,0,4),i=Math.min(3,Math.floor(p)),t=p-i;
  const eased=t*t*(3-2*t);
  return {z:p*58,x:stations[i]+(stations[i+1]-stations[i])*eased,y:Math.sin(p*Math.PI)*.14};
}
export function stationPose(index,progress,width=1024,height=780){
  const camera=cameraAt(progress),distance=progress-index;
  const z=distance*Math.min(width*.88,980);
  const x=(stations[index]-camera.x)*width*.49;
  const y=-camera.y*height*.16;
  const opacity=distance<0?smooth(-.92,-.04,distance):1-smooth(.08,.69,distance);
  return {x,y,z,rotation:(camera.x-stations[index])*14,opacity,
    scale:1400/(1400-z),blur:(1-opacity)*4,visible:opacity>.008};
}
export class JourneyController{
  constructor(progress=0,maxSpeed=.95){this.progress=clamp(progress,0,4);this.target=this.progress;this.velocity=0;this.direction=1;this.maxSpeed=maxSpeed;}
  goTo(index){this.target=clamp(index,0,4);if(Math.abs(this.target-this.progress)>.001)this.direction=Math.sign(this.target-this.progress);}
  nudge(delta){if(!delta)return;this.direction=Math.sign(delta);this.target=clamp(this.target+delta,0,4);}
  settle(direction=this.direction){this.goTo(direction>0?Math.ceil(this.target-.001):Math.floor(this.target+.001));}
  advance(delta){
    const dt=clamp(delta,.001,.032),distance=this.target-this.progress;
    const acceleration=90*distance-19*this.velocity;
    this.velocity=clamp(this.velocity+acceleration*dt,-this.maxSpeed,this.maxSpeed);
    const next=this.progress+this.velocity*dt;
    if((this.target-this.progress)*(this.target-next)<0){this.progress=this.target;this.velocity=0;}
    else this.progress=clamp(next,0,4);
    if(Math.abs(this.target-this.progress)<.0002&&Math.abs(this.velocity)<.002){this.progress=this.target;this.velocity=0;}
    return this.progress;
  }
}
export function projectAspect(project){return project.category==='AI Videos'?'16 / 9':'4 / 5';}
export function filterProjects(projects,category='All',limit){
  const selected=category==='All'?projects:projects.filter(project=>project.category===category);
  return typeof limit==='number'?selected.slice(0,limit):selected;
}
// A short reading plateau precedes each flight. Native scrolling reverses this
// same timeline; it never starts a separate entrance/exit animation.
export function journeyAtOffset(offset,height){
  const units=Math.max(0,offset)/Math.max(1,height);
  const chapter=Math.min(3,Math.floor(units/1.2));
  return Math.min(4,1+chapter+smooth(.28,1.2,units-chapter*1.2));
}
export function stationOffset(index,height){return (clamp(index,1,4)-1)*1.2*height+.14*height;}
export function galleryOffset(viewport,content,left,cardWidth){
  return clamp(viewport/2-left-cardWidth/2,Math.min(0,viewport-content),0);
}
export function deckFrames(direction=1){
  const d=direction<0?-1:1;
  return {
    outgoing:[
      {transform:'translate3d(0,0,2px) rotateZ(0deg)',offset:0},
      {transform:'translate3d('+(d*106)+'%,-9%,65px) rotateZ('+(d*9)+'deg) rotateY('+(-d*12)+'deg)',offset:.43},
      {transform:'translate3d('+(d*106)+'%,-5%,-65px) rotateZ('+(d*6)+'deg)',offset:.65},
      {transform:'translate3d(32px,-24px,-64px) rotateZ(3deg)',offset:1}
    ],
    incoming:[
      {transform:'translate3d(16px,-12px,-28px) rotateZ(1.5deg)',offset:0},
      {transform:'translate3d(-2px,3px,8px) rotateZ(-.5deg)',offset:.72},
      {transform:'translate3d(0,0,2px) rotateZ(0deg)',offset:1}
    ],
    bottom:[{transform:'translate3d(32px,-24px,-64px) rotateZ(3deg)'},{transform:'translate3d(16px,-12px,-28px) rotateZ(1.5deg)'}]
  };
}
