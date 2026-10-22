// Shared seconds-based timeline: the renderer and turn commit use the same duration.
export const ACTION_SECONDS=1.6;
export const COUNTER_SECONDS=1.25;
export const SKETCH_SECONDS=.65;
export const SKETCH_STAGGER=.45;
export const ENTRANCE_SECONDS=6*SKETCH_STAGGER+SKETCH_SECONDS;
export const ERASE_SECONDS=1.05;
export function removalTimes(before,after){
 return {
  enemies:before.enemies.map((e,i)=>e.hp>0&&after.enemies[i].hp===0?(after.last.enemyHP[i]===0?.70:1.20):null),
  party:before.party.map((p,i)=>p.hp>0&&after.party[i].hp===0?ACTION_SECONDS+.46:null)
 };
}
export function animationDuration(counter,removals){
 const lastRemoval=removals?Math.max(-ERASE_SECONDS,...[...removals.enemies,...removals.party].filter(t=>t!==null)): -ERASE_SECONDS;
 return Math.max(ACTION_SECONDS+(counter?COUNTER_SECONDS:0),lastRemoval+ERASE_SECONDS+.12)*1000;
}
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
