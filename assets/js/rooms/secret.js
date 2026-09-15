/* ============================================================================
   secret.js — The Last Lock.

   How this works, and why:

   There is no password field checking against a stored answer, because there
   is no stored answer. The archive that came with the gift is still sealed
   exactly as it arrived (AES, untouched), and the only thing that happens when
   she turns the key is that the site tries to decrypt it with what she typed.
   Right words, the archive opens. Wrong words, nothing happens. The answer is
   not in this file, not in the HTML, not in a hash, not in a data attribute —
   it was never given to this project in the first place.

   That also means this is not a security system and is not claimed to be one:
   the sealed bytes are sitting in the page, and anyone determined enough could
   attack them offline. It is a lock on a bedroom door, not a bank vault. What
   it does guarantee is that the experience cannot be spoiled by reading the
   source, which is the part that actually matters here.

   The clue is reproduced word for word from HINT.md and split into the stages
   the clue itself describes: first key, second key, then the joining rule.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;

  var ZIP_LIB = 'assets/vault/zip.min.js';
  var SEALED = 'assets/vault/sealed.js';

  /* Kept in memory only, for as long as the tab is open. Nothing about the
     key is ever written to storage. */
  var keys = ['', ''];
  var stage = 'door';
  var misses = 0;
  var opened = null;   /* { url } once the archive has been opened */
  var working = false;
  var ui = null;

  /* ---- the attempt ------------------------------------------------------ */

  function normalise(value) {
    return String(value)
      .toLowerCase()
      /* every kind of space, including the zero-width joiner Persian uses */
      .replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, '');
  }

  function asciiDigits(value) {
    return value
      .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }

  /* The clue says: join, no spaces, no uppercase, order matters. That is the
     first candidate. The rest are small mercies for typing habits — curly
     apostrophes, Persian digits, stray punctuation — so that being right is
     never punished by a keyboard. */
  function candidates() {
    var a = keys[0];
    var b = keys[1];
    var joined = a + b;
    var base = normalise(joined);
    var list = [
      base,
      asciiDigits(base),
      base.replace(/[^\p{L}\p{N}]/gu, ''),
      asciiDigits(base).replace(/[^\p{L}\p{N}]/gu, ''),
      base.replace(/[\u2018\u2019\u02BC]/g, "'"),
      joined.trim(),
      a.trim() + b.trim()
    ];
    var seen = {};
    return list.filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function sealedBytes() {
    var raw = window.atob(window.NIGHT_SEALED);
    var bytes = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function loadTools() {
    return util.loadScript(ZIP_LIB).then(function () { return util.loadScript(SEALED); });
  }

  function tryOpen(password, bytes) {
    var reader = new window.zip.ZipReader(new window.zip.Uint8ArrayReader(bytes), { password: password });
    return reader.getEntries()
      .then(function (entries) {
        if (!entries.length) throw new Error('empty archive');
        return entries[0].getData(new window.zip.Uint8ArrayWriter());
      })
      .then(function (data) {
        return reader.close().then(function () { return data; });
      })
      .catch(function (err) {
        return reader.close().catch(function () {}).then(function () { throw err; });
      });
  }

  function turnKey() {
    if (working || !keys[0].trim() || !keys[1].trim()) return;
    working = true;
    setBusy(true);

    loadTools()
      .then(function () {
        window.zip.configure({ useWebWorkers: false });
        var bytes = sealedBytes();
        var list = candidates();

        return list.reduce(function (chain, password) {
          return chain.then(function (found) {
            if (found) return found;
            return tryOpen(password, bytes).catch(function () { return null; });
          });
        }, Promise.resolve(null));
      })
      .then(function (data) {
        working = false;
        setBusy(false);
        if (data) succeed(data);
        else fail();
      })
      .catch(function (err) {
        console.error(err);
        working = false;
        setBusy(false);
        say('The lock will not move at all right now. Try once more in a moment.');
      });
  }

  function setBusy(state) {
    if (!ui) return;
    ui.room.classList.toggle('is-working', state);
    ui.turn.disabled = state;
    ui.turn.textContent = state ? 'turning\u2026' : NIGHT.content.secret.turn;
  }

  function fail() {
    misses++;
    var lines = NIGHT.content.secret.misses;
    say(lines[Math.min(misses - 1, lines.length - 1)]);
    if (!ui) return;
    ui.plate.classList.remove('is-wrong');
    void ui.plate.offsetWidth;
    ui.plate.classList.add('is-wrong');
  }

  function say(message) {
    if (!ui) return;
    ui.message.textContent = message;
    util.announce(message);
  }

  function succeed(data) {
    try {
      opened = { url: URL.createObjectURL(new Blob([data], { type: 'application/pdf' })) };
    } catch (err) {
      console.error(err);
      say('It opened, but these pages will not display here.');
      return;
    }
    if (!ui) return;
    ui.room.classList.add('is-open');
    say('');
    util.announce('The lock opens.');
    window.setTimeout(function () {
      stage = 'opened';
      rebuild();
    }, util.motion.reduced ? 200 : 1400);
  }

  /* ---- the room --------------------------------------------------------- */

  function plate() {
    var node = el('div', { class: 'plate', 'aria-hidden': 'true' });
    node.innerHTML =
      '<svg viewBox="0 0 200 200" focusable="false">' +
      '<circle class="plate-ring plate-ring--outer" cx="100" cy="100" r="86"/>' +
      '<circle class="plate-ring" cx="100" cy="100" r="72"/>' +
      '<circle class="plate-face" cx="100" cy="100" r="58"/>' +
      '<path class="plate-hole" d="M108 82a22 22 0 1 0 1 36 26 26 0 0 1-1-36Z"/>' +
      '<g class="plate-notch plate-notch--1"><circle cx="100" cy="24" r="4.5"/></g>' +
      '<g class="plate-notch plate-notch--2"><circle cx="100" cy="176" r="4.5"/></g>' +
      '<circle class="plate-glow" cx="100" cy="100" r="58"/>' +
      '</svg>';
    return node;
  }

  function stepper() {
    var marks = [
      { id: 'key-1', label: 'I' },
      { id: 'key-2', label: 'II' },
      { id: 'lock', label: '\u25CB' }
    ];
    return el('ol', { class: 'steps' }, marks.map(function (mark) {
      var reached = order(stage) >= order(mark.id);
      var button = el('button', {
        type: 'button',
        class: 'step' + (stage === mark.id ? ' is-here' : '') + (reached ? ' is-reached' : ''),
        text: mark.label,
        'aria-label': mark.id === 'lock' ? 'The lock' : 'Key ' + mark.label,
        'aria-current': stage === mark.id ? 'step' : null,
        onclick: function () { go(mark.id); }
      });
      return el('li', {}, [button]);
    }));
  }

  function order(id) {
    return ['door', 'key-1', 'key-2', 'lock', 'opened'].indexOf(id);
  }

  function go(next) {
    if (next === 'lock' && (!keys[0].trim() || !keys[1].trim())) {
      /* let her walk forward anyway; the lock explains what it still needs */
    }
    stage = next;
    rebuild();
  }

  function keyStage(index) {
    var data = NIGHT.content.secret.stages[index];
    var field = el('input', {
      type: 'text',
      class: 'key-input',
      id: 'field-' + data.id,
      value: keys[index],
      placeholder: data.placeholder,
      autocomplete: 'off',
      autocapitalize: 'none',
      autocorrect: 'off',
      spellcheck: 'false',
      'aria-describedby': 'clue-' + data.id
    });
    field.addEventListener('input', function () { keys[index] = field.value; });
    field.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); go(index === 0 ? 'key-2' : 'lock'); }
    });

    var onwards = el('button', {
      type: 'button',
      class: 'btn-quiet',
      text: index === 0 ? 'the second key' : 'the lock',
      onclick: function () { go(index === 0 ? 'key-2' : 'lock'); }
    });

    var back = index === 0
      ? null
      : el('button', { type: 'button', class: 'btn-ghost', text: 'back', onclick: function () { go('key-1'); } });

    return el('div', { class: 'chamber-panel' }, [
      el('p', { class: 'eyebrow', text: data.eyebrow }),
      el('div', { class: 'clue', id: 'clue-' + data.id }, [
        el('div', { class: 'clue-lines' }, data.lines.map(function (line) { return el('p', { text: line }); })),
        data.mark ? el('p', { class: 'clue-mark', text: data.mark }) : null,
        el('p', { class: 'clue-close', text: data.close })
      ]),
      el('div', { class: 'key-field' }, [
        el('label', { for: 'field-' + data.id, class: 'key-label', text: data.label }),
        field
      ]),
      el('div', { class: 'chamber-actions' }, [back, onwards])
    ]);
  }

  function lockStage() {
    var data = NIGHT.content.secret;

    var turn = el('button', { type: 'button', class: 'btn-key', text: data.turn, onclick: turnKey });
    var message = el('p', { class: 'lock-message', role: 'status' });

    var both = keys[0].trim() && keys[1].trim();
    if (!both) message.textContent = 'Both keys first. Go back for the one you are missing.';
    turn.disabled = !both;

    var combined = both
      ? el('p', { class: 'lock-combined' }, [
          el('span', { class: 'lock-combined__label', text: 'what you are about to turn' }),
          el('span', { class: 'lock-combined__value', text: normalise(keys[0] + keys[1]) })
        ])
      : null;

    var edits = el('div', { class: 'chamber-actions' }, [
      el('button', { type: 'button', class: 'btn-ghost', text: 'first key', onclick: function () { go('key-1'); } }),
      el('button', { type: 'button', class: 'btn-ghost', text: 'second key', onclick: function () { go('key-2'); } })
    ]);

    return el('div', { class: 'chamber-panel' }, [
      el('p', { class: 'eyebrow', text: 'The Lock' }),
      el('div', { class: 'clue' }, [
        el('div', { class: 'clue-lines' }, data.rule.map(function (line) { return el('p', { text: line }); })),
        el('p', { class: 'clue-sign', text: data.signoff })
      ]),
      combined,
      turn,
      message,
      edits
    ]);
  }

  function doorStage() {
    var data = NIGHT.content.secret;
    return el('div', { class: 'chamber-panel chamber-panel--door' }, [
      el('div', { class: 'clue-lines clue-lines--large' }, data.opening.map(function (line) {
        return el('p', { text: line });
      })),
      el('button', {
        type: 'button',
        class: 'btn-quiet',
        text: 'step closer',
        onclick: function () { go('key-1'); }
      })
    ]);
  }

  /* ---- the last artifact ------------------------------------------------ */

  function prologue() {
    var data = NIGHT.content.secret;
    var small = window.innerWidth < 760;

    var open = el('a', {
      class: 'btn-quiet',
      href: opened.url,
      target: '_blank',
      rel: 'noopener',
      html: NIGHT.icons.ui('external') + '<span>open</span>'
    });
    var save = el('a', {
      class: 'btn-ghost',
      href: opened.url,
      download: data.archive,
      html: NIGHT.icons.ui('download') + '<span>download</span>'
    });

    var tools = el('div', { class: 'reader-tools' }, [open, save]);

    /* Small screens almost never render an embedded PDF properly, and a blank
       grey rectangle is a worse ending than a clear invitation. */
    if (small) {
      return el('div', { class: 'reader reader--handoff' }, [
        el('p', { class: 'eyebrow', text: data.opened.title }),
        el('p', { class: 'reader-line', text: 'The final letter is ready.' }),
        tools
      ]);
    }

    var frame = el('div', { class: 'reader-frame' });
    frame.innerHTML =
      '<object data="' + opened.url + '" type="application/pdf" aria-label="' + data.opened.title + '">' +
      '<div class="reader-fallback"><p>The final pages cannot be opened here.</p></div>' +
      '</object>';

    var full = el('button', {
      type: 'button',
      class: 'btn-ghost',
      html: NIGHT.icons.ui('expand') + '<span>fullscreen</span>',
      onclick: function () {
        if (frame.requestFullscreen) frame.requestFullscreen();
        else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
      }
    });
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled) tools.appendChild(full);

    return el('div', { class: 'reader' }, [
      el('div', { class: 'reader-head' }, [
        el('div', {}, [
          el('p', { class: 'eyebrow', text: data.opened.title }),
          el('p', { class: 'reader-line', text: data.opened.line })
        ]),
        tools
      ]),
      frame,
      el('p', { class: 'reader-note', text: 'If nothing appears above, open or download it instead.' })
    ]);
  }

  /* ---- mount ------------------------------------------------------------ */

  function rebuild() {
    var host = ui && ui.host;
    if (!host) return;
    util.clear(host);
    render(host);
  }

  function render(host) {
    var data = NIGHT.content.secret;

    if (stage === 'opened' && opened) {
      var room = el('section', { class: 'chamber is-open is-finished' }, [prologue()]);
      ui.room = room;
      host.appendChild(room);
      var first = util.qs('a, button', room);
      if (first) first.focus({ preventScroll: true });
      return;
    }

    var art = plate();
    var body = stage === 'door' ? doorStage()
      : stage === 'key-1' ? keyStage(0)
      : stage === 'key-2' ? keyStage(1)
      : lockStage();

    var roomNode = el('section', { class: 'chamber' }, [
      el('header', { class: 'chamber-head' }, [
        el('h1', { class: 'chamber-title', text: data.title }),
        stage === 'door' ? null : stepper()
      ]),
      el('div', { class: 'chamber-body' }, [
        el('div', { class: 'chamber-art' }, [art]),
        body
      ])
    ]);

    host.appendChild(roomNode);

    ui.room = roomNode;
    ui.plate = art;
    ui.turn = util.qs('.btn-key', roomNode) || el('button');
    ui.message = util.qs('.lock-message', roomNode) || el('p');

    /* the two notches light as each key is given */
    roomNode.classList.toggle('has-key-1', !!keys[0].trim());
    roomNode.classList.toggle('has-key-2', !!keys[1].trim());

    var field = util.qs('.key-input', roomNode);
    if (field && stage !== 'door') field.focus({ preventScroll: true });
  }

  function mount(stageEl) {
    var host = el('div', { class: 'chamber-host' });
    ui = { host: host };
    stageEl.appendChild(host);
    if (stage === 'opened' && !opened) stage = 'lock';
    render(host);
  }

  function unmount() {
    ui = null;
    working = false;
  }

  NIGHT.router.register({ id: 'secret', title: 'The Last Lock', mount: mount, unmount: unmount });
})();
