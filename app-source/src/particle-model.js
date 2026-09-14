const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t);
const smooth = t => t * t * (3 - 2 * t);

// A small, shared geometry model: no GPU, media permissions or external assets.
export function createParticles(count, random = Math.random) {
  return Array.from({ length: count }, (_, i) => {
    const flame = i >= count * 0.94;
    const candle = !flame && i >= count * 0.88;
    const tier = i % 3;
    const angle = random() * Math.PI * 2;
    const radius = [1.68, 1.28, 0.88][tier];
    const top = -0.65 + tier * 0.63;
    const rim = random() > 0.32;
    const r = rim ? radius : Math.sqrt(random()) * radius;
    let cake = [Math.cos(angle) * r, rim ? top - random() * 0.52 : top, Math.sin(angle) * r];
    if (candle || flame) {
      const x = ((i % 3) - 1) * 0.45;
      cake = [x + (random() - 0.5) * (flame ? 0.1 : 0.045),
        flame ? 1.34 + random() * 0.21 : 0.64 + random() * 0.64,
        (random() - 0.5) * 0.065];
    }
    const t = random() * Math.PI * 2;
    const fill = 0.75 + random() * 0.25;
    const heart = [16 * Math.sin(t) ** 3 / 10 * fill,
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 10 * fill,
      (random() - 0.5) * 0.4];
    return { cake, heart, tier, kind: flame ? 'flame' : candle ? 'candle' : 'cake',
      burst: [(random() - 0.5) * 7, (random() - 0.5) * 6, (random() - 0.5) * 5],
      shimmer: random() * Math.PI * 2, size: 0.6 + random() * 0.85 };
  });
}

export function positionAt(particle, progress) {
  const t = Math.max(0, Math.min(1, progress));
  return t < 0.42
    ? mix(particle.cake, particle.burst, smooth(t / 0.42))
    : mix(particle.burst, particle.heart, smooth((t - 0.42) / 0.58));
}

export class WishSequence {
  running = false;
  startedAt = null;
  start(now) {
    if (this.running) return false;
    this.startedAt = now;
    this.running = true;
    return true;
  }
  progress(now) {
    if (this.startedAt === null) return 0;
    const progress = Math.max(0, Math.min(1, (now - this.startedAt) / 3200));
    if (progress === 1) this.running = false;
    return progress;
  }
}
