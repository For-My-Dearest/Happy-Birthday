/* ============================================================================
   app.js — opening the house.

   Load order matters and is fixed in index.html: content, icons and utilities
   first, then the audio and the router, then the rooms (each registers itself),
   then this file, which turns the lights on.
   ========================================================================== */

(function () {
  'use strict';

  var booted = false;

  function boot() {
    if (booted) return;
    booted = true;

    NIGHT.sky.build();
    NIGHT.miniplayer.build();
    NIGHT.router.start();
    NIGHT.intro.run();

    /* If the visitor changes their motion preference mid-visit, the sky is the
       one thing built from JS that needs to hear about it. */
    NIGHT.util.motion.onChange(function () {
      var sky = document.getElementById('sky');
      if (sky) {
        NIGHT.util.clear(sky);
        NIGHT.sky.build();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
