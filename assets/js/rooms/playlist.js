/* ============================================================================
   playlist.js — the music room.

   One metaphor, carried all the way through: a record, turning under the moon.
   No cassette, no vinyl-plus-cassette-plus-music-box pile-up.

   The room owns none of the audio. It draws NIGHT.audio and sends it
   instructions, which is why a song survives the walk to another room and why
   the mini player and this player can never disagree with each other.

   Seek and volume are real range inputs: they arrive keyboard-operable and
   screen-reader-labelled for free, and styling them is cheaper than rebuilding
   what a slider already does correctly.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;
  var audio = NIGHT.audio;

  var ui = null;
  var offs = [];
  var seeking = false;

  function content() { return NIGHT.content.playlist; }

  /* ---- painting --------------------------------------------------------- */

  function paintTrack() {
    if (!ui) return;
    var state = audio.state;
    var track = audio.track(state.index);
    var chosen = !!track;

    ui.number.textContent = chosen ? String(track.n).padStart(2, '0') : '';
    ui.label.textContent = chosen ? String(track.n).padStart(2, '0') : '';
    ui.title.textContent = chosen ? track.title : 'Nothing chosen yet';
    ui.title.classList.remove('is-new');
    /* force the entry animation to restart on every change */
    void ui.title.offsetWidth;
    if (chosen) ui.title.classList.add('is-new');

    ui.rows.forEach(function (row, index) {
      var current = index === state.index;
      row.classList.toggle('is-current', current);
      row.setAttribute('aria-current', current ? 'true' : 'false');
    });

    ui.seek.max = String(Math.max(1, Math.round(state.duration || (track ? track.seconds : 1))));
    ui.duration.textContent = util.time(state.duration || (track ? track.seconds : 0));
    paintTime();
    paintError();
  }

  function paintState() {
    if (!ui) return;
    var state = audio.state;
    ui.play.innerHTML = NIGHT.icons.ui(state.playing ? 'pause' : 'play');
    var label = state.playing ? 'Pause' : 'Play';
    ui.play.setAttribute('aria-label', label);
    ui.play.setAttribute('title', label);
    ui.disc.classList.toggle('is-spinning', state.playing);
    ui.room.classList.toggle('is-playing', state.playing);

    ui.mute.innerHTML = NIGHT.icons.ui(state.muted ? 'mute' : 'volume');
    ui.mute.setAttribute('aria-label', state.muted ? 'Unmute' : 'Mute');
    ui.mute.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
    ui.volume.value = String(Math.round(state.volume * 100));
    paintError();
  }

  function paintTime() {
    if (!ui || seeking) return;
    var state = audio.state;
    ui.elapsed.textContent = util.time(state.current);
    if (state.duration) ui.seek.max = String(Math.round(state.duration));
    ui.seek.value = String(Math.round(state.current));
    var ratio = state.duration ? state.current / state.duration : 0;
    ui.seek.style.setProperty('--played', (ratio * 100).toFixed(2) + '%');
  }

  function paintError() {
    if (!ui) return;
    /* only a chosen song can fail; an untouched player is not an error */
    var failed = !!audio.state.error && audio.state.index >= 0;
    ui.error.hidden = !failed;
    ui.room.classList.toggle('has-error', failed);
  }

  /* ---- pieces ----------------------------------------------------------- */

  function buildRow(track, index) {
    var row = el('button', {
      type: 'button',
      class: 'track',
      onclick: function () { audio.toggle(index); }
    }, [
      el('span', { class: 'track-n', 'aria-hidden': 'true', text: String(track.n).padStart(2, '0') }),
      el('span', { class: 'track-title', text: track.title }),
      el('span', { class: 'track-time', text: util.time(track.seconds) }),
      el('span', {
        class: 'track-wave',
        'aria-hidden': 'true',
        html: '<i></i><i></i><i></i>'
      })
    ]);
    row.setAttribute('aria-label', 'Play ' + track.title + ', track ' + track.n + ' of ' + content().tracks.length);
    return row;
  }

  function onKey(event) {
    if (!ui) return;
    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    switch (event.key) {
      case ' ': case 'k':
        event.preventDefault(); audio.toggle(); break;
      case 'ArrowRight':
        event.preventDefault(); audio.nudge(5); break;
      case 'ArrowLeft':
        event.preventDefault(); audio.nudge(-5); break;
      case 'ArrowUp':
        event.preventDefault(); audio.setVolume(audio.state.volume + 0.05); break;
      case 'ArrowDown':
        event.preventDefault(); audio.setVolume(audio.state.volume - 0.05); break;
      case 'n':
        audio.next(); break;
      case 'p':
        audio.previous(); break;
      case 'Escape':
        NIGHT.router.go('hub'); break;
      default: break;
    }
  }

  /* ---- room ------------------------------------------------------------- */

  function mount(stage) {
    var data = content();

    var label = el('span', { class: 'disc-label', 'aria-hidden': 'true' });
    var disc = el('div', { class: 'disc', 'aria-hidden': 'true' }, [
      el('span', { class: 'disc-grooves' }),
      el('span', { class: 'disc-center' }, [label])
    ]);

    var number = el('p', { class: 'now-number' });
    var title = el('h2', { class: 'now-title' });

    var elapsed = el('span', { class: 'time', text: '0:00' });
    var duration = el('span', { class: 'time', text: '0:00' });

    var seek = el('input', {
      type: 'range', class: 'seek', min: '0', max: '1', step: '1', value: '0',
      'aria-label': 'Seek through the song'
    });
    seek.addEventListener('input', function () {
      seeking = true;
      elapsed.textContent = util.time(+seek.value);
      var ratio = +seek.value / Math.max(1, +seek.max);
      seek.style.setProperty('--played', (ratio * 100).toFixed(2) + '%');
    });
    ['change', 'pointerup', 'keyup'].forEach(function (type) {
      seek.addEventListener(type, function () {
        audio.seek(+seek.value);
        seeking = false;
      });
    });

    var play = util.iconButton('play', 'Play', function () { audio.toggle(); }, { class: 'ctl ctl--main' });
    var prev = util.iconButton('prev', 'Previous song', function () { audio.previous(); }, { class: 'ctl' });
    var next = util.iconButton('next', 'Next song', function () { audio.next(); }, { class: 'ctl' });
    var mute = util.iconButton('volume', 'Mute', function () { audio.toggleMute(); }, { class: 'ctl ctl--small' });

    var volume = el('input', {
      type: 'range', class: 'volume', min: '0', max: '100', step: '1',
      value: String(Math.round(audio.state.volume * 100)),
      'aria-label': 'Volume'
    });
    volume.addEventListener('input', function () { audio.setVolume(+volume.value / 100); });

    var error = el('p', { class: 'room-error', role: 'status', hidden: true }, [
      el('span', { text: 'Something seems to be keeping this song quiet.' }),
      el('button', { type: 'button', class: 'ctl-text', text: 'try again', onclick: function () { audio.retry(); } })
    ]);

    var rows = data.tracks.map(buildRow);

    var list = el('ol', { class: 'tracks' }, rows.map(function (row) {
      return el('li', {}, [row]);
    }));

    var room = el('section', { class: 'music-room' }, [
      el('div', { class: 'deck' }, [
        el('div', { class: 'deck-art' }, [disc]),
        el('div', { class: 'deck-now' }, [
          number,
          title,
          el('div', { class: 'deck-seek' }, [elapsed, seek, duration]),
          el('div', { class: 'deck-controls' }, [
            prev, play, next,
            el('div', { class: 'deck-volume' }, [mute, volume])
          ]),
          error
        ])
      ]),
      el('div', { class: 'deck-list' }, [
        el('div', { class: 'deck-list__head' }, [
          el('p', { class: 'eyebrow', text: data.title }),
          el('p', { class: 'deck-list__note', text: data.note })
        ]),
        list,
        el('p', { class: 'deck-keys', text: 'Space plays. \u2190 \u2192 move through the song. \u2191 \u2193 change the volume.' })
      ])
    ]);

    ui = {
      room: room, disc: disc, label: label, number: number, title: title,
      elapsed: elapsed, duration: duration, seek: seek, play: play,
      mute: mute, volume: volume, rows: rows, error: error
    };

    stage.appendChild(room);

    offs.push(audio.on('track', paintTrack));
    offs.push(audio.on('state', paintState));
    offs.push(audio.on('time', paintTime));
    document.addEventListener('keydown', onKey);

    paintTrack();
    paintState();
  }

  function unmount() {
    offs.forEach(function (off) { off(); });
    offs = [];
    document.removeEventListener('keydown', onKey);
    ui = null;
    seeking = false;
  }

  NIGHT.router.register({ id: 'playlist', title: 'The Playlist', mount: mount, unmount: unmount });
})();
