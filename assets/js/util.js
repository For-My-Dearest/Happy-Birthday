/* ============================================================================
   util.js — small shared tools. No framework, no dependencies.
   Loaded as a classic script so the whole site also works when the folder is
   opened straight from disk (file://), where ES modules are blocked.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- DOM ------------------------------------------------------------- */

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'html') node.innerHTML = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'dataset') Object.keys(value).forEach(function (d) { node.dataset[d] = value[d]; });
        else if (key.slice(0, 2) === 'on' && typeof value === 'function') node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : value);
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function qs(selector, scope) { return (scope || document).querySelector(selector); }
  function qsa(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  /* A button that carries an icon and an accessible name. */
  function iconButton(icon, label, onClick, extra) {
    var props = {
      type: 'button',
      class: 'btn-icon' + (extra && extra.class ? ' ' + extra.class : ''),
      'aria-label': label,
      title: label,
      html: NIGHT.icons.ui(icon),
      onclick: onClick
    };
    if (extra && extra.attrs) Object.keys(extra.attrs).forEach(function (k) { props[k] = extra.attrs[k]; });
    return el('button', props);
  }

  /* ---- events ----------------------------------------------------------- */

  function emitter() {
    var map = {};
    return {
      on: function (name, fn) {
        (map[name] = map[name] || []).push(fn);
        return function () { off(name, fn); };
      },
      off: off,
      emit: function (name, payload) {
        (map[name] || []).slice().forEach(function (fn) {
          try { fn(payload); } catch (err) { console.error(err); }
        });
      }
    };
    function off(name, fn) {
      map[name] = (map[name] || []).filter(function (f) { return f !== fn; });
    }
  }

  /* ---- formatting ------------------------------------------------------- */

  function time(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '--:--';
    var whole = Math.floor(seconds);
    var m = Math.floor(whole / 60);
    var s = whole % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* Persian-Indic digits, for the poem's counters and indicators. */
  function faDigits(value) {
    var map = ['\u06F0', '\u06F1', '\u06F2', '\u06F3', '\u06F4', '\u06F5', '\u06F6', '\u06F7', '\u06F8', '\u06F9'];
    return String(value).replace(/\d/g, function (d) { return map[+d]; });
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  /* ---- motion ----------------------------------------------------------- */

  var motion = {
    get reduced() { return motionQuery.matches; },
    onChange: function (fn) {
      if (motionQuery.addEventListener) motionQuery.addEventListener('change', fn);
      else if (motionQuery.addListener) motionQuery.addListener(fn);
    }
  };

  /* Resolves after `ms`, or immediately when the visitor asked for less motion. */
  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, motion.reduced ? Math.min(ms, 120) : ms);
    });
  }

  /* ---- announcements ---------------------------------------------------- */

  var toastTimer = null;

  function toast(message) {
    var host = document.getElementById('toasts');
    if (!host) return;
    clear(host);
    var node = el('p', { class: 'toast', text: message });
    host.appendChild(node);
    announce(message);
    window.clearTimeout(toastTimer);
    /* next frame so the entry transition actually runs */
    requestAnimationFrame(function () { node.classList.add('is-in'); });
    toastTimer = window.setTimeout(function () {
      node.classList.remove('is-in');
      window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 400);
    }, 2400);
  }

  function announce(message) {
    var live = document.getElementById('live');
    if (live) live.textContent = message;
  }

  /* ---- clipboard -------------------------------------------------------- */

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(area);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  /* ---- focus ------------------------------------------------------------ */

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  /* Keeps tab focus inside a dialog and restores it afterwards. */
  function trapFocus(container, onEscape) {
    var previous = document.activeElement;

    function onKey(event) {
      if (event.key === 'Escape') { event.stopPropagation(); onEscape(); return; }
      if (event.key !== 'Tab') return;
      var items = qsa(FOCUSABLE, container).filter(function (n) { return n.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    container.addEventListener('keydown', onKey);
    return function release() {
      container.removeEventListener('keydown', onKey);
      if (previous && previous.focus) previous.focus();
    };
  }

  /* Loads a script once; used for the heavy parts of the last room. */
  var loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (resolve, reject) {
      var tag = document.createElement('script');
      tag.src = src;
      tag.async = true;
      tag.onload = function () { resolve(); };
      tag.onerror = function () { loaded[src] = null; reject(new Error('could not load ' + src)); };
      document.head.appendChild(tag);
    });
    return loaded[src];
  }

  NIGHT.util = {
    el: el, qs: qs, qsa: qsa, clear: clear, iconButton: iconButton,
    emitter: emitter, time: time, faDigits: faDigits, clamp: clamp,
    motion: motion, wait: wait, toast: toast, announce: announce,
    copyText: copyText, trapFocus: trapFocus, loadScript: loadScript
  };
})();
