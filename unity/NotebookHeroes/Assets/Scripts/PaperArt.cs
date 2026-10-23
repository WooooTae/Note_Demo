using System.Collections.Generic;
using UnityEngine;
namespace NotebookHeroes
{
 public static class PaperArt
 {
  static readonly Dictionary<string,Sprite> cache=new Dictionary<string,Sprite>();
  // Crop coordinates are measured on the original PNG, never on a resized import.
  public static Rect CropRect(string name,int textureWidth,int textureHeight,float x,float top,float width,float height){var r=AtlasGeometry.Crop(name,textureWidth,textureHeight,x,top,width,height);return new Rect(r.X,r.Y,r.Width,r.Height);}
  public static Sprite Crop(string name,int x,int top,int width,int height){string key=name+":"+x+":"+top+":"+width+":"+height;if(cache.TryGetValue(key,out var found))return found;var t=Resources.Load<Texture2D>("Art/"+name);if(t==null)return null;var rect=CropRect(name,t.width,t.height,x,top,width,height);var s=Sprite.Create(t,rect,new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);cache[key]=s;return s;}
  public static Sprite Desk(){if(cache.TryGetValue("desk",out var found))return found;var t=new Texture2D(256,256,TextureFormat.RGBA32,false);var pixels=new Color[256*256];var random=new System.Random(41);for(int y=0;y<256;y++)for(int x=0;x<256;x++){float grain=(float)random.NextDouble()*.025f+Mathf.Sin(y*2.1f+x*.04f)*.009f;pixels[y*256+x]=new Color(.655f+grain,.602f+grain,.375f+grain);}t.SetPixels(pixels);t.Apply();var sprite=Sprite.Create(t,new Rect(0,0,256,256),new Vector2(.5f,.5f));cache["desk"]=sprite;return sprite;}
  public static Sprite Hero(int id){int[,] b={{20,45,545,475},{565,35,475,485},{1070,130,460,390},{15,545,600,440},{615,550,425,440},{1075,575,445,410},{20,75,490,445},{550,65,485,455},{15,85,835,755},{940,85,825,755}};var sprite=Crop(id<6?"heroes-doodle":id<8?"summons-doodle":"blade-gunner",b[id,0],b[id,1],b[id,2],b[id,3]);if(id==3&&sprite!=null){var points=new[]{new Vector2(0,0),new Vector2(600,0),new Vector2(600,145),new Vector2(475,195),new Vector2(475,440),new Vector2(0,440)};for(int i=0;i<points.Length;i++)points[i]=new Vector2((points[i].x/600-.5f)*sprite.rect.width/100,(.5f-points[i].y/440)*sprite.rect.height/100);sprite.OverrideGeometry(points,new ushort[]{0,1,2,0,2,3,0,3,4,0,4,5});}return sprite;}
  public static Sprite Enemy(string kind){if(kind=="boss")return Crop("boss-doodle",0,70,1254,1130);return kind=="slime"?Crop("summons-doodle",1070,185,455,335):Crop("summons-doodle",35,535,475,470);}
  public static Sprite Fox(){return Crop("summons-doodle",540,550,480,450);}
  public static Sprite Friend(int id){return Crop("friend-"+id,0,0,420,460);}
  public static Sprite Intro(int n){return Crop("prologue",n%2*836,n/2*470,836,470);}
 }
}
