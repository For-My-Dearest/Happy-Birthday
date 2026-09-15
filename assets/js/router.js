/* ============================================================================
   router.js — moving between rooms.

   Rooms register themselves as { id, title, mount(stage), unmount() }. The URL
   hash carries the current room so a refresh lands where she was, and the
   whole thing stays a single page: the starfield, the atmosphere and any song
   that is playing survive the walk from one room to the next.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var rooms = {};
  var current = null;
  var busy = false;
  var pending = null;

  function register(room) { rooms[room.id] = room; }

  function idFromHash() {
    var raw = (window.location.hash || '').replace(/^#\/?/, '').trim();
    return rooms[raw] ? raw : 'hub';
  }

  function go(id) {
    if (!rooms[id]) id = 'hub';
    var target = id === 'hub' ? '#/' : '#/' + id;
    if (window.location.hash === target) { render(id); return; }
    window.location.hash = target;
  }

  function render(id) {
    if (busy) { pending = id; return; }
    if (current && current.id === id) return;

    var stage = document.getElementById('stage');
    var room = rooms[id] || rooms.hub;
    busy = true;

    var leaving = !!current;
    if (leaving) stage.classList.add('is-leaving');

    util.wait(leaving ? 340 : 0).then(function () {
      if (current && current.unmount) {
        try { current.unmount(); } catch (err) { console.error(err); }
      }
      util.clear(stage);

      document.body.dataset.room = room.id;
      document.documentElement.dataset.room = room.id;

      var backlink = document.getElementById('backlink');
      if (backlink) backlink.hidden = room.id === 'hub';

      stage.classList.remove('is-leaving');
      stage.classList.add('is-entering');
      stage.setAttribute('aria-label', room.title);

      current = room;
      room.mount(stage);

      document.title = room.id === 'hub'
        ? 'A night for you'
        : room.title + ' \u00B7 A night for you';

      requestAnimationFrame(function () {
        stage.classList.remove('is-entering');
        /* Focus the room itself: a screen reader hears its name, and the
           keyboard tab order restarts from the top of the new room. */
        stage.focus({ preventScroll: true });
        window.scrollTo(0, 0);
        util.announce(room.title);
      });

      return util.wait(320);
    }).then(function () {
      busy = false;
      if (pending && pending !== current.id) {
        var next = pending;
        pending = null;
        render(next);
      } else {
        pending = null;
      }
      NIGHT.miniplayer && NIGHT.miniplayer.sync();
    });
  }

  function start() {
    window.addEventListener('hashchange', function () { render(idFromHash()); });
    render(idFromHash());
  }

  NIGHT.router = {
    register: register,
    go: go,
    start: start,
    get currentId() { return current ? current.id : null; }
  };
})();
