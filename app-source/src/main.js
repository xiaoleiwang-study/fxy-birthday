import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const lowPower =
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const mobile = matchMedia("(max-width: 700px)").matches;

class StarWorld {
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
    this.render();
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

  render = () => {
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
    requestAnimationFrame(this.render);
  };
}

const world = new StarWorld($("#world"));
const loadProgress = $("#loadProgress");
const loadLabel = $("#loadLabel");
let simulated = 0;
const loadingTimer = setInterval(() => {
  simulated = Math.min(simulated + Math.ceil(Math.random() * 13), 92);
  loadProgress.style.width = `${simulated}%`;
  loadLabel.textContent = `${simulated}%`;
}, 100);

addEventListener("load", () => {
  clearInterval(loadingTimer);
  loadProgress.style.width = "100%";
  loadLabel.textContent = "100%";
  setTimeout(() => $("#loader").classList.add("is-hidden"), 350);
});

const bgm = $("#bgm");
const soundButton = $("#soundButton");
const syncSound = () => soundButton.classList.toggle("is-playing", !bgm.paused);
$("#enterButton").addEventListener("click", async () => {
  const prologue = $("#prologue");
  prologue.classList.add("is-opening");
  soundButton.classList.add("is-visible");
  bgm.volume = 0.5;
  try { await bgm.play(); } catch { /* Browser keeps the visible sound control available. */ }
  syncSound();
  setTimeout(() => {
    prologue.classList.add("is-entered");
    gsap.from(".opening-copy > *", { y: 45, opacity: 0, stagger: 0.14, duration: 1.2, delay: 0.4, ease: "power3.out" });
  }, 1800);
});
soundButton.addEventListener("click", async () => {
  if (bgm.paused) await bgm.play(); else bgm.pause();
  syncSound();
});
bgm.addEventListener("play", syncSound);
bgm.addEventListener("pause", syncSound);

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => world.setScroll(self.progress)
});

$$(".scene__content").forEach((content) => {
  const animatedChildren = [...content.children].filter(
    (child) => !child.matches(".letter, .gift-box")
  );
  gsap.from(animatedChildren, {
    scrollTrigger: { trigger: content, start: "top 76%", end: "bottom 48%", scrub: 1 },
    y: 55,
    opacity: 0,
    stagger: 0.1
  });
});

gsap.to(".year-seven", {
  yPercent: 28,
  rotate: 5,
  scrollTrigger: { trigger: ".scene--opening", start: "top top", end: "bottom top", scrub: 1.3 }
});

gsap.from(".origin__copy > *", {
  scrollTrigger: { trigger: ".origin", start: "top 72%", end: "top 28%", scrub: 1.2 },
  y: 55,
  opacity: 0,
  stagger: 0.12
});

gsap.to(".origin__orbit", {
  scale: 1.3,
  rotate: 35,
  opacity: 0.12,
  scrollTrigger: { trigger: ".origin", start: "top top", end: "bottom bottom", scrub: 1.5 }
});

$$(".memory-frame").forEach((frame, index) => {
  gsap.from(frame, {
    scrollTrigger: { trigger: frame, start: "top 92%", end: "top 58%", scrub: 1 },
    y: mobile ? 70 : 130,
    opacity: 0,
    rotate: index % 2 ? 1.5 : -1.5
  });
  const memoryImage = frame.querySelector(".memory-visual img");
  if (memoryImage) {
    gsap.to(memoryImage, {
      yPercent: 8,
      scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 1.4 }
    });
  }
});

gsap.from(".origin__ending", {
  scrollTrigger: { trigger: ".origin__ending", start: "top 90%", end: "top 62%", scrub: 1 },
  opacity: 0,
  y: 50
});

$$(".portrait").forEach((card, index) => {
  const image = card.querySelector("img");
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: "top 92%", end: "top 58%", scrub: 1 },
    y: 90,
    opacity: 0,
    rotate: index % 2 ? 2 : -2
  });
  gsap.to(image, {
    yPercent: 12,
    scale: 1.16,
    scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1.5 }
  });
  if (!lowPower) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card.querySelector(".portrait__media"), { rotateY: x * 4, rotateX: -y * 4, transformPerspective: 900, duration: 0.5 });
      gsap.to(image, { x: x * -9, duration: 0.5 });
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(card.querySelector(".portrait__media"), { rotateX: 0, rotateY: 0, duration: 0.8 });
      gsap.to(image, { x: 0, duration: 0.8 });
    });
  }
});

$("#blowButton").addEventListener("click", () => {
  $("#cake").classList.add("is-blown");
  $("#wishMessage").classList.add("is-visible");
  $("#blowButton").textContent = "愿望已被星光收好";
  const burst = gsap.timeline();
  burst.to(world.stars.material, { opacity: 1, size: mobile ? 0.08 : 0.07, duration: 0.35 })
    .to(world.stars.material, { opacity: 0.76, size: mobile ? 0.045 : 0.035, duration: 1.8 });
});

$("#giftButton").addEventListener("click", () => {
  $("#giftButton").classList.add("is-open");
  const letter = $("#letter");
  gsap.killTweensOf(letter);
  gsap.set(letter, { clearProps: "opacity,transform,visibility" });
  setTimeout(() => letter.classList.add("is-visible"), 650);
  gsap.to(world.stars.rotation, { y: world.stars.rotation.y + Math.PI * 2, duration: 3, ease: "power3.inOut" });
});
