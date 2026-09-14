import { createParticles, positionAt, WishSequence } from './particle-model.js';

export function mountParticleCake(container, { reducedMotion = false, onUnavailable = () => {} } = {}) {
  if (typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const compact = matchMedia('(max-width: 700px)').matches;
  const particles = createParticles(compact ? 1050 : 1800);
  const sequence = new WishSequence();
  let visible = false;
  let raf = 0;
  let lastFrame = 0;
  let width = 0;
  let height = 0;
  let hasWished = false;
  let unavailable = false;

  const draw = now => {
    ctx.clearRect(0, 0, width, height);
    const progress = hasWished ? (reducedMotion ? 1 : sequence.progress(now)) : 0;
    const time = reducedMotion ? 0 : now / 1000;
    const rotation = hasWished ? 0 : Math.sin(time * 0.24) * 0.28 + 0.32;
    const tilt = -0.18;
    const scale = Math.min(width / 4.6, height / 4.5);

    // A halo and orbital dust stay behind the focal shape.
    const glow = ctx.createRadialGradient(width / 2, height * 0.53, 4, width / 2, height * 0.53, width * 0.48);
    glow.addColorStop(0, hasWished ? '#a7476b24' : '#b2813a20');
    glow.addColorStop(1, '#00000000');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#d6b77735';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(width / 2, height * 0.82, width * 0.39, height * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (const p of particles) {
      const [x, y, z] = hasWished ? positionAt(p, progress) : p.cake;
      const rx = x * Math.cos(rotation) + z * Math.sin(rotation);
      const rz = z * Math.cos(rotation) - x * Math.sin(rotation);
      const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
      const depth = 5 / (5 - (y * Math.sin(tilt) + rz * Math.cos(tilt)));
      const px = width / 2 + rx * scale * depth;
      const py = height * 0.51 - ry * scale * depth;
      const flame = p.kind === 'flame' && !hasWished;
      const alpha = 0.5 + Math.sin(time * 1.4 + p.shimmer) * 0.2 + depth * 0.12;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = flame ? '#fff0c2' : hasWished ? (p.tier === 1 ? '#f5c7d6' : '#d994b0') : ['#dcb77c', '#ffe1aa', '#e6a2ad'][p.tier];
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.4, p.size * depth * (flame ? 1.45 : 1)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const frame = now => {
    raf = 0;
    if (unavailable || !visible || document.hidden || reducedMotion) return;
    if (now - lastFrame >= (compact ? 32 : 24)) {
      draw(now);
      lastFrame = now;
    }
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (unavailable || !visible || document.hidden) return;
    draw(performance.now());
    if (!reducedMotion) raf = requestAnimationFrame(frame);
  };
  const resize = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, compact ? 1.5 : 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  };
  resize();
  container.classList.add('has-particles');
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(container);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  observer.observe(container);
  document.addEventListener('visibilitychange', sync);
  // Releasing the context also restores the existing, button-operated cake.
  canvas.addEventListener('contextlost', () => {
    unavailable = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    sizeObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    container.classList.remove('has-particles');
    onUnavailable();
  });
  return {
    wish() {
      if (unavailable) return false;
      if (!sequence.start(performance.now())) return false;
      hasWished = true;
      if (reducedMotion) sequence.progress(performance.now() + 3200);
      sync();
      return true;
    }
  };
}
