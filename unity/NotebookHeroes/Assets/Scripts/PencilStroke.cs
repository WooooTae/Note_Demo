using UnityEngine;
using UnityEngine.UI;
namespace NotebookHeroes
{
 // Geometry instead of font symbols: bindings and selection circles never become missing glyphs.
 public class PencilStroke : MaskableGraphic
 {
  public Vector2[] points=new Vector2[0]; public float thickness=2;
  protected override void OnPopulateMesh(VertexHelper vh){vh.Clear();for(int i=1;i<points.Length;i++){Vector2 a=points[i-1],b=points[i],delta=b-a;if(delta.sqrMagnitude<.001f)continue;Vector2 normal=new Vector2(-delta.y,delta.x).normalized*thickness*.5f;int start=vh.currentVertCount;foreach(var point in new[]{a+normal,a-normal,b-normal,b+normal}){var v=UIVertex.simpleVert;v.position=point;v.color=color;vh.AddVert(v);}vh.AddTriangle(start,start+1,start+2);vh.AddTriangle(start,start+2,start+3);}}
 }
}
