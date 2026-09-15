/* ============================================================================
   sky.js — one sky for the whole night.

   The starfield is built once and never rebuilt, so walking between rooms
   never resets it: the same stars are overhead in the letter as in the poem,
   only dimmer or brighter. Pure CSS animation on opacity and transform, so it
   costs nothing per frame and stops entirely under reduced motion.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;

  function build() {
    var sky = document.getElementById('sky');
    if (!sky || sky.childElementCount) return;

    var wide = window.innerWidth >= 700;
    var count = wide ? 90 : 52;
    var reduced = util.motion.reduced;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var star = document.createElement('span');
      star.className = 'star';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      var size = (Math.random() * 1.6 + 1).toFixed(2);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      if (reduced) {
        star.style.animation = 'none';
        star.style.opacity = (0.18 + Math.random() * 0.35).toFixed(2);
      } else {
        star.style.animationDuration = (3.4 + Math.random() * 4.6).toFixed(2) + 's';
        star.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      }
      /* a handful are warmer and slightly larger, to break the uniformity */
      if (i % 11 === 0) star.classList.add('star--warm');
      frag.appendChild(star);
    }
    sky.appendChild(frag);
  }

  NIGHT.sky = { build: build };
})();
