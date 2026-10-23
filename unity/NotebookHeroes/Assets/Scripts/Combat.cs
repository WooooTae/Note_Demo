using System;
using System.Linq;
using System.Collections.Generic;
namespace NotebookHeroes
{
 [Serializable] public class Ability { public string name,effect,guard; public int cost,power,heal; public bool area,summon,drain; }
 [Serializable] public class Role { public int id,hp,mp,atk; public string name,color,tag; public Ability[] skills; }
 [Serializable] public class Enemy { public int id,hp,maxHp,attack,heavy; public string name,kind,style; public Enemy Copy(){return (Enemy)MemberwiseClone();} }
 [Serializable] public class Encounter { public string name,subtitle; public Enemy[] enemies; }
 [Serializable] public class Friend { public int id; public string name,title,detail,color; public Ability skill; }
 [Serializable] public class Catalog { public Role[] roles; public Encounter[] encounters; public Friend[] companions; }
 [Serializable] public class Hero { public int id,hp,mp; public bool guard,taped; public Hero Copy(){return (Hero)MemberwiseClone();} }
 [Serializable] public class Battle
 {
  public int encounter,turn,round=1,target,companion,summonRounds;
  public bool companionUsed;
  public string status="playing";
  public Hero[] party; public Enemy[] enemies; public List<string> log=new List<string>();
  public Battle Copy(){var b=(Battle)MemberwiseClone();b.party=party.Select(h=>h.Copy()).ToArray();b.enemies=enemies.Select(e=>e.Copy()).ToArray();b.log=new List<string>(log);return b;}
 }
 public class Hit { public int enemy,target,damage; public Hit(int e,int t,int d){enemy=e;target=t;damage=d;} }
 public class Outcome
 {
  public int actor,target,tapeTarget=-1,supportTarget=-1,supportDamage;
  public bool counter,tapeBlocked; public string action,name,effect;
  public int[] damage=new int[3],healing=new int[4]; public List<Hit> strikes=new List<Hit>();
 }
 public static class Combat
 {
  public static bool ValidParty(int[] ids,Catalog c){return ids!=null&&ids.Length==4&&ids.Distinct().Count()==4&&ids.All(i=>i>=0&&i<c.roles.Length);}
  public static Battle Create(Catalog c,int[] ids,int companion=0,int stage=0)
  {
   if(!ValidParty(ids,c)||stage<0||stage>=c.encounters.Length||companion<0||companion>=c.companions.Length)throw new ArgumentException("잘못된 파티 또는 구간");
   var b=new Battle{encounter=stage,companion=companion,party=ids.Select(i=>new Hero{id=i,hp=c.roles[i].hp,mp=c.roles[i].mp}).ToArray(),enemies=c.encounters[stage].enemies.Select(e=>e.Copy()).ToArray()};
   b.log.Add("1-"+(stage+1)+" · "+c.encounters[stage].name);return b;
  }
  public static int TapeTarget(Battle b){if(b.encounter!=2||b.enemies[0].hp<=0||b.round%3!=2)return -1;int first=(b.round/3+1)%4;for(int i=0;i<4;i++){int n=(first+i)%4;if(b.party[n].hp>0)return n;}return -1;}
  public static int EnemyDamage(Battle b,int n){var e=b.enemies[n];return (b.round%3==0?e.heavy:e.attack)+(b.encounter==2&&n==0&&e.hp<=e.maxHp/2?4:0);}
  public static string Intent(Catalog c,Battle b){var texts=new List<string>();for(int n=0;n<3;n++){var e=b.enemies[n];if(e.hp<=0)continue;int t=TapeTarget(b);texts.Add(n==0&&t>=0?"테이프 → "+c.roles[b.party[t].id].name+" (방어/보호로 막기)":e.name+" · "+(e.style=="all"?"전체 ":"1명 ")+EnemyDamage(b,n));}return string.Join(" / ",texts);}
  static bool Finish(Battle b){if(b.enemies.Any(e=>e.hp>0))return false;b.status=b.encounter<2?"cleared":"victory";b.log.Add(b.status=="cleared"?"구간 돌파! 회복 후 다음 전투로":"1스테이지 클리어! 별 조각 30개");return true;}
  public static bool Advance(Catalog c,Battle b)
  {
   if(b.status!="cleared"||b.encounter>=2||b.enemies.Any(e=>e.hp>0))return false;
   var next=Create(c,b.party.Select(h=>h.id).ToArray(),b.companion,b.encounter+1);
   for(int i=0;i<4;i++){var r=c.roles[b.party[i].id];next.party[i].hp=b.party[i].hp>0?Math.Min(r.hp,b.party[i].hp+(int)Math.Ceiling(r.hp*.35)):(int)Math.Ceiling(r.hp*.25);next.party[i].mp=Math.Min(r.mp,b.party[i].mp+14);}
   b.party=next.party;b.enemies=next.enemies;b.encounter=next.encounter;b.turn=0;b.round=1;b.target=0;b.status="playing";b.summonRounds=0;b.companionUsed=false;b.log.Add("HP 35% · MP 14 회복 / "+c.encounters[b.encounter].name);return true;
  }
  public static Outcome Act(Catalog c,Battle b,string action,int skill=0)
  {
   if(b.status!="playing"||!new[]{"attack","skill","guard","skip","companion"}.Contains(action)||b.turn<0||b.turn>3)return null;
   var h=b.party[b.turn];var r=c.roles[h.id];if(h.hp<=0||(h.taped?action!="skip":action=="skip"))return null;
   Ability a=null;
   if(action=="skill"){if(skill<0||skill>=r.skills.Length)return null;a=r.skills[skill];if(h.mp<a.cost)return null;}
   if(action=="companion"){if(b.companionUsed)return null;a=c.companions[b.companion].skill;}
   if(b.enemies[b.target].hp<=0)b.target=Array.FindIndex(b.enemies,e=>e.hp>0);if(b.target<0)return null;
   var o=new Outcome{actor=b.turn,target=b.target,action=action,effect=a!=null?a.effect:r.skills[0].effect,name=a!=null?a.name:action=="guard"?"방어":action=="skip"?"테이프 떼기":"기본 공격"};
   if(action=="skip")h.taped=false;
   else if(action=="guard"){h.guard=true;h.mp=Math.Min(r.mp,h.mp+5);}
   else
   {
    if(action=="companion")b.companionUsed=true;
    if(a!=null)h.mp-=a.cost;
    int power=a!=null?a.power:r.atk;
    for(int i=0;i<3;i++)if(b.enemies[i].hp>0&&(i==b.target||(a!=null&&a.area))){o.damage[i]=Math.Min(power,b.enemies[i].hp);b.enemies[i].hp-=o.damage[i];}
    if(a!=null){for(int i=0;i<4;i++)if(b.party[i].hp>0){var p=b.party[i];o.healing[i]=Math.Min(a.heal,c.roles[p.id].hp-p.hp);p.hp+=o.healing[i];if(a.guard=="party")p.guard=true;}
     if(a.guard=="self")h.guard=true;if(a.summon)b.summonRounds=3;if(a.drain){o.healing[b.turn]=Math.Min(o.damage.Sum()/2,r.hp-h.hp);h.hp+=o.healing[b.turn];}}
   }
   b.log.Add((action=="companion"?c.companions[b.companion].name:r.name)+" · "+o.name+" / 피해 "+o.damage.Sum()+" · 회복 "+o.healing.Sum());
   if(Finish(b))return o;
   int next=Array.FindIndex(b.party,b.turn+1,p=>p.hp>0);
   if(next==-1)
   {
    if(b.summonRounds>0&&b.party.Any(p=>p.id==6&&p.hp>0)){
     int t=b.enemies[b.target].hp>0?b.target:Array.FindIndex(b.enemies,e=>e.hp>0);o.supportTarget=t;o.supportDamage=Math.Min(18,b.enemies[t].hp);b.enemies[t].hp-=o.supportDamage;b.summonRounds--;b.log.Add("별여우 지원 · "+o.supportDamage+" 피해");if(Finish(b))return o;}
    o.counter=true;
    for(int n=0;n<3;n++){
     if(b.enemies[n].hp<=0)continue;int tape=TapeTarget(b);
     if(n==0&&tape>=0){o.tapeTarget=tape;o.tapeBlocked=b.party[tape].guard;if(!o.tapeBlocked)b.party[tape].taped=true;b.log.Add(o.tapeBlocked?"보호로 테이프를 막았다!":"테이프 봉인 · "+c.roles[b.party[tape].id].name);continue;}
     int[] living=Enumerable.Range(0,4).Where(i=>b.party[i].hp>0).ToArray();if(living.Length==0)break;
     int[] victims=b.enemies[n].style=="all"?living:new[]{living[(b.round-1+Math.Max(0,n-1))%living.Length]};
     foreach(int i in victims){var p=b.party[i];int hit=Math.Min(p.hp,(int)Math.Ceiling(EnemyDamage(b,n)*(p.guard?.35:1)));p.hp-=hit;o.strikes.Add(new Hit(n,i,hit));}
    }
    foreach(var p in b.party){p.guard=false;if(p.hp==0)p.taped=false;}
    b.round++;next=Array.FindIndex(b.party,p=>p.hp>0);if(!b.party.Any(p=>p.id==6&&p.hp>0))b.summonRounds=0;
    if(next==-1){b.status="defeat";b.log.Add("낙서들이 잠들었다. 다시 페이지를 펼쳐보자.");}
   }
   if(b.enemies[b.target].hp==0)b.target=Array.FindIndex(b.enemies,e=>e.hp>0);
   b.turn=next;b.log=b.log.Skip(Math.Max(0,b.log.Count-40)).ToList();return o;
  }
  public static bool Validate(Catalog c,Battle b)
  {
   if(b==null||b.party==null||!ValidParty(b.party.Select(p=>p==null?-1:p.id).ToArray(),c)||b.encounter<0||b.encounter>2||b.round<1||b.round>100000||b.companion<0||b.companion>4||b.enemies==null||b.enemies.Length!=3||b.log==null)return false;
   foreach(var h in b.party){var r=c.roles[h.id];if(h.hp<0||h.hp>r.hp||h.mp<0||h.mp>r.mp||h.taped&&(h.hp==0||b.encounter!=2))return false;}
   for(int i=0;i<3;i++){var e=b.enemies[i];var d=c.encounters[b.encounter].enemies[i];if(e==null||e.id!=i||e.hp<0||e.hp>d.hp)return false;}
   if(b.summonRounds<0||b.summonRounds>3||b.summonRounds>0&&!b.party.Any(h=>h.id==6&&h.hp>0))return false;
   bool alive=b.party.Any(h=>h.hp>0),enemy=b.enemies.Any(e=>e.hp>0);
   if(b.status=="playing")return alive&&enemy&&b.turn>=0&&b.turn<4&&b.party[b.turn].hp>0&&b.target>=0&&b.target<3&&b.enemies[b.target].hp>0;
   if(b.status=="cleared")return alive&&!enemy&&b.encounter<2;
   if(b.status=="victory")return alive&&!enemy&&b.encounter==2;
   return b.status=="defeat"&&!alive&&enemy;
  }
  public static void RestoreDefinitions(Catalog c,Battle b){for(int i=0;i<3;i++){int hp=b.enemies[i].hp;b.enemies[i]=c.encounters[b.encounter].enemies[i].Copy();b.enemies[i].hp=hp;}b.log=b.log.Where(t=>t!=null).Select(t=>t.Length>200?t.Substring(0,200):t).Take(40).ToList();}
 }
}
