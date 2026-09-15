/* ============================================================================
   letter.js — the room where the handwriting lives.

   The letter is a photograph of a real object, so it is never re-typed as web
   text. It is presented as the artifact it is: folded first, then lifted out,
   then turned page by page, with enough zoom to look closely at the ink.

   Interaction rules kept deliberately plain:
     - arrows turn the page while the page is whole
     - arrows pan once it has been zoomed into (that is where they are needed)
     - drag, wheel, pinch and double-click all do the obvious thing
     - Escape leaves the room
   State is kept in this module, so walking out and back returns her to the
   page she was reading.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;

  var MIN = 1;
  var MAX = 4;

  /* room memory, kept between visits within the same session */
  var pageIndex = 0;
  var unfolded = false;

  /* live view state, rebuilt on every mount */
  var view = null;

  function pages() { return NIGHT.content.letter.pages; }

  /* ---- transform -------------------------------------------------------- */

  function limits() {
    var img = view.images[pageIndex];
    var box = view.viewport.getBoundingClientRect();
    var w = img.offsetWidth * view.scale;
    var h = img.offsetHeight * view.scale;
    return {
      x: Math.max(0, (w - box.width) / 2),
      y: Math.max(0, (h - box.height) / 2)
    };
  }

  function applyTransform() {
    var max = limits();
    view.x = util.clamp(view.x, -max.x, max.x);
    view.y = util.clamp(view.y, -max.y, max.y);
    view.pane.style.transform = 'translate3d(' + view.x.toFixed(2) + 'px,' + view.y.toFixed(2) + 'px,0) scale(' + view.scale.toFixed(3) + ')';
    view.viewport.classList.toggle('is-zoomed', view.scale > MIN + 0.001);
    view.zoomOut.disabled = view.scale <= MIN + 0.001;
    view.zoomIn.disabled = view.scale >= MAX - 0.001;
    view.reset.hidden = view.scale <= MIN + 0.001;
    view.zoomLabel.textContent = Math.round(view.scale * 100) + '%';
  }

  function zoomTo(next, originX, originY) {
    var previous = view.scale;
    view.scale = util.clamp(next, MIN, MAX);
    if (view.scale === previous) return;
    if (view.scale === MIN) { view.x = 0; view.y = 0; }
    else if (typeof originX === 'number') {
      var box = view.viewport.getBoundingClientRect();
      var px = originX - box.left - box.width / 2;
      var py = originY - box.top - box.height / 2;
      var ratio = view.scale / previous;
      view.x = px + (view.x - px) * ratio;
      view.y = py + (view.y - py) * ratio;
    }
    applyTransform();
  }

  function resetZoom() { view.scale = MIN; view.x = 0; view.y = 0; applyTransform(); }

  /* ---- pages ------------------------------------------------------------ */

  /* Only the page in hand and its neighbour are ever fetched. */
  function ensureLoaded(index) {
    var img = view.images[index];
    if (!img || img.dataset.loaded === '1') return;
    img.src = img.dataset.src;
    img.dataset.loaded = '1';
  }

  function turn(to) {
    var list = pages();
    if (to < 0 || to >= list.length || to === pageIndex || view.turning) return;

    var from = pageIndex;
    var forward = to > from;
    pageIndex = to;
    ensureLoaded(to);
    ensureLoaded(to + (forward ? 1 : -1));
    resetZoom();

    var leaving = view.sheets[from];
    var entering = view.sheets[to];
    var reduced = util.motion.reduced;

    view.turning = true;
    entering.hidden = false;
    entering.classList.add(reduced ? 'is-fading-in' : (forward ? 'is-entering-next' : 'is-entering-prev'));
    leaving.classList.add(reduced ? 'is-fading-out' : (forward ? 'is-leaving-next' : 'is-leaving-prev'));

    window.setTimeout(function () {
      if (!view) return;
      leaving.hidden = true;
      leaving.className = 'sheet';
      entering.className = 'sheet is-current';
      view.turning = false;
      paintControls();
    }, reduced ? 180 : 520);

    paintControls();
    util.announce('Page ' + (to + 1) + ' of ' + list.length);
  }

  function paintControls() {
    var list = pages();
    view.prev.disabled = pageIndex === 0;
    view.next.disabled = pageIndex === list.length - 1;
    view.indicator.textContent = (pageIndex + 1) + ' / ' + list.length;
    view.download.href = list[pageIndex].original;
    view.download.setAttribute('download', 'letter-page-' + (pageIndex + 1) + '.png');
    view.download.setAttribute('aria-label', 'Download page ' + (pageIndex + 1) + ' at full size');
  }

  /* ---- pointer ---------------------------------------------------------- */

  function bindPointer() {
    var pointers = {};
    var dragging = false;
    var last = { x: 0, y: 0 };
    var pinch = 0;

    view.viewport.addEventListener('pointerdown', function (event) {
      pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 1 && view.scale > MIN) {
        dragging = true;
        last = { x: event.clientX, y: event.clientY };
        view.viewport.setPointerCapture(event.pointerId);
        view.pane.classList.add('is-dragging');
      } else if (ids.length === 2) {
        dragging = false;
        pinch = spread(pointers);
      }
    });

    view.viewport.addEventListener('pointermove', function (event) {
      if (!pointers[event.pointerId]) return;
      pointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      var ids = Object.keys(pointers);

      if (ids.length === 2) {
        var now = spread(pointers);
        if (pinch > 0) {
          var mid = middle(pointers);
          zoomTo(view.scale * (now / pinch), mid.x, mid.y);
        }
        pinch = now;
        event.preventDefault();
        return;
      }
      if (!dragging) return;
      view.x += event.clientX - last.x;
      view.y += event.clientY - last.y;
      last = { x: event.clientX, y: event.clientY };
      applyTransform();
      event.preventDefault();
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
      view.viewport.addEventListener(type, function (event) {
        delete pointers[event.pointerId];
        if (Object.keys(pointers).length < 2) pinch = 0;
        dragging = false;
        view.pane.classList.remove('is-dragging');
      });
    });

    view.viewport.addEventListener('wheel', function (event) {
      event.preventDefault();
      zoomTo(view.scale * (event.deltaY > 0 ? 0.88 : 1.14), event.clientX, event.clientY);
    }, { passive: false });

    view.viewport.addEventListener('dblclick', function (event) {
      zoomTo(view.scale > MIN + 0.001 ? MIN : 2.2, event.clientX, event.clientY);
    });

    function spread(map) {
      var ids = Object.keys(map);
      var a = map[ids[0]];
      var b = map[ids[1]];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    function middle(map) {
      var ids = Object.keys(map);
      var a = map[ids[0]];
      var b = map[ids[1]];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
  }

  function onKey(event) {
    if (!view) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    var zoomed = view.scale > MIN + 0.001;
    var stepBy = 60;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (zoomed) { view.x -= stepBy; applyTransform(); } else turn(pageIndex + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (zoomed) { view.x += stepBy; applyTransform(); } else turn(pageIndex - 1);
        break;
      case 'ArrowUp':
        if (!zoomed) return;
        event.preventDefault(); view.y += stepBy; applyTransform();
        break;
      case 'ArrowDown':
        if (!zoomed) return;
        event.preventDefault(); view.y -= stepBy; applyTransform();
        break;
      case '+': case '=':
        event.preventDefault(); zoomTo(view.scale + 0.5); break;
      case '-': case '_':
        event.preventDefault(); zoomTo(view.scale - 0.5); break;
      case '0':
        event.preventDefault(); resetZoom(); break;
      case 'Escape':
        NIGHT.router.go('hub'); break;
      default: break;
    }
  }

  /* ---- build ------------------------------------------------------------ */

  function buildEnvelope(onOpen) {
    var seal = el('button', {
      type: 'button',
      class: 'envelope',
      'aria-label': 'Open the letter',
      onclick: function () {
        this.classList.add('is-open');
        this.disabled = true;
        window.setTimeout(onOpen, util.motion.reduced ? 80 : 620);
      }
    }, [
      el('span', {
        class: 'envelope-art',
        'aria-hidden': 'true',
        html:
          '<svg viewBox="0 0 220 150" focusable="false">' +
          '<rect class="env-body" x="4" y="22" width="212" height="124" rx="6"/>' +
          '<path class="env-fold" d="M4 146 84 86M216 146 136 86"/>' +
          '<path class="env-flap" d="M4 26 110 96 216 26"/>' +
          '<path class="env-heart" d="M110 70c-3.4-6.6-13.6-5.7-13.6 2.6 0 6.1 8.6 11.5 13.6 15.6 5-4.1 13.6-9.5 13.6-15.6 0-8.3-10.2-9.2-13.6-2.6Z"/>' +
          '</svg>'
      }),
      el('span', { class: 'envelope-hint', text: NIGHT.content.letter.intro })
    ]);
    return seal;
  }

  function buildReader(stage) {
    var list = NIGHT.content.letter.pages;

    var sheets = list.map(function (page, index) {
      var img = el('img', {
        class: 'page-img',
        alt: page.alt,
        width: page.width,
        height: page.height,
        draggable: 'false',
        decoding: 'async',
        dataset: { src: page.src, loaded: '0' }
      });
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
        img.setAttribute('alt', '');
        sheet.appendChild(el('p', { class: 'page-fallback', text: 'This page will not open here. You can still download it below.' }));
      });
      var sheet = el('figure', { class: 'sheet' + (index === pageIndex ? ' is-current' : ''), hidden: index !== pageIndex ? true : null }, [img]);
      return { sheet: sheet, img: img };
    });

    var pane = el('div', { class: 'pane' }, sheets.map(function (s) { return s.sheet; }));
    var viewport = el('div', { class: 'viewport' }, [pane]);

    var prev = util.iconButton('left', 'Previous page', function () { turn(pageIndex - 1); }, { class: 'ctl' });
    var next = util.iconButton('right', 'Next page', function () { turn(pageIndex + 1); }, { class: 'ctl' });
    var zoomIn = util.iconButton('zoomIn', 'Zoom in', function () { zoomTo(view.scale + 0.5); }, { class: 'ctl' });
    var zoomOut = util.iconButton('zoomOut', 'Zoom out', function () { zoomTo(view.scale - 0.5); }, { class: 'ctl' });
    var indicator = el('span', { class: 'page-count', 'aria-live': 'polite' });
    var zoomLabel = el('span', { class: 'zoom-label', 'aria-hidden': 'true' });
    var reset = el('button', { type: 'button', class: 'ctl-text', text: 'fit page', onclick: resetZoom, hidden: true });
    var download = el('a', {
      class: 'ctl-text',
      href: list[0].original,
      download: 'letter-page-1.png',
      html: NIGHT.icons.ui('download') + '<span>save this page</span>'
    });

    var room = el('section', { class: 'letter-room' }, [
      el('div', { class: 'desk' }, [viewport]),
      el('div', { class: 'letter-bar' }, [
        el('div', { class: 'letter-bar__nav' }, [prev, indicator, next]),
        el('div', { class: 'letter-bar__tools' }, [zoomOut, zoomLabel, zoomIn, reset, download])
      ]),
      el('p', { class: 'letter-tip' }, [
        el('span', { text: 'Drag, pinch or scroll to look closer. ' }),
        el('span', { class: 'letter-tip__keys', text: 'Arrow keys turn the page.' })
      ])
    ]);

    view = {
      viewport: viewport,
      pane: pane,
      images: sheets.map(function (s) { return s.img; }),
      sheets: sheets.map(function (s) { return s.sheet; }),
      prev: prev, next: next, zoomIn: zoomIn, zoomOut: zoomOut,
      indicator: indicator, zoomLabel: zoomLabel, reset: reset, download: download,
      scale: MIN, x: 0, y: 0, turning: false
    };

    stage.appendChild(room);
    ensureLoaded(pageIndex);
    ensureLoaded(pageIndex + 1);
    applyTransform();
    paintControls();
    bindPointer();
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () { room.classList.add('is-ready'); });
  }

  function mount(stage) {
    if (!unfolded) {
      var wrap = el('div', { class: 'letter-open' });
      var envelope = buildEnvelope(function () {
        unfolded = true;
        util.clear(stage);
        buildReader(stage);
        var first = util.qs('.ctl', stage);
        if (first) first.focus({ preventScroll: true });
      });
      wrap.appendChild(envelope);
      stage.appendChild(wrap);
      /* the router has already focused the room; forcing focus onto the
         envelope only paints a ring around it for mouse visitors */
      return;
    }
    buildReader(stage);
  }

  function unmount() {
    document.removeEventListener('keydown', onKey);
    view = null;
  }

  NIGHT.router.register({ id: 'letter', title: 'The Letter', mount: mount, unmount: unmount });
})();
