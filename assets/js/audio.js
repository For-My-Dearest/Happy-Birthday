/* ============================================================================
   audio.js — the only thing in the house allowed to make a sound.

   Two sources exist: the playlist and the poem. Starting one always stops the
   other, so the night never talks over itself. The state lives here rather
   than in any room, which is what lets a song keep playing while she walks
   from the music room to the letter and back.

   Nothing ever autoplays: every play() in this file is downstream of a click.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var content = NIGHT.content;
  var bus = NIGHT.util.emitter();

  var VOLUME_KEY = 'night.volume';

  var playlistEl = new Audio();
  playlistEl.preload = 'none';

  var poemEl = new Audio();
  poemEl.preload = 'none';

  var state = {
    /* playlist */
    index: -1,          /* -1 means nothing has been chosen yet */
    playing: false,
    current: 0,
    duration: 0,
    volume: readVolume(),
    muted: false,
    error: null,
    started: false,     /* has the playlist ever been started? drives the mini player */
    /* poem */
    poemPlaying: false,
    poemError: false
  };

  playlistEl.volume = state.volume;
  poemEl.volume = state.volume;

  function readVolume() {
    try {
      var stored = parseFloat(window.localStorage.getItem(VOLUME_KEY));
      return isFinite(stored) ? NIGHT.util.clamp(stored, 0, 1) : 0.85;
    } catch (err) { return 0.85; }
  }

  function saveVolume(value) {
    try { window.localStorage.setItem(VOLUME_KEY, String(value)); } catch (err) { /* private mode */ }
  }

  function track(index) { return content.playlist.tracks[index] || null; }

  function trackSrc(index) {
    var item = track(index);
    if (!item) return '';
    return content.playlist.folder + encodeURIComponent(item.file);
  }

  function emitState() { bus.emit('state', state); }

  /* ---- playlist --------------------------------------------------------- */

  function load(index) {
    state.index = index;
    state.error = null;
    state.current = 0;
    state.duration = track(index) ? track(index).seconds : 0;
    playlistEl.src = trackSrc(index);
    playlistEl.load();
    bus.emit('track', state);
  }

  function play(index) {
    if (typeof index === 'number' && index !== state.index) load(index);
    if (state.index < 0) load(0);
    stopPoem();
    var attempt = playlistEl.play();
    state.started = true;
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        state.error = 'play';
        state.playing = false;
        emitState();
      });
    }
  }

  function pause() { playlistEl.pause(); }

  function toggle(index) {
    if (typeof index === 'number' && index !== state.index) { play(index); return; }
    if (playlistEl.paused) play(); else pause();
  }

  function step(delta) {
    var total = content.playlist.tracks.length;
    if (!total) return;
    var next = state.index < 0 ? 0 : (state.index + delta + total) % total;
    var wasPlaying = state.playing || state.index < 0;
    load(next);
    if (wasPlaying) play();
  }

  /* Pressing "previous" restarts the track first, the way a real player does. */
  function previous() {
    if (state.playing && playlistEl.currentTime > 3) { playlistEl.currentTime = 0; return; }
    step(-1);
  }

  function seek(seconds) {
    if (!isFinite(playlistEl.duration)) return;
    playlistEl.currentTime = NIGHT.util.clamp(seconds, 0, playlistEl.duration);
    state.current = playlistEl.currentTime;
    bus.emit('time', state);
  }

  function nudge(seconds) { seek((playlistEl.currentTime || 0) + seconds); }

  function setVolume(value) {
    state.volume = NIGHT.util.clamp(value, 0, 1);
    state.muted = state.volume === 0;
    playlistEl.volume = state.volume;
    poemEl.volume = state.volume;
    playlistEl.muted = false;
    poemEl.muted = false;
    saveVolume(state.volume);
    emitState();
  }

  function toggleMute() {
    state.muted = !state.muted;
    playlistEl.muted = state.muted;
    poemEl.muted = state.muted;
    emitState();
  }

  function retry() {
    if (state.index < 0) return;
    load(state.index);
    play();
  }

  playlistEl.addEventListener('play', function () { state.playing = true; state.error = null; emitState(); });
  playlistEl.addEventListener('pause', function () { state.playing = false; emitState(); });
  playlistEl.addEventListener('timeupdate', function () {
    state.current = playlistEl.currentTime;
    bus.emit('time', state);
  });
  playlistEl.addEventListener('loadedmetadata', function () {
    if (isFinite(playlistEl.duration)) state.duration = playlistEl.duration;
    bus.emit('time', state);
  });
  playlistEl.addEventListener('ended', function () {
    var total = content.playlist.tracks.length;
    if (state.index >= total - 1) { state.playing = false; emitState(); return; }
    step(1);
  });
  playlistEl.addEventListener('error', function () {
    state.error = 'load';
    state.playing = false;
    emitState();
  });

  /* ---- poem ------------------------------------------------------------- */

  function playPoem() {
    pause();
    if (!poemEl.src) poemEl.src = content.poem.audio;
    var attempt = poemEl.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        state.poemError = true;
        state.poemPlaying = false;
        bus.emit('poem', state);
      });
    }
  }

  function stopPoem() { poemEl.pause(); }

  function togglePoem() { poemEl.paused ? playPoem() : stopPoem(); }

  poemEl.addEventListener('play', function () { state.poemPlaying = true; state.poemError = false; bus.emit('poem', state); });
  poemEl.addEventListener('pause', function () { state.poemPlaying = false; bus.emit('poem', state); });
  poemEl.addEventListener('ended', function () { state.poemPlaying = false; bus.emit('poem', state); });
  poemEl.addEventListener('error', function () { state.poemError = true; state.poemPlaying = false; bus.emit('poem', state); });

  NIGHT.audio = {
    state: state,
    on: bus.on,
    track: track,
    play: play, pause: pause, toggle: toggle, retry: retry,
    next: function () { step(1); },
    previous: previous,
    seek: seek, nudge: nudge,
    setVolume: setVolume, toggleMute: toggleMute,
    playPoem: playPoem, stopPoem: stopPoem, togglePoem: togglePoem
  };
})();
