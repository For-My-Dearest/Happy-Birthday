/* ============================================================================
   memories.js — the board.

   The gift contains no photographs, so this room contains no photographs.
   Inventing them, or dressing the room with stock images, would be the one
   dishonest thing in the whole project.

   What it does instead is exist, properly built, and wait. Drop files into
   assets/img/memories/, add them to NIGHT.content.memories.items, and this
   room fills itself: pins, captions, dates, lightbox and keyboard handling
   are already here and need no new code.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;

  var lightbox = null;
  var release = null;

  function openImage(item) {
    if (lightbox) return;
    var figure = el('figure', { class: 'lightbox-figure' }, [
      el('img', { src: item.src, alt: item.alt || item.caption || 'A pinned photograph' }),
      item.caption ? el('figcaption', {}, [
        el('span', { text: item.caption }),
        item.date ? el('span', { class: 'memory-date', text: item.date }) : null
      ]) : null
    ]);

    var close = util.iconButton('close', 'Close', dismiss, { class: 'lightbox-close' });
    var frame = el('div', { class: 'lightbox-frame', role: 'dialog', 'aria-modal': 'true', 'aria-label': item.caption || 'Photograph' }, [close, figure]);

    var veil = el('div', {
      class: 'lightbox',
      onclick: function (event) { if (event.target === veil) dismiss(); }
    }, [frame]);
    lightbox = veil;

    document.body.appendChild(veil);
    requestAnimationFrame(function () { veil.classList.add('is-in'); });
    release = util.trapFocus(lightbox, dismiss);
    close.focus({ preventScroll: true });
  }

  function dismiss() {
    if (!lightbox) return;
    var node = lightbox;
    lightbox = null;
    node.classList.remove('is-in');
    if (release) { release(); release = null; }
    window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 300);
  }

  function pinned(item, index) {
    var img = el('img', {
      class: 'memory-photo',
      src: item.src,
      alt: item.alt || item.caption || 'A pinned photograph',
      loading: 'lazy',
      decoding: 'async'
    });
    img.addEventListener('error', function () {
      card.classList.add('is-missing');
      img.remove();
    });

    var card = el('button', {
      type: 'button',
      class: 'memory',
      style: '--tilt:' + ((index % 2 ? 1 : -1) * (0.7 + (index % 3) * 0.5)).toFixed(2) + 'deg',
      onclick: function () { openImage(item); }
    }, [
      el('span', { class: 'memory-pin', 'aria-hidden': 'true' }),
      el('span', { class: 'memory-frame' }, [img]),
      el('span', { class: 'memory-caption' }, [
        el('span', { text: item.caption || '' }),
        item.date ? el('span', { class: 'memory-date', text: item.date }) : null
      ])
    ]);
    return el('li', {}, [card]);
  }

  function mount(stage) {
    var data = NIGHT.content.memories;
    var has = data.items.length > 0;

    var head = el('header', { class: 'board-head' }, [
      el('p', { class: 'eyebrow', text: data.title }),
      el('h1', { class: 'board-title', text: has ? 'The pictures we chose never to lose.' : data.empty.heading })
    ]);

    var body = has
      ? el('ul', { class: 'board-grid' }, data.items.map(pinned))
      : el('div', { class: 'board-empty' }, [
          el('div', { class: 'board-slots', 'aria-hidden': 'true' }, [
            el('span', { class: 'slot' }), el('span', { class: 'slot' }), el('span', { class: 'slot' })
          ]),
          el('div', { class: 'board-empty__text' }, data.empty.lines.map(function (line) {
            return el('p', { text: line });
          }))
        ]);

    stage.appendChild(el('section', { class: 'board-room' + (has ? '' : ' is-empty') }, [
      head,
      body,
      el('span', { class: 'board-sprig', 'aria-hidden': 'true', html: NIGHT.icons.glyph('sprig') })
    ]));
  }

  function unmount() { dismiss(); }

  NIGHT.router.register({ id: 'memories', title: 'The Board', mount: mount, unmount: unmount });
})();
