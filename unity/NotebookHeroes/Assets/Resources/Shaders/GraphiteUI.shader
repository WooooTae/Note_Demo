Shader "Notebook/Graphite UI" {
 Properties { [PerRendererData] _MainTex("Sprite",2D)="white"{} _Color("Tint",Color)=(1,1,1,1) }
 SubShader { Tags { "Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent" "CanUseSpriteAtlas"="True" }
 Cull Off Lighting Off ZWrite Off ZTest [unity_GUIZTestMode] Blend SrcAlpha OneMinusSrcAlpha
 Pass { CGPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile_local _ UNITY_UI_CLIP_RECT
 #include "UnityCG.cginc"
 #include "UnityUI.cginc"
 struct appdata {float4 vertex:POSITION;float2 uv:TEXCOORD0;fixed4 color:COLOR;};
 struct v2f {float4 vertex:SV_POSITION;float2 uv:TEXCOORD0;fixed4 color:COLOR;float4 localPosition:TEXCOORD1;};
 sampler2D _MainTex;fixed4 _Color;float4 _ClipRect;
 v2f vert(appdata v){v2f o;o.localPosition=v.vertex;o.vertex=UnityObjectToClipPos(v.vertex);o.uv=v.uv;o.color=v.color*_Color;return o;}
 fixed4 frag(v2f i):SV_Target {fixed4 c=tex2D(_MainTex,i.uv)*i.color;float g=dot(c.rgb,float3(.299,.587,.114));c.rgb=lerp(c.rgb,g.xxx,.88);
 #ifdef UNITY_UI_CLIP_RECT
 c.a*=UnityGet2DClipping(i.localPosition.xy,_ClipRect);
 #endif
 return c;}
 ENDCG }
 }
}
