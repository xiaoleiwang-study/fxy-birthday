export function setupLetter(letter, giftButton, closeButton) {
  const document = letter.ownerDocument;
  const native = typeof letter.showModal === 'function' && typeof letter.close === 'function';
  const afterClose = () => {
    document.body.classList.remove('letter-open');
    giftButton.classList.remove('is-open');
    giftButton.focus({ preventScroll: true });
  };
  const close = () => {
    if (native) letter.close();
    else {
      letter.removeAttribute('open');
      afterClose();
    }
  };
  giftButton.addEventListener('click', () => {
    if (letter.hasAttribute('open')) return;
    giftButton.classList.add('is-open');
    if (native) letter.showModal();
    else {
      letter.setAttribute('open', '');
    }
    letter.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    document.body.classList.add('letter-open');
  });
  closeButton.addEventListener('click', close);
  letter.addEventListener('close', afterClose);
  letter.addEventListener('keydown', event => {
    if (native) return;
    if (event.key === 'Escape') close();
    // The close control is the only focusable item in this letter.
    if (event.key === 'Tab') { event.preventDefault(); closeButton.focus(); }
  });
  letter.addEventListener('click', event => {
    if (event.target !== letter) return;
    const rect = letter.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
}
