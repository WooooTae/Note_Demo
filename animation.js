// Shared seconds-based timeline: the renderer and turn commit use the same duration.
export const ACTION_SECONDS=1.6;
export const COUNTER_SECONDS=1.25;
export function animationDuration(counter){return (ACTION_SECONDS+(counter?COUNTER_SECONDS:0))*1000;}
export function actionPose(seconds,kind,action='skill'){
 const bounded=(v)=>Math.max(0,Math.min(1,v));
 const smooth=v=>{v=bounded(v);return v*v*(3-2*v);};
 const elapsed=Math.max(0,seconds);
 // Freeze the action pose for 80 ms on contact; the impact particles keep playing.
 const t=elapsed>=.64&&elapsed<.72?.64:elapsed>=.72?elapsed-.08:elapsed;
 const wind=Math.sin(bounded(t/.26)*Math.PI/2)*(1-smooth((t-.26)/.2));
 const reach=smooth((t-.26)/.26)*(1-smooth((t-.95)/.43));
 const melee=['fire','protect','rogue'].includes(kind)&&action!=='guard';
 return {t,wind,reach:melee?reach:0,swing:smooth((t-.43)/.18)*(1-smooth((t-.82)/.2)),returning:t>.95,impact:elapsed>=.60&&elapsed<1.05,hitStop:elapsed>=.64&&elapsed<.72,done:elapsed>=ACTION_SECONDS};
}
