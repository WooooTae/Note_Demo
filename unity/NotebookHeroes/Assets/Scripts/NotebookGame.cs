using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
namespace NotebookHeroes
{
 public class NotebookGame : MonoBehaviour
 {
  Catalog data; Battle battle; Font font; RectTransform root,arena; bool busy,skipSketch; int friend,rosterPage;
  readonly List<int> party=new List<int>{0,1,2,3}; readonly Image[] heroImages=new Image[4],enemyImages=new Image[3];
  readonly Color ink=new Color(.24f,.25f,.22f),paper=new Color(.94f,.94f,.89f),pale=new Color(.87f,.89f,.80f);
  string screen="",notice="",rosterNotice="";float rosterOffset; Material graphite;
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(FindFirstObjectByType<NotebookGame>()==null)new GameObject("Notebook Heroes").AddComponent<NotebookGame>();}
  void Awake()
  {
   data=JsonUtility.FromJson<Catalog>(Resources.Load<TextAsset>("GameData").text);font=Resources.Load<Font>("Art/Gaegu-Regular");
   var shader=Shader.Find("Notebook/Graphite UI");if(shader!=null)graphite=new Material(shader);
   if(FindFirstObjectByType<EventSystem>()==null)new GameObject("UI Event System",typeof(EventSystem),typeof(StandaloneInputModule));
   var canvas=new GameObject("Notebook Canvas",typeof(Canvas),typeof(CanvasScaler),typeof(GraphicRaycaster));canvas.transform.SetParent(transform);canvas.GetComponent<Canvas>().renderMode=RenderMode.ScreenSpaceOverlay;
   var scaler=canvas.GetComponent<CanvasScaler>();scaler.uiScaleMode=CanvasScaler.ScaleMode.ScaleWithScreenSize;scaler.referenceResolution=new Vector2(1600,1000);scaler.screenMatchMode=CanvasScaler.ScreenMatchMode.Expand;
   root=Rect("Notebook Page",canvas.transform,0,0,1600,1000);root.anchorMin=root.anchorMax=new Vector2(.5f,.5f);root.pivot=new Vector2(.5f,.5f);root.anchoredPosition=Vector2.zero;
   if(Camera.main==null){var cam=new GameObject("Paper Camera",typeof(Camera));cam.tag="MainCamera";cam.GetComponent<Camera>().backgroundColor=new Color(.62f,.57f,.36f);cam.GetComponent<Camera>().clearFlags=CameraClearFlags.SolidColor;}
   friend=Mathf.Clamp(PlayerPrefs.GetInt("Friend",0),0,4);Home();
  }
  void Update(){if(screen!="battle"||busy)return;for(int i=0;i<4;i++)if(heroImages[i]!=null&&battle.party[i].hp>0)heroImages[i].rectTransform.localEulerAngles=new Vector3(0,0,battle.party[i].taped?0:Mathf.Sin(Time.unscaledTime*2+i)*1.5f);}
  RectTransform Rect(string name,Transform parent,float x,float y,float w,float h){var g=new GameObject(name,typeof(RectTransform));var rt=g.GetComponent<RectTransform>();rt.SetParent(parent,false);rt.anchorMin=rt.anchorMax=new Vector2(0,1);rt.pivot=new Vector2(0,1);rt.anchoredPosition=new Vector2(x,-y);rt.sizeDelta=new Vector2(w,h);return rt;}
  Image Box(Transform parent,float x,float y,float w,float h,Color color){var rt=Rect("Paper",parent,x,y,w,h);var im=rt.gameObject.AddComponent<Image>();im.color=color;im.raycastTarget=false;return im;}
  Text Label(Transform parent,string value,float x,float y,float w,float h,int size=26,TextAnchor alignment=TextAnchor.MiddleLeft){var rt=Rect(value,parent,x,y,w,h);var t=rt.gameObject.AddComponent<Text>();t.font=font;t.fontSize=size;t.color=ink;t.text=value;t.supportRichText=false;t.alignment=alignment;t.raycastTarget=false;t.horizontalOverflow=HorizontalWrapMode.Wrap;t.verticalOverflow=VerticalWrapMode.Truncate;return t;}
  Button Button(Transform parent,string text,float x,float y,float w,float h,Action action,bool enabled=true,Color? color=null){var im=Box(parent,x,y,w,h,color??pale);im.raycastTarget=true;var b=im.gameObject.AddComponent<Button>();b.targetGraphic=im;b.interactable=enabled;b.onClick.AddListener(()=>action());var colors=b.colors;colors.highlightedColor=new Color(1,.97f,.77f);colors.pressedColor=new Color(.84f,.86f,.69f);colors.disabledColor=new Color(.75f,.75f,.72f,.65f);b.colors=colors;Label(im.transform,text,10,4,w-20,h-8,25,TextAnchor.MiddleCenter);return b;}
  Image Art(Transform parent,Sprite sprite,float x,float y,float w,float h,bool pencil=true){var im=Box(parent,x,y,w,h,Color.white);im.sprite=sprite;im.preserveAspect=true;im.useSpriteMesh=true;if(pencil&&graphite!=null)im.material=graphite;return im;}
  static Color Hex(string s){ColorUtility.TryParseHtmlString(s,out var c);return c;}
  void Page(string name){screen=name;for(int i=root.childCount-1;i>=0;i--){var g=root.GetChild(i).gameObject;g.SetActive(false);Destroy(g);}Array.Clear(heroImages,0,4);Array.Clear(enemyImages,0,3);var backdrop=Box(root,0,0,1600,1000,paper);if(name=="roster"){backdrop.sprite=PaperArt.Desk();backdrop.color=Color.white;return;}for(int y=35;y<1000;y+=35)Box(root,0,y,1600,1,new Color(.71f,.76f,.76f,.35f));Box(root,70,0,2,1000,new Color(.78f,.55f,.51f,.35f));for(int y=35;y<1000;y+=80){Ellipse(root,2,y+10,45,16,ink,3,-.25f);Box(root,44,y+20,6,6,ink);}Label(root,"낙서 용사단  /  NOTEBOOK HEROES",95,18,1200,45,27);Label(root,"아이가 잠든 사이, 우리의 모험은 시작된다.",100,953,1200,32,20);}
  void Heading(string title,string subtitle){Label(root,title,100,83,1350,65,44);Label(root,subtitle,100,145,1350,48,25);}
  void Home()
  {
   busy=false;Page("home");var saved=SaveStore.Read(data);Heading("한 장의 공책, 작은 모험","친구가 없던 아이가 그린 그림들이 밤마다 깨어납니다.");
   Label(root,"낙서\n용사단",140,250,640,230,100);Label(root,"오늘 밤도, 같이 놀자.",150,500,640,55,32);
   for(int i=0;i<4;i++)Art(root,PaperArt.Hero(party[i]),800+i%2*270,260+i/2*240,230,220);
   Button(root,"게임 시작 →",150,610,570,70,()=>{if(saved!=null)Confirm(()=>Intro(0),"새 모험을 시작하면 이전 저장을 덮어씁니다.");else Intro(0);});
   Button(root,"이어하기",150,695,570,65,()=>{battle=SaveStore.Read(data);if(battle!=null){friend=battle.companion;party.Clear();party.AddRange(battle.party.Select(p=>p.id));if(Combat.Advance(data,battle))SaveStore.Write(battle);BattlePage();}else Home();},saved!=null);
   Button(root,"포스트잇 친구 고르기",150,775,570,65,()=>Friends(false,Home));
   Label(root,notice.Length>0?notice:SaveStore.Message,150,855,1200,60,23);notice="";
  }
  void Confirm(Action yes,string question){Page("confirm");Heading("새로운 페이지",question);Button(root,"돌아가기",350,450,380,80,Home);Button(root,"새 모험 시작",850,450,380,80,yes);}
  readonly string[] storyTitles={"늘 혼자였던 아이","연필 끝에서 만난 친구들","모두가 잠든 밤","공책 속 친구들이 깨어납니다"};
  readonly string[] storyLines={"함께 놀 친구가 있다면 좋을 텐데.","용감한 기사도, 신비한 마법사도… 내 친구가 되어줄래?","아이가 잠들자, 종이 넘기는 소리가 들렸습니다.","우리를 그려준 아이의 꿈을, 함께 지키자. 아이는 아직 이 비밀을 모릅니다."};
  void Intro(int n){Page("intro");Heading(storyTitles[n],storyLines[n]);Art(root,PaperArt.Intro(n),230,220,1140,600,false);Button(root,"건너뛰기 →",1200,85,280,60,()=>Roster());if(n>0)Button(root,"← 이전",230,850,280,65,()=>Intro(n-1));Button(root,n==3?"친구 고르기 →":"다음 장면 →",1040,850,330,65,()=>{if(n==3)Roster();else Intro(n+1);});}
  void Stroke(Transform parent,float x,float y,float w,float h,Vector2[] points,Color color,float thickness=1.5f){var rt=Rect("Pencil line",parent,x,y,w,h);var g=rt.gameObject.AddComponent<PencilStroke>();g.color=color;g.points=points;g.thickness=thickness;g.raycastTarget=false;}
  void Ellipse(Transform parent,float x,float y,float w,float h,Color color,float thickness=2,float tilt=0){var points=new Vector2[65];for(int i=0;i<points.Length;i++){float a=i/64f*Mathf.PI*2;float px=Mathf.Cos(a)*w*.48f,py=Mathf.Sin(a)*h*.45f;points[i]=new Vector2(w/2+px,-h/2+py+px*tilt+Mathf.Sin(a*5)*.7f);}Stroke(parent,x,y,w,h,points,color,thickness);}
  string SkillNote(Ability a){string text=a.power>0?(a.area?"적 전체 ":"선택한 적 ")+a.power+" 피해":"";if(a.heal>0)text+="생존 아군 전체 HP "+a.heal+" 회복";if(a.guard!=null)text+=" · "+(a.guard=="party"?"아군 전체":"자신")+" 보호";if(a.summon)text+=" · 정령 3회";if(a.drain)text+=" · 피해의 절반 흡수";return text;}
  void Roster()
  {
   Page("roster");Label(root,"쉬는 시간에 그린, 우리들만의 RPG",100,22,1200,35,24);Label(root,"나의 낙서 용사 도감",100,64,1100,65,46);Label(root,"같이 모험할 친구 4명에게 동그라미를 쳐 주세요.",100,130,1200,42,27);
   Button(root,"← 공책 덮기",1250,55,250,65,Home,true,Hex("#ece7d0"));
   for(int i=0;i<4;i++){Box(root,100+i*353,190,338,55,Hex("#ebe7d6"));Label(root,(i+1)+"번  "+(i<party.Count?data.roles[party[i]].name:"빈 자리"),115+i*353,195,310,44,26);}
   var scrollRoot=Rect("Notebook scroll",root,80,270,1440,565);var scroll=scrollRoot.gameObject.AddComponent<ScrollRect>();scroll.horizontal=false;scroll.vertical=true;scroll.movementType=ScrollRect.MovementType.Clamped;scroll.scrollSensitivity=42;
   var viewport=Rect("Page viewport",scrollRoot,0,0,1416,565);var hit=viewport.gameObject.AddComponent<Image>();hit.color=Color.clear;viewport.gameObject.AddComponent<RectMask2D>();
   var content=Rect("Four cell notebook",viewport,0,0,1416,1120);scroll.viewport=viewport;scroll.content=content;
   Box(content,36,8,1360,1104,new Color(.24f,.23f,.17f,.22f));Box(content,28,0,1360,1104,paper);
   for(int y=32;y<1104;y+=32)Box(content,30,y,1356,1,new Color(.70f,.75f,.75f,.17f));Box(content,79,0,1,1104,new Color(.71f,.51f,.49f,.19f));
   for(int y=28;y<1080;y+=70){Ellipse(content,10,y,46,17,new Color(.34f,.37f,.34f,.85f),3,-.28f);Box(content,52,y+1,6,6,ink);}
   Label(content,"과목 : 상상 / 이름 : 공책 속 친구들",100,12,900,40,23);Label(content,"총 10명 · "+(rosterPage+1)+"쪽",1100,12,235,40,23,TextAnchor.MiddleRight);
   var line=new Color(.45f,.50f,.46f,.45f);Box(content,100,60,1230,1,line);Box(content,715,80,1,970,line);Box(content,100,565,1230,1,line);
   string[] scribbles={"용감함!!","마법 쓸 수 있음","백발백중 ↗","든든한 친구","아프면 불러!","엄청 빠름","여우도 친구야","어둠의 힘…","검 + 마법!","탕! 탕!"};
   int start=rosterPage*4;
   for(int k=0;k<4;k++){
    int id=start+k;float x=100+k%2*615,y=75+k/2*490;
    if(id>=data.roles.Length){Label(content,"다음 친구는\n어떤 모습일까?",x+90,y+120,430,180,39,TextAnchor.MiddleCenter);Label(content,"아직 그리지 않은 페이지",x+90,y+320,430,60,25,TextAnchor.MiddleCenter);continue;}
    var r=data.roles[id];
    var card=Button(content,"",x,y,615,480,()=>{rosterOffset=content.anchoredPosition.y;rosterNotice="";if(party.Contains(id))party.Remove(id);else if(party.Count<4)party.Add(id);else rosterNotice="이미 4명입니다. 바꿀 친구의 동그라미를 먼저 지워 주세요.";Roster();},true,Color.clear);
    Label(card.transform,"No. "+(id+1).ToString("00"),20,10,250,55,37);Label(card.transform,"HP  "+r.hp+" / "+r.hp+"\nMP  "+r.mp+" / "+r.mp+"\n공격  "+r.atk,325,8,255,90,23,TextAnchor.UpperRight);
    Art(card.transform,PaperArt.Hero(id),200,96,205,170);var note=Label(card.transform,scribbles[id],415,195,175,60,22,TextAnchor.MiddleCenter);note.rectTransform.localEulerAngles=new Vector3(0,0,8);
    Label(card.transform,"이름 :",20,270,85,42,22);Label(card.transform,r.name,105,268,340,46,33);
    int order=party.IndexOf(id);Label(card.transform,order>=0?(order+1)+"번 동료":"○ 골라주기",435,273,160,40,22,TextAnchor.MiddleRight);if(order>=0){float w=Mathf.Min(340,r.name.Length*26+35);Ellipse(card.transform,96,270,w,43,new Color(.30f,.38f,.45f,.82f),2.1f,.015f);Ellipse(card.transform,98,272,w+3,40,new Color(.30f,.38f,.45f,.35f),1.1f,-.01f);}
    Box(card.transform,20,316,575,1,line);Label(card.transform,r.tag,20,320,575,32,22);
    for(int a=0;a<3;a++){var ability=r.skills[a];Label(card.transform,(a+1)+". "+ability.name+"   MP "+ability.cost,20,351+a*42,570,27,23);Label(card.transform,SkillNote(ability),42,376+a*42,550,22,19);}
   }
   Box(content,100,1057,1230,1,line);Label(content,"※ 먼저 고른 친구부터 행동! 동그라미를 다시 누르면 취소.",100,1065,1060,35,22);Label(content,"— "+(rosterPage+1)+" —",1200,1065,120,35,24,TextAnchor.MiddleCenter);
   var track=Box(scrollRoot,1420,0,12,565,new Color(.38f,.36f,.23f,.18f));track.raycastTarget=true;var bar=track.gameObject.AddComponent<Scrollbar>();var handle=Box(track.transform,0,0,12,100,new Color(.40f,.44f,.35f,.65f));handle.raycastTarget=true;handle.rectTransform.pivot=new Vector2(.5f,.5f);handle.rectTransform.anchorMin=Vector2.zero;handle.rectTransform.anchorMax=Vector2.one;handle.rectTransform.sizeDelta=Vector2.zero;handle.rectTransform.anchoredPosition=Vector2.zero;bar.handleRect=handle.rectTransform;bar.targetGraphic=handle;bar.direction=Scrollbar.Direction.BottomToTop;scroll.verticalScrollbar=bar;
   Canvas.ForceUpdateCanvases();content.anchoredPosition=new Vector2(0,Mathf.Clamp(rosterOffset,0,555));
   Label(root,"마우스 휠 또는 드래그로 아래 칸 보기",100,842,800,35,22);Button(root,"← 앞장",100,885,190,55,()=>{rosterPage--;rosterOffset=0;Roster();},rosterPage>0,Hex("#ebe7d6"));Label(root,(rosterPage+1)+" / 3쪽",310,885,180,55,26,TextAnchor.MiddleCenter);Button(root,"뒷장 →",510,885,190,55,()=>{rosterPage++;rosterOffset=0;Roster();},rosterPage<2,Hex("#ebe7d6"));
   Label(root,"우리 용사단  "+party.Count+" / 4",790,880,330,45,29);Button(root,"포스트잇 친구 선택 →",1130,882,370,65,()=>Friends(false,StartBattle),party.Count==4,Hex("#e6e7d4"));Label(root,rosterNotice.Length>0?rosterNotice:"페이지를 넘겨도 골라둔 친구는 그대로예요.",100,950,1360,35,23);
  }
  void Note(Transform parent,int id,float x,float y,float w,float h){var f=data.companions[id];var note=Box(parent,x,y,w,h,Hex(f.color));Box(note.transform,0,0,w,20,new Color(.6f,.5f,.2f,.15f));var tape=Box(note.transform,w*.44f,-15,30,50,Hex("#78b6bf"));tape.rectTransform.localEulerAngles=new Vector3(0,0,-8);Art(note.transform,PaperArt.Friend(id),10,30,w-20,h-90,false);Label(note.transform,f.name,10,h-62,w-20,48,Mathf.RoundToInt(w/10),TextAnchor.MiddleCenter);}
  void Friends(bool inBattle,Action done)
  {
   Page("friends");Heading("포스트잇 친구 고르기","한 명을 데려가세요. 전투마다 한 번 · MP 0 · 현재 용사의 행동 한 번을 사용합니다.");
   for(int i=0;i<5;i++){int id=i;float x=100+i*290;var f=data.companions[i];Button(root,"",x,235,270,390,()=>{friend=id;Friends(inBattle,done);},true,paper);Note(root,id,x+8,245,254,360);Label(root,f.skill.name,x,650,270,45,27,TextAnchor.MiddleCenter);Label(root,f.detail,x,700,270,90,24,TextAnchor.UpperCenter);Label(root,friend==id?"○ 같이 가는 친구":"",x,790,270,45,28,TextAnchor.MiddleCenter);}
   Button(root,"이 친구로 정하기 →",1030,865,450,65,()=>{PlayerPrefs.SetInt("Friend",friend);PlayerPrefs.Save();if(inBattle){battle.companion=friend;SaveStore.Write(battle);}done();});
   Button(root,"← 돌아가기",1200,85,280,60,()=>{if(inBattle){friend=battle.companion;BattlePage();}else Home();});
  }
  void StartBattle(){battle=Combat.Create(data,party.ToArray(),friend);SaveStore.Write(battle);StartCoroutine(Entrance());}
  void BattlePage()
  {
   Page("battle");Heading("1-"+(battle.encounter+1)+" · "+data.encounters[battle.encounter].name,"일반 몬스터 → 에픽 몬스터 → 보스  /  TURN "+battle.round+"  /  전투 사이 자동 회복");
   Button(root,"← 공책으로",1250,85,250,55,Home,!busy);Label(root,Combat.Intent(data,battle),100,195,1400,50,24);
   arena=Rect("Battle Arena",root,100,255,1400,365);Box(arena,0,0,1400,365,new Color(.91f,.92f,.86f,.5f));
   for(int i=0;i<4;i++){var h=battle.party[i];float x=15+i*190;heroImages[i]=Art(arena,PaperArt.Hero(h.id),x,125,180,220);heroImages[i].color=new Color(1,1,1,h.hp>0?1:0);if(h.taped&&h.hp>0)Tape(arena,x+10,190);if(h.guard&&h.hp>0)Label(arena,"보호",x,80,180,50,25,TextAnchor.MiddleCenter);}
   for(int i=0;i<3;i++){int target=i;var e=battle.enemies[i];float x=810+i*190;float h=i==0?300:200;enemyImages[i]=Art(arena,PaperArt.Enemy(e.kind),x,340-h,190,h);enemyImages[i].color=new Color(1,1,1,e.hp>0?1:0);Button(arena,e.name+"\n"+e.hp+" / "+e.maxHp,x,0,185,65,()=>{battle.target=target;SaveStore.Write(battle);BattlePage();},!busy&&e.hp>0&&battle.status=="playing",battle.target==i?pale:paper);}
   if(battle.summonRounds>0){Art(arena,PaperArt.Fox(),630,260,100,85);Label(arena,"정령 "+battle.summonRounds+"회",630,220,160,35,22);}
   for(int i=0;i<4;i++){var h=battle.party[i];var r=data.roles[h.id];float x=100+i*260;Box(root,x,640,250,95,i==battle.turn?pale:paper);Label(root,r.name+(h.taped?" · 봉인":""),x+10,643,235,35,25);Label(root,"HP "+h.hp+" / "+r.hp+"   MP "+h.mp,x+10,680,235,40,22);}
   Note(root,battle.companion,1180,650,120,170);Label(root,data.companions[battle.companion].detail,1320,640,180,90,22);Button(root,battle.companionUsed?"소환 완료":"포스트잇 소환",1310,740,195,60,()=>Perform("companion"),CanAct()&&!battle.companionUsed&&!battle.party[battle.turn].taped);Button(root,"친구 바꾸기",1310,810,195,50,()=>{friend=battle.companion;Friends(true,BattlePage);},CanAct()&&!battle.companionUsed);
   if(battle.status=="playing"){
    var h=battle.party[battle.turn];var r=data.roles[h.id];Label(root,r.name+"의 차례"+(h.taped?" · 테이프를 떼면 차례가 넘어가요":""),100,750,1000,45,30);
    if(h.taped)Button(root,"테이프 떼기 · 행동 1회 소모",100,815,1000,65,()=>Perform("skip"),!busy);
    else {Button(root,"공격\nMP 0",100,810,170,75,()=>Perform("attack"),!busy);for(int i=0;i<3;i++){int slot=i;var a=r.skills[i];Button(root,a.name+"\nMP "+a.cost,280+i*220,810,210,75,()=>Perform("skill",slot),!busy&&h.mp>=a.cost);}Button(root,"방어\nMP +5",950,810,150,75,()=>Perform("guard"),!busy);}
   }else if(battle.status=="victory"||battle.status=="defeat"){Label(root,battle.status=="victory"?"1스테이지 클리어! 별 조각 30개":"낙서들이 잠들었어요.",100,750,1000,50,38);Button(root,"같은 친구들과 다시 도전",100,815,1000,65,()=>{friend=battle.companion;party.Clear();party.AddRange(battle.party.Select(p=>p.id));StartBattle();},!busy);}
   Label(root,battle.log.LastOrDefault()??"",100,895,1050,45,23);Label(root,SaveStore.Message,1150,895,355,45,18);
  }
  bool CanAct(){return !busy&&battle.status=="playing";}
  void Tape(Transform parent,float x,float y){foreach(float angle in new[]{25f,-25f}){var t=Box(parent,x,y,160,28,new Color(.82f,.73f,.44f,.72f));t.rectTransform.localEulerAngles=new Vector3(0,0,angle);}}
  void Perform(string action,int skill=0){if(!CanAct())return;var next=battle.Copy();var outcome=Combat.Act(data,next,action,skill);if(outcome!=null)StartCoroutine(AnimateAction(next,outcome));}
  IEnumerator Entrance()
  {
   busy=true;skipSketch=false;BattlePage();Button(root,"등장 연출 건너뛰기 →",1050,195,450,50,()=>skipSketch=true);
   var images=heroImages.Concat(enemyImages).Where(im=>im!=null&&im.color.a>0).ToArray();foreach(var im in images){im.type=Image.Type.Filled;im.fillMethod=Image.FillMethod.Horizontal;im.fillAmount=0;}
   var pencil=Label(arena,"연필 /",0,0,170,50,35);
   foreach(var im in images){for(float t=0;t<.32f&&!skipSketch;t+=Time.unscaledDeltaTime){im.fillAmount=t/.32f;pencil.rectTransform.anchoredPosition=im.rectTransform.anchoredPosition+new Vector2(im.rectTransform.rect.width*im.fillAmount,-40);yield return null;}im.fillAmount=1;}
   busy=false;BattlePage();
  }
  IEnumerator AnimateAction(Battle next,Outcome o)
  {
   busy=true;BattlePage();var actor=heroImages[o.actor];var start=actor.rectTransform.anchoredPosition;bool leap=o.action=="attack"||o.action=="skill"&&o.effect!="heal"&&o.effect!="magic";
   if(o.action=="companion")Note(arena,battle.companion,500,30,210,260);
   var title=Label(arena,o.name+"!",350,0,650,60,38,TextAnchor.MiddleCenter);
   for(float t=0;t<.35f;t+=Time.unscaledDeltaTime){if(leap)actor.rectTransform.anchoredPosition=start+new Vector2(Mathf.Sin(t/.7f*Mathf.PI)*120,Mathf.Sin(t/.35f*Mathf.PI)*25);yield return null;}
   Color effect=Hex(data.roles[battle.party[o.actor].id].color);if(o.action=="companion")effect=Hex(data.companions[battle.companion].color);
   for(int i=0;i<3;i++)if(o.damage[i]>0){var im=enemyImages[i];Label(arena,"−"+o.damage[i],810+i*190,85,180,65,48,TextAnchor.MiddleCenter).color=effect;Burst(arena,880+i*190,180,effect);}
   for(int i=0;i<4;i++)if(o.healing[i]>0)Label(arena,"+"+o.healing[i],15+i*190,75,180,65,45,TextAnchor.MiddleCenter).color=Hex("#518355");
   if(o.action=="guard"||o.effect=="shield")Label(arena,"보호",100,50,650,65,40,TextAnchor.MiddleCenter);
   yield return new WaitForSecondsRealtime(.4f);if(actor!=null)actor.rectTransform.anchoredPosition=start;
   if(o.supportTarget>=0){Art(arena,PaperArt.Fox(),740+o.supportTarget*190,190,130,130);Label(arena,"별여우 −"+o.supportDamage,700,120,600,50,35);yield return new WaitForSecondsRealtime(.4f);}
   if(o.counter){title.text="몬스터 반격";foreach(var hit in o.strikes)Label(arena,"−"+hit.damage,15+hit.target*190,110+hit.enemy*38,180,50,35,TextAnchor.MiddleCenter).color=Hex("#a34c54");if(o.tapeTarget>=0){if(!o.tapeBlocked)Tape(arena,25+o.tapeTarget*190,190);title.text=o.tapeBlocked?"보호로 테이프를 막았다!":"테이프 봉인!";}yield return new WaitForSecondsRealtime(.65f);}
   var dead=new List<Image>();for(int i=0;i<3;i++)if(battle.enemies[i].hp>0&&next.enemies[i].hp==0)dead.Add(enemyImages[i]);for(int i=0;i<4;i++)if(battle.party[i].hp>0&&next.party[i].hp==0)dead.Add(heroImages[i]);
   if(dead.Count>0){var eraser=Label(arena,"[ 지우개 ]",0,0,170,45,30);foreach(var im in dead){for(float t=0;t<.25f;t+=Time.unscaledDeltaTime){im.color=new Color(1,1,1,1-t/.25f);eraser.rectTransform.anchoredPosition=im.rectTransform.anchoredPosition+new Vector2(Mathf.Sin(t*60)*25,-90);yield return null;}im.color=Color.clear;}}
   battle=next;SaveStore.Write(battle);busy=false;if(Combat.Advance(data,battle)){SaveStore.Write(battle);yield return Entrance();}else BattlePage();
  }
  void Burst(Transform parent,float x,float y,Color color){for(int i=0;i<12;i++){float a=i*Mathf.PI/6;var streak=Box(parent,x+Mathf.Cos(a)*45,y+Mathf.Sin(a)*45,70,5,color);streak.rectTransform.localEulerAngles=new Vector3(0,0,-i*30);}Label(parent,"✦",x-45,y-45,90,90,75,TextAnchor.MiddleCenter).color=Color.white;}
 }
}
