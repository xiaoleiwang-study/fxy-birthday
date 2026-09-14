var w=Object.defineProperty;var y=(i,e,t)=>e in i?w(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var l=(i,e,t)=>y(i,typeof e!="symbol"?e+"":e,t);import{V as d,C as x,S as b,P as M,W as S,a as P,b as m,B as z,c as u,d as A,A as v,e as C,f as W,g as T,M as k}from"./three-XBLwMCzn.js";const a=navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4;class E{constructor(e){l(this,"render",()=>{if(!this.active)return;const e=this.clock.getElapsedTime();this.pointer.lerp(this.targetPointer,.035);const t=this.scroll||0;this.stars.rotation.z=e*.008+t*1.3,this.stars.rotation.x=this.pointer.y*.08,this.stars.position.z=t*38%55,this.camera.position.x+=(this.pointer.x*.6-this.camera.position.x)*.025,this.camera.position.y+=(-this.pointer.y*.4-this.camera.position.y)*.025,this.nebula.material.uniforms.uTime.value=e,this.nebula.material.uniforms.uScroll.value=t,this.renderer.render(this.scene,this.camera),this.frameId=requestAnimationFrame(this.render)});this.canvas=e,this.pointer=new d,this.targetPointer=new d,this.clock=new x,this.scene=new b,this.camera=new M(60,innerWidth/innerHeight,.1,120),this.camera.position.z=8,this.renderer=new S({canvas:e,alpha:!0,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,a?1:1.6)),this.renderer.setSize(innerWidth,innerHeight),this.renderer.outputColorSpace=P,this.makeStars(),this.makeNebula(),addEventListener("resize",()=>this.resize(),{passive:!0}),addEventListener("pointermove",t=>{this.targetPointer.set(t.clientX/innerWidth-.5,t.clientY/innerHeight-.5)},{passive:!0}),this.frameId=0,this.active=!1,document.addEventListener("visibilitychange",()=>this.sync()),e.addEventListener("webglcontextlost",()=>{this.failed=!0,this.sync(),e.style.visibility="hidden"}),this.sync()}makeStars(){const e=a?1200:4300,t=new Float32Array(e*3),o=new Float32Array(e*3),p=new m("#d5b576"),f=new m("#965173");for(let r=0;r<e;r++){const c=2.5+Math.random()*18,h=Math.random()*Math.PI*2;t[r*3]=Math.cos(h)*c+(Math.random()-.5)*2,t[r*3+1]=Math.sin(h)*c+(Math.random()-.5)*2,t[r*3+2]=-Math.random()*70+10;const n=p.clone().lerp(f,Math.random());o.set([n.r,n.g,n.b],r*3)}const s=new z;s.setAttribute("position",new u(t,3)),s.setAttribute("color",new u(o,3));const g=new A({size:.035,vertexColors:!0,transparent:!0,opacity:.76,blending:v,depthWrite:!1});this.stars=new C(s,g),this.scene.add(this.stars)}makeNebula(){const e=new W(24,16,32,32),t=new T({transparent:!0,depthWrite:!1,blending:v,uniforms:{uTime:{value:0},uScroll:{value:0}},vertexShader:`
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin(p.x * .55 + uTime * .22) * .18 + cos(p.y * .8 - uTime * .18) * .12;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }
      `,fragmentShader:`
        varying vec2 vUv;
        uniform float uTime;
        uniform float uScroll;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
        }
        void main(){
          vec2 uv=vUv-.5;
          float n=noise(uv*4.+vec2(uTime*.025,-uTime*.018));
          float glow=smoothstep(.64,.02,length(uv*vec2(.78,1.4))+n*.22);
          vec3 burgundy=vec3(.30,.035,.14);
          vec3 gold=vec3(.46,.25,.08);
          vec3 color=mix(burgundy,gold,n+sin(uScroll)*.08);
          gl_FragColor=vec4(color,glow*.22);
        }
      `});this.nebula=new k(e,t),this.nebula.position.z=-8,this.scene.add(this.nebula)}setScroll(e){this.scroll=e}resize(){this.camera.aspect=innerWidth/innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(innerWidth,innerHeight),this.renderer.setPixelRatio(Math.min(devicePixelRatio,a?1:1.6))}sync(){cancelAnimationFrame(this.frameId),this.active=!document.hidden&&!this.failed,this.active&&this.render()}}export{E as StarWorld};
