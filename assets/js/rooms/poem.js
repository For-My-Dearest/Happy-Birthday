/* ============================================================================
   poem.js — «دو چشمانت».

   The original page already had the right idea, so it was kept rather than
   redesigned: the moon is still the only play button, the starfield is still
   the background, the cats are still in the corners, and the verses are
   untouched. What changed is that it is now a room in a house instead of a
   separate file — same sky overhead, and its audio answers to the same rule
   as everything else, so starting the poem quiets the playlist.

   Typography is real Persian typography: Aref Ruqaa for the display line,
   Noto Naskh Arabic for the verse, RTL throughout, Persian numerals.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;
  var audio = NIGHT.audio;

  var ui = null;
  var offs = [];

  function paint() {
    if (!ui) return;
    var poem = NIGHT.content.poem;
    var playing = audio.state.poemPlaying;

    ui.moon.setAttribute('aria-pressed', playing ? 'true' : 'false');
    ui.caption.textContent = audio.state.poemError
      ? poem.labels.missing
      : (playing ? poem.labels.playing : poem.labels.idle);
    ui.room.classList.toggle('is-listening', playing);
  }

  function copyPoem() {
    var poem = NIGHT.content.poem;
    var text = poem.stanzas.map(function (stanza) { return stanza.join('\n'); }).join('\n\n');
    util.copyText(text).then(function () {
      ui.copy.classList.add('is-copied');
      ui.copyText.textContent = poem.labels.copied;
      util.toast(poem.labels.copied);
      window.clearTimeout(copyPoem.timer);
      copyPoem.timer = window.setTimeout(function () {
        if (!ui) return;
        ui.copy.classList.remove('is-copied');
        ui.copyText.textContent = poem.labels.copy;
      }, 2400);
    }).catch(function () {
      util.toast('\u0645\u062A\u0646 \u06A9\u067E\u06CC \u0646\u0634\u062F');
    });
  }

  function stanza(lines, index) {
    var block = el('div', { class: 'stanza' }, lines.map(function (line) {
      return el('p', { class: 'verse', text: line });
    }));
    block.style.setProperty('--s', String(index));
    return block;
  }

  function mount(stage) {
    var poem = NIGHT.content.poem;

    var moon = el('button', {
      type: 'button',
      class: 'moon-player',
      'aria-pressed': 'false',
      'aria-label': poem.labels.play,
      onclick: function () { audio.togglePoem(); }
    }, []);
    moon.innerHTML =
      '<span class="ring ring--1"></span><span class="ring ring--2"></span>' +
      NIGHT.icons.poemMoon() +
      '<span class="play-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" class="icon-play"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg viewBox="0 0 24 24" class="icon-pause"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' +
      '</span>';

    var caption = el('p', { class: 'player-caption', role: 'status', text: poem.labels.idle });

    var download = el('a', {
      class: 'download-link',
      href: poem.audio,
      download: poem.audioName,
      html: NIGHT.icons.ui('download') + '<span>' + poem.labels.download + '</span>'
    });

    var copyLabel = el('span', { class: 'copy-btn__text', text: poem.labels.copy });
    var copy = el('button', {
      type: 'button',
      class: 'copy-btn',
      'aria-label': poem.labels.copy,
      onclick: copyPoem
    }, [
      el('span', { class: 'copy-icons', 'aria-hidden': 'true', html: NIGHT.icons.ui('copy') + NIGHT.icons.ui('check') }),
      copyLabel
    ]);

    var verses = el('div', { class: 'poem', dir: 'rtl', lang: 'fa' }, poem.stanzas.reduce(function (nodes, lines, index) {
      nodes.push(stanza(lines, index));
      if (index < poem.stanzas.length - 1) {
        nodes.push(el('span', { class: 'stanza-rule', 'aria-hidden': 'true', html: NIGHT.icons.divider() }));
      }
      return nodes;
    }, []));

    var room = el('section', { class: 'poem-room', lang: 'fa', dir: 'rtl' }, [
      el('div', { class: 'poem-hero' }, [
        el('div', { class: 'poem-cat poem-cat--left', 'aria-hidden': 'true', html: NIGHT.icons.poemCat('left') }),
        el('div', { class: 'poem-cat poem-cat--right', 'aria-hidden': 'true', html: NIGHT.icons.poemCat('right') }),
        moon,
        caption,
        download,
        el('div', { class: 'poem-title' }, [
          el('h1', { text: poem.title }),
          el('p', { class: 'poem-sub', text: poem.subtitle })
        ])
      ]),
      el('article', { class: 'poem-card' }, [
        el('div', { class: 'poem-card__head' }, [
          el('span', { class: 'eyebrow eyebrow--fa', text: poem.labels.full }),
          copy
        ]),
        verses
      ]),
      el('footer', { class: 'poem-foot' }, [
        el('span', { class: 'poem-foot__moon', 'aria-hidden': 'true', html: NIGHT.icons.ui('moon') }),
        el('p', { text: poem.labels.footer })
      ])
    ]);

    ui = { room: room, moon: moon, caption: caption, copy: copy, copyText: copyLabel };
    stage.appendChild(room);

    offs.push(audio.on('poem', paint));
    paint();
  }

  function unmount() {
    offs.forEach(function (off) { off(); });
    offs = [];
    window.clearTimeout(copyPoem.timer);
    /* The moon is the only control this recording has, so it does not follow
       her out of the room: leaving the poem stops the poem. */
    audio.stopPoem();
    ui = null;
  }

  NIGHT.router.register({ id: 'poem', title: '\u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A', mount: mount, unmount: unmount });
})();
