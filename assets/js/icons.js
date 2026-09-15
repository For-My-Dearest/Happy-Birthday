/* ============================================================================
   icons.js — the drawing vocabulary of this site.

   The five hub glyphs are deliberately redrawn from the marginalia in the
   letter itself: the hanging crescent with its little stars, the tiny hearts,
   the sitting cat, the sprig of leaves. Nothing here is a stock icon set, so
   the world you walk around in is made of the same lines as the gift.

   Glyphs use a 48x48 box, UI icons a 24x24 box, both stroked in currentColor.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var G = {}; /* destination glyphs, 48x48 */

  /* An envelope with the heart seal that runs down the letter's margins. */
  G.envelope =
    '<path d="M6 15.5 24 27 42 15.5"/>' +
    '<rect x="6" y="12" width="36" height="24" rx="2.5"/>' +
    '<path d="M6 36 18.5 24.5M42 36 29.5 24.5"/>' +
    '<path class="g-accent" d="M24 20.6c-1.1-2.3-4.6-2-4.6.9 0 2.1 2.9 4 4.6 5.4 1.7-1.4 4.6-3.3 4.6-5.4 0-2.9-3.5-3.2-4.6-.9Z"/>';

  /* A record under the arm of a player, rather than three bare circles, which
     at this size read as a target. */
  G.record =
    '<circle cx="22" cy="26" r="16"/>' +
    '<circle cx="22" cy="26" r="6.5" opacity=".6"/>' +
    '<circle cx="22" cy="26" r="1.6" fill="currentColor" stroke="none"/>' +
    '<path class="g-accent" d="M40 9.5v9.2a4 4 0 0 1-1.3 3L30 29.5"/>' +
    '<circle class="g-accent" cx="40" cy="8" r="2.2"/>';

  /* The cat from the foot of the letter, sitting under a small moon. Drawn as
     a silhouette rather than an outline, because at 48px an outlined cat reads
     as an owl. */
  G.cat =
    '<path fill="currentColor" stroke="none" d="M24.5 41.5c-6.6 0-9.8-3.4-9.8-9.6 0-4.6 1.7-8.2 4-10.6l-1.2-7.6 5.4 3.6a11 11 0 0 1 3.2 0l5.4-3.6-1.2 7.6c2.3 2.4 4 6 4 10.6 0 6.2-3.2 9.6-9.8 9.6Z"/>' +
    '<path d="M34.3 41.5c5.5-.6 7.6-4.2 7.4-8.6-.1-3-1.6-4.8-3.6-4.6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="21.4" cy="26.4" r="1.1" fill="var(--ink-900, #070a1c)" stroke="none"/>' +
    '<circle cx="27.6" cy="26.4" r="1.1" fill="var(--ink-900, #070a1c)" stroke="none"/>' +
    '<path class="g-accent" d="M40 6.5a5.4 5.4 0 1 0 3.6 8.6A6 6 0 0 1 40 6.5Z" fill="currentColor" stroke="none"/>' +
    '<circle class="g-accent" cx="34.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>';

  /* A framed picture held by a pin — the board. */
  G.frame =
    '<rect x="9" y="13" width="30" height="26" rx="2"/>' +
    '<path d="M9 32.5 17.5 25l6.5 5.6 5.5-4.4L39 33"/>' +
    '<circle cx="18" cy="20.5" r="2.1"/>' +
    '<path class="g-accent" d="M24 13V8.5"/>' +
    '<circle class="g-accent" cx="24" cy="6.7" r="2.2"/>';

  /* A lock plate with a crescent keyhole. Two keys, two pins. */
  G.lock =
    '<rect x="9.5" y="21" width="29" height="18" rx="3"/>' +
    '<path d="M16 21v-4.5a8 8 0 0 1 16 0V21"/>' +
    '<path class="g-accent" d="M26.4 27.6a4 4 0 1 0 .2 6.3 4.7 4.7 0 0 1-.2-6.3Z"/>';

  /* The hanging crescent from the letter's top corner, stars on threads. */
  G.crescent =
    '<path d="M31 10.5A13 13 0 1 0 39.5 31 14.6 14.6 0 0 1 31 10.5Z"/>' +
    '<path class="g-accent" d="M14 28v7M21 32v9M27.5 34.5v5.5"/>' +
    '<path class="g-accent" d="m14 37.5 1 2.2 2.3.2-1.8 1.6.6 2.4-2.1-1.3-2.1 1.3.6-2.4-1.8-1.6 2.3-.2Z"/>' +
    '<circle class="g-accent" cx="21" cy="43" r="1.6"/>' +
    '<circle class="g-accent" cx="27.5" cy="42.5" r="1.2"/>';

  /* A sprig, as in the bottom-left corner of both pages. */
  G.sprig =
    '<path d="M24 44V14"/>' +
    '<path d="M24 34c-5 0-8-2.5-8.5-7 4.5-.6 7.7 1.8 8.5 7Z"/>' +
    '<path d="M24 26c5 0 8-2.5 8.5-7-4.5-.6-7.7 1.8-8.5 7Z"/>' +
    '<path d="M24 18c-4 0-6.5-2-7-5.6 3.6-.5 6.3 1.4 7 5.6Z"/>';

  G.heart = '<path d="M24 41C13 33.5 7 28 7 20.8 7 15.4 11 12 15.6 12c2.9 0 5.9 1.4 8.4 5 2.5-3.6 5.5-5 8.4-5C37 12 41 15.4 41 20.8 41 28 35 33.5 24 41Z"/>';

  var U = {}; /* interface icons, 24x24 */

  U.play = '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke-linejoin="round"/>';
  U.pause = '<path d="M9 5v14M15 5v14"/>';
  U.prev = '<path d="M18 6v12L9.5 12 18 6Z" fill="currentColor" stroke-linejoin="round"/><path d="M6.5 5.5v13"/>';
  U.next = '<path d="M6 6v12l8.5-6L6 6Z" fill="currentColor" stroke-linejoin="round"/><path d="M17.5 5.5v13"/>';
  U.volume = '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.3 6.6a8 8 0 0 1 0 10.8"/>';
  U.mute = '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>';
  U.left = '<path d="M15 5 8 12l7 7"/>';
  U.right = '<path d="m9 5 7 7-7 7"/>';
  U.up = '<path d="m5 15 7-7 7 7"/>';
  U.close = '<path d="M6 6l12 12M18 6 6 18"/>';
  U.zoomIn = '<circle cx="11" cy="11" r="6.5"/><path d="M11 8.5v5M8.5 11h5M15.8 15.8 20 20"/>';
  U.zoomOut = '<circle cx="11" cy="11" r="6.5"/><path d="M8.5 11h5M15.8 15.8 20 20"/>';
  U.copy = '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>';
  U.check = '<path d="m4.5 12.5 5 5L20 6.5"/>';
  U.download = '<path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 19.5h15"/>';
  U.external = '<path d="M14 4.5h5.5V10"/><path d="M19.5 4.5 11 13"/><path d="M17 14.5v4a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7h4"/>';
  U.expand = '<path d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15"/>';
  U.moon = '<path d="M17.2 4.6A8.4 8.4 0 1 0 20.4 16a9.2 9.2 0 0 1-3.2-11.4Z"/>';
  U.note = '<path d="M6.5 3.5h11l3 3v14h-14Z"/><path d="M9.5 9.5h8M9.5 13h8M9.5 16.5h5"/>';

  function wrap(box, body, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 ' + box + ' ' + box + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  NIGHT.icons = {
    glyph: function (name) { return wrap(48, G[name] || '', 'glyph'); },
    ui: function (name) { return wrap(24, U[name] || '', 'ico'); },
    has: function (name) { return !!(G[name] || U[name]); },

    /* The ornament used between stanzas of the poem and as a section rule. */
    divider: function () {
      return '<svg class="ornament" viewBox="0 0 60 20" aria-hidden="true" focusable="false">' +
        '<path d="M2 10c8-10 14-10 20 0s12 10 20 0 14-10 16-2" fill="none"/>' +
        '<circle cx="30" cy="6" r="2"/></svg>';
    },

    /* The moon of the poem room: disc, craters, and the rabbit in it. */
    poemMoon: function () {
      return '<svg class="moon-svg" viewBox="0 0 400 400" aria-hidden="true" focusable="false">' +
        '<defs>' +
        '<radialGradient id="moonGlow" cx="50%" cy="46%" r="60%">' +
        '<stop offset="0%" stop-color="var(--gold-bright)"/>' +
        '<stop offset="55%" stop-color="var(--gold)"/>' +
        '<stop offset="100%" stop-color="var(--gold-deep)"/>' +
        '</radialGradient>' +
        '<filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
        '</defs>' +
        '<circle class="moon-halo" cx="200" cy="200" r="185" fill="url(#moonGlow)" opacity="0.18" filter="url(#softBlur)"/>' +
        '<circle class="moon-disc" cx="200" cy="200" r="150" fill="url(#moonGlow)"/>' +
        '<ellipse cx="150" cy="150" rx="14" ry="11" class="crater"/>' +
        '<ellipse cx="250" cy="130" rx="9" ry="7" class="crater"/>' +
        '<ellipse cx="140" cy="230" rx="7" ry="6" class="crater"/>' +
        '<ellipse cx="255" cy="245" rx="12" ry="10" class="crater"/>' +
        '<g class="rabbit">' +
        '<ellipse cx="215" cy="205" rx="9" ry="30" transform="rotate(18 215 205)"/>' +
        '<ellipse cx="185" cy="205" rx="9" ry="30" transform="rotate(-18 185 205)"/>' +
        '<circle cx="200" cy="248" r="25"/>' +
        '<ellipse cx="200" cy="300" rx="42" ry="33"/>' +
        '</g></svg>';
    },

    /* The two cats that sit in the corners of the poem. */
    poemCat: function (side) {
      var tail = side === 'left'
        ? '<path d="M74,80 Q97,72 90,38 Q88,27 77,30" fill="none" stroke-width="6" stroke-linecap="round"/>'
        : '<path d="M26,80 Q3,74 8,42 Q10,31 21,33" fill="none" stroke-width="6" stroke-linecap="round"/>';
      return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g class="cat-shape">' +
        '<ellipse cx="50" cy="68" rx="25" ry="29"/>' +
        '<circle cx="50" cy="36" r="15.5"/>' +
        '<polygon points="36.5,25 42.5,9.5 50,23"/>' +
        '<polygon points="63.5,25 57.5,9.5 50,23"/>' +
        tail + '</g></svg>';
    }
  };
})();
