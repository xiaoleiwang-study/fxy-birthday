import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticles, positionAt, WishSequence } from '../src/particle-model.js';

test('all particle forms remain finite and include three cake tiers and candle flames', () => {
  const particles = createParticles(900);
  assert.equal(particles.length, 900);
  for (const p of particles) {
    for (const form of ['cake', 'heart', 'burst']) {
      assert.equal(p[form].length, 3);
      assert.ok(p[form].every(Number.isFinite));
    }
  }
  assert.deepEqual([...new Set(particles.filter(p => p.kind === 'cake').map(p => p.tier))].sort(), [0, 1, 2]);
  assert.ok(particles.some(p => p.kind === 'flame'));
});

test('morph returns exact endpoints without mutating reusable particle geometry', () => {
  const p = { cake: [1, 2, 3], burst: [5, 8, -2], heart: [-1, 0, 4] };
  const original = structuredClone(p);
  assert.deepEqual(positionAt(p, 0), [1, 2, 3]);
  assert.deepEqual(positionAt(p, 1), [-1, 0, 4]);
  for (const t of [0.001, 0.2, 0.5, 0.8, 0.999]) assert.ok(positionAt(p, t).every(Number.isFinite));
  assert.deepEqual(p, original);
});

test('rapid clicks cannot restart a running wish; replay starts a fresh sequence', () => {
  const wish = new WishSequence();
  assert.equal(wish.start(100), true);
  assert.equal(wish.start(200), false);
  assert.equal(wish.progress(100), 0);
  assert.equal(wish.progress(5000), 1);
  assert.equal(wish.running, false);
  assert.equal(wish.start(6000), true);
  assert.equal(wish.progress(6000), 0);
});
