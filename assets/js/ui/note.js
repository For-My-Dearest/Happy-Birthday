/* ============================================================================
   note.js — the note that came first.

   README_FIRST.md was never developer documentation; it was the first page of
   the gift. Most of its job is done by the opening sequence and the hub, but
   the words themselves deserve to survive intact, so they live in a quiet
   dialog on paper rather than being pasted across the homepage.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;
  var release = null;
  var host = null;

  function open() {
    if (host) return;
    var note = NIGHT.content.note;

    var body = el('div', { class: 'note-body' }, note.body.map(function (line) {
      return line === ''
        ? el('span', { class: 'note-gap', 'aria-hidden': 'true' })
        : el('p', { text: line });
    }));

    var close = util.iconButton('close', 'Close the note', dismiss, { class: 'note-close' });

    var sheet = el('div', {
      class: 'note-sheet',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'note-title'
    }, [
      close,
      el('p', { class: 'note-eyebrow', id: 'note-title', text: 'the note that came first' }),
      body,
      el('span', { class: 'note-ornament', 'aria-hidden': 'true', html: NIGHT.icons.divider() })
    ]);

    var veil = el('div', { class: 'note-veil', onclick: function (event) { if (event.target === veil) dismiss(); } }, [sheet]);
    host = veil;
    document.body.appendChild(veil);
    /* hold the node in a local: a fast open-then-close would otherwise leave
       this callback reaching for a reference that is already gone */
    requestAnimationFrame(function () { veil.classList.add('is-in'); });

    release = util.trapFocus(host, dismiss);
    close.focus({ preventScroll: true });
  }

  function dismiss() {
    if (!host) return;
    var node = host;
    host = null;
    node.classList.remove('is-in');
    if (release) { release(); release = null; }
    window.setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 320);
  }

  NIGHT.note = { open: open, close: dismiss };
})();
