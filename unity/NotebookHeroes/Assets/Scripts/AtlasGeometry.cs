using System;
namespace NotebookHeroes
{
 public struct AtlasSize { public float Width,Height; public AtlasSize(float width,float height){Width=width;Height=height;} }
 public struct AtlasRect { public float X,Y,Width,Height; public AtlasRect(float x,float y,float width,float height){X=x;Y=y;Width=width;Height=height;} }
 public static class AtlasGeometry
 {
  public static AtlasSize SourceSize(string name){switch(name){case "heroes-doodle":case "summons-doodle":return new AtlasSize(1536,1024);case "blade-gunner":return new AtlasSize(1774,887);case "boss-doodle":return new AtlasSize(1254,1254);case "prologue":return new AtlasSize(1672,941);case "friend-0":case "friend-1":case "friend-2":case "friend-3":case "friend-4":return new AtlasSize(420,460);default:throw new ArgumentException("Unknown source atlas: "+name);}}
  public static AtlasRect Crop(string name,int textureWidth,int textureHeight,float x,float top,float width,float height){var source=SourceSize(name);if(textureWidth<=0||textureHeight<=0||x<0||top<0||width<=0||height<=0||x+width>source.Width||top+height>source.Height)throw new ArgumentOutOfRangeException("Invalid atlas crop");float sx=textureWidth/source.Width,sy=textureHeight/source.Height;return new AtlasRect(x*sx,(source.Height-top-height)*sy,width*sx,height*sy);}
 }
}
