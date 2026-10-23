using System.Collections.Generic;
using UnityEngine;
namespace NotebookHeroes
{
 public static class PaperArt
 {
  static readonly Dictionary<string,Sprite> cache=new Dictionary<string,Sprite>();
  public static Sprite Crop(string name,int x,int top,int width,int height){string key=name+":"+x+":"+top+":"+width+":"+height;if(cache.TryGetValue(key,out var found))return found;var t=Resources.Load<Texture2D>("Art/"+name);if(t==null)return null;width=Mathf.Min(width,t.width-x);height=Mathf.Min(height,t.height-top);var s=Sprite.Create(t,new Rect(x,t.height-top-height,width,height),new Vector2(.5f,.5f),100);cache[key]=s;return s;}
  public static Sprite Hero(int id){int[,] b={{20,45,545,475},{565,35,475,485},{1070,130,460,390},{15,545,600,440},{615,550,425,440},{1075,575,445,410},{20,75,490,445},{550,65,485,455},{15,85,835,755},{940,85,825,755}};return Crop(id<6?"heroes-doodle":id<8?"summons-doodle":"blade-gunner",b[id,0],b[id,1],b[id,2],b[id,3]);}
  public static Sprite Enemy(string kind){if(kind=="boss")return Crop("boss-doodle",0,70,1254,1130);return kind=="slime"?Crop("summons-doodle",1070,185,455,335):Crop("summons-doodle",35,535,475,470);}
  public static Sprite Fox(){return Crop("summons-doodle",540,550,480,450);}
  public static Sprite Friend(int id){return Crop("friend-"+id,0,0,420,460);}
  public static Sprite Intro(int n){var t=Resources.Load<Texture2D>("Art/prologue");return Crop("prologue",n%2*(t.width/2),n/2*(t.height/2),t.width/2,t.height/2);}
 }
}
