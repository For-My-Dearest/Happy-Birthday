/* ============================================================================
   intro.js — the first four seconds.

   A moon comes up, two lines are said, and then it gets out of the way. It
   runs once per browser (after that the hub simply appears), it can always be
   skipped with the button, Escape, or any key, and under reduced motion it
   becomes a short pair of fades with no movement at all.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;
  var SEEN_KEY = 'night.opened';

  function seen() {
    try { return window.localStorage.getItem(SEEN_KEY) === '1'; } catch (err) { return false; }
  }

  function remember() {
    try { window.localStorage.setItem(SEEN_KEY, '1'); } catch (err) { /* private mode */ }
  }

  function run() {
    var host = document.getElementById('intro');
    if (!host) return Promise.resolve();

    if (seen()) {
      host.parentNode.removeChild(host);
      return Promise.resolve();
    }
    remember();

    var reduced = util.motion.reduced;
    var lines = NIGHT.content.note.opening;
    var timers = [];
    var done = false;
    var release = null;
    var resolveRun = null;

    var lineOne = el('p', { class: 'intro-line', text: lines[0] });
    var lineTwo = el('p', { class: 'intro-line', text: lines[2] });
    var skip = el('button', { type: 'button', class: 'intro-skip', text: 'skip' });

    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-label', 'Opening');
    host.appendChild(el('div', { class: 'intro-moon', 'aria-hidden': 'true' }));
    host.appendChild(el('div', { class: 'intro-lines' }, [lineOne, lineTwo]));
    host.appendChild(skip);
    host.hidden = false;
    document.body.classList.add('is-opening');

    function finish() {
      if (done) return;
      done = true;
      timers.forEach(window.clearTimeout);
      window.removeEventListener('keydown', onKey);
      host.classList.add('is-out');
      if (release) release();
      window.setTimeout(function () {
        if (host.parentNode) host.parentNode.removeChild(host);
        document.body.classList.remove('is-opening');
        var stage = document.getElementById('stage');
        if (stage) stage.focus({ preventScroll: true });
        if (resolveRun) resolveRun();
      }, reduced ? 160 : 520);
    }

    function onKey(event) {
      if (event.key === 'Tab') return; /* let focus move without killing the moment */
      finish();
    }

    skip.addEventListener('click', finish);
    host.addEventListener('click', finish);

    var at = reduced
      ? { moon: 0, one: 150, oneOut: 1000, two: 1150, twoOut: 2000, end: 2100 }
      : { moon: 80, one: 600, oneOut: 2000, two: 2200, twoOut: 3600, end: 4100 };

    function queue(ms, fn) { timers.push(window.setTimeout(fn, ms)); }

    queue(at.moon, function () { host.classList.add('is-lit'); });
    queue(at.one, function () { lineOne.classList.add('is-in'); });
    queue(at.oneOut, function () { lineOne.classList.remove('is-in'); });
    queue(at.two, function () { lineTwo.classList.add('is-in'); });
    queue(at.twoOut, function () { lineTwo.classList.remove('is-in'); });
    queue(at.end, finish);

    release = util.trapFocus(host, finish);
    skip.focus({ preventScroll: true });

    return new Promise(function (resolve) { resolveRun = resolve; });
  }

  NIGHT.intro = { run: run };
})();
