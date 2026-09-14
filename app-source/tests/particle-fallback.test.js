import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountParticleCake } from '../src/particle-cake.js';

test('missing observer support leaves the original cake available without starting partial rendering', () => {
  const { window } = new JSDOM('<div id="cake"><canvas></canvas><div class="candles">Candles</div></div>');
  const cake = window.document.querySelector('#cake');
  assert.equal(mountParticleCake(cake), null);
  assert.equal(cake.classList.contains('has-particles'), false);
  assert.equal(cake.querySelector('.candles').textContent, 'Candles');
  window.close();
});
