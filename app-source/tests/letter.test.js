import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { setupLetter } from '../src/letter.js';

test('gift still reveals its letter without native dialog APIs, closes and can reopen', () => {
  const { window } = new JSDOM('<body><button id="gift">Gift</button><dialog id="letter"><button id="close">Close</button><p>Birthday letter</p></dialog></body>');
  const document = window.document;
  const gift = document.querySelector('#gift');
  const letter = document.querySelector('#letter');
  const close = document.querySelector('#close');
  letter.showModal = undefined;
  letter.close = undefined;
  setupLetter(letter, gift, close);
  gift.click();
  assert.equal(letter.hasAttribute('open'), true);
  assert.equal(document.activeElement, close);
  assert.equal(document.body.classList.contains('letter-open'), true);
  letter.scrollTop = 250;
  close.click();
  assert.equal(letter.hasAttribute('open'), false);
  assert.equal(document.activeElement, gift);
  assert.equal(document.body.classList.contains('letter-open'), false);
  gift.click();
  assert.equal(letter.scrollTop, 0);
  letter.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(letter.hasAttribute('open'), false);
  window.close();
});
