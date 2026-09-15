/* ============================================================================
   miniplayer.js — the song follows her around.

   Appears only after she has started the playlist herself, and hides again
   inside the music room (where the full player already exists) so the two are
   never on screen at once. It is a real landmark with real buttons, not a
   floating decoration: tab order reaches it, and it never sits on top of the
   letter or the lock, because the rooms reserve space for it in CSS.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;
  var audio = NIGHT.audio;

  var host, openBtn, playBtn, nextBtn, titleEl, numberEl, bar;

  function build() {
    host = document.getElementById('miniplayer');
    if (!host || host.childElementCount) return;

    numberEl = el('span', { class: 'mini-number' });
    titleEl = el('span', { class: 'mini-title' });

    openBtn = el('button', {
      type: 'button',
      class: 'mini-open',
      onclick: function () { NIGHT.router.go('playlist'); }
    }, [numberEl, titleEl]);

    playBtn = util.iconButton('play', 'Play', function () { audio.toggle(); }, { class: 'mini-btn' });
    nextBtn = util.iconButton('next', 'Next song', function () { audio.next(); }, { class: 'mini-btn' });

    bar = el('span', { class: 'mini-bar__fill' });

    host.appendChild(el('div', { class: 'mini-inner' }, [
      el('span', { class: 'mini-mark', 'aria-hidden': 'true', html: NIGHT.icons.ui('moon') }),
      openBtn,
      el('div', { class: 'mini-controls' }, [playBtn, nextBtn])
    ]));
    host.appendChild(el('span', { class: 'mini-bar', 'aria-hidden': 'true' }, [bar]));

    audio.on('track', paint);
    audio.on('state', paint);
    audio.on('time', progress);
    paint();
  }

  function paint() {
    if (!host) return;
    var state = audio.state;
    var track = audio.track(state.index);

    if (track) {
      numberEl.textContent = String(track.n).padStart(2, '0');
      titleEl.textContent = track.title;
      openBtn.setAttribute('aria-label', 'Open the music room \u2014 now playing ' + track.title);
    }

    playBtn.innerHTML = NIGHT.icons.ui(state.playing ? 'pause' : 'play');
    var label = state.playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-label', label);
    playBtn.setAttribute('title', label);

    host.classList.toggle('is-playing', state.playing);
    sync();
    progress();
  }

  function progress() {
    if (!host || !bar) return;
    var state = audio.state;
    var ratio = state.duration ? util.clamp(state.current / state.duration, 0, 1) : 0;
    bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  /* Visible only when there is something to show, and never in the room that
     already has a full player. */
  function sync() {
    if (!host) return;
    var inMusicRoom = NIGHT.router.currentId === 'playlist';
    var shouldShow = audio.state.started && audio.state.index >= 0 && !inMusicRoom;
    host.hidden = !shouldShow;
    document.body.classList.toggle('has-mini', shouldShow);
  }

  NIGHT.miniplayer = { build: build, sync: sync };
})();
