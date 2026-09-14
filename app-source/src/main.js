import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountParticleCake } from './particle-cake.js';
import { setupLetter } from './letter.js';

gsap.registerPlugin(ScrollTrigger);
const $ = selector => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = matchMedia('(max-width: 700px)').matches;
const story = $('#story');
const prologue = $('#prologue');
const soundButton = $('#soundButton');
const bgm = $('#bgm');
let entered = false;

// Loading does not depend on music, lazy photographs, or a WebGL context.
$('#loader').classList.add('is-hidden');
story.inert = true;
document.body.classList.add('awaiting-story');
const syncSound = () => {
  soundButton.classList.toggle('is-playing', !bgm.paused);
  soundButton.setAttribute('aria-label', bgm.paused ? '播放音乐' : '暂停音乐');
  soundButton.setAttribute('aria-pressed', String(!bgm.paused));
};
const playMusic = () => {
  bgm.volume = 0.4;
  bgm.play().catch(() => {
    syncSound();
    soundButton.setAttribute('aria-label', '音乐暂未播放，点击重试');
  });
};
bgm.addEventListener('play', syncSound);
bgm.addEventListener('pause', syncSound);
bgm.addEventListener('error', () => {
  syncSound();
  soundButton.setAttribute('aria-label', '音乐加载失败，点击重试');
});
soundButton.addEventListener('click', () => bgm.paused ? playMusic() : bgm.pause());

$('#enterButton').addEventListener('click', () => {
  if (entered) return;
  entered = true;
  $('#enterButton').disabled = true;
  prologue.classList.add('is-opening');
  playMusic();
  setTimeout(() => {
    prologue.classList.add('is-entered');
    story.inert = false;
    document.body.classList.remove('awaiting-story');
    $('#storyHeader').classList.add('is-visible');
    soundButton.classList.add('is-visible');
    story.focus({ preventScroll: true });
    ScrollTrigger.refresh();
  }, reducedMotion ? 0 : 1200);

  // Phones keep a quiet CSS star field; the focal particle cake uses Canvas 2D.
  if (!compact && !reducedMotion) {
    import('./star-world.js').then(({ StarWorld }) => {
      try {
        const world = new StarWorld($('#world'));
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => world.setScroll(self.progress) });
      } catch {
        $('#world').style.display = 'none';
      }
    }).catch(() => { /* The CSS sky remains visible if the optional chunk cannot load. */ });
  }
});

// Reveal once, independently of scroll speed; text never requires extra scrolling to become readable.
if (!reducedMotion) {
  document.querySelectorAll('.memory-frame, .portrait, .origin__ending, .quiet-note').forEach(element => {
    gsap.from(element, {
      y: compact ? 18 : 30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 95%', once: true }
    });
  });
}

const cake = $('#cake');
const blowButton = $('#blowButton');
let particleCake = null;
let wished = false;
let wishing = false;
const initCake = () => {
  try { particleCake = mountParticleCake(cake, { reducedMotion, onUnavailable: () => { particleCake = null; } }); }
  catch { cake.classList.remove('has-particles'); }
  if (wished) particleCake?.wish();
};
if ('IntersectionObserver' in window) {
  const cakeObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    cakeObserver.disconnect();
    initCake();
  }, { rootMargin: '250px' });
  cakeObserver.observe(cake);
} else initCake();

blowButton.addEventListener('click', () => {
  if (wishing) return;
  wishing = true;
  wished = true;
  blowButton.disabled = true;
  blowButton.textContent = '愿望正在抵达星空…';
  cake.classList.add('is-blown');
  cake.setAttribute('aria-label', '蜡烛已吹灭，星光正在汇成生日祝福');
  $('#wishMessage').classList.remove('is-visible');
  particleCake?.wish();
  setTimeout(() => {
    $('#wishMessage').classList.add('is-visible');
    $('#wishMessage').setAttribute('role', 'status');
    cake.setAttribute('aria-label', '生日快乐，fxy。愿望已被星光收好。');
    blowButton.textContent = particleCake ? '再看一次星光' : '再许一个愿望';
    blowButton.disabled = false;
    wishing = false;
  }, reducedMotion ? 0 : 3300);
});

setupLetter($('#letter'), $('#giftButton'), $('#closeLetter'));
