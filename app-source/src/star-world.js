import * as THREE from "three";
const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const mobile = false;

export class StarWorld {
  constructor(canvas) {
    this.canvas = canvas;
    this.pointer = new THREE.Vector2();
    this.targetPointer = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 120);
    this.camera.position.z = 8;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1 : mobile ? 1.25 : 1.6));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.makeStars();
    this.makeNebula();
    addEventListener("resize", () => this.resize(), { passive: true });
    addEventListener("pointermove", (event) => {
      this.targetPointer.set(event.clientX / innerWidth - 0.5, event.clientY / innerHeight - 0.5);
    }, { passive: true });
    this.frameId = 0;
    this.active = false;
    document.addEventListener("visibilitychange", () => this.sync());
    canvas.addEventListener("webglcontextlost", () => { this.failed = true; this.sync(); canvas.style.visibility = "hidden"; });
    this.sync();
  }

  makeStars() {
    const count = lowPower ? 1200 : mobile ? 2200 : 4300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color("#d5b576");
    const colorB = new THREE.Color("#965173");
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.sin(theta) * radius + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = -Math.random() * 70 + 10;
      const c = colorA.clone().lerp(colorB, Math.random());
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: mobile ? 0.045 : 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.76,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  makeNebula() {
    const geometry = new THREE.PlaneGeometry(24, 16, 32, 32);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin(p.x * .55 + uTime * .22) * .18 + cos(p.y * .8 - uTime * .18) * .12;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }
      `,
      fragmentShader: `
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
      `
    });
    this.nebula = new THREE.Mesh(geometry, material);
    this.nebula.position.z = -8;
    this.scene.add(this.nebula);
  }

  setScroll(progress) {
    this.scroll = progress;
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1 : mobile ? 1.25 : 1.6));
  }

  sync() {
    cancelAnimationFrame(this.frameId);
    this.active = !document.hidden && !this.failed;
    if (this.active) this.render();
  }

  render = () => {
    if (!this.active) return;
    const time = this.clock.getElapsedTime();
    this.pointer.lerp(this.targetPointer, 0.035);
    const scroll = this.scroll || 0;
    this.stars.rotation.z = time * 0.008 + scroll * 1.3;
    this.stars.rotation.x = this.pointer.y * 0.08;
    this.stars.position.z = (scroll * 38) % 55;
    this.camera.position.x += (this.pointer.x * 0.6 - this.camera.position.x) * 0.025;
    this.camera.position.y += (-this.pointer.y * 0.4 - this.camera.position.y) * 0.025;
    this.nebula.material.uniforms.uTime.value = time;
    this.nebula.material.uniforms.uScroll.value = scroll;
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.render);
  };
}
