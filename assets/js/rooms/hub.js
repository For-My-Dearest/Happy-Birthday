/* ============================================================================
   hub.js — the night itself.

   Five places, held around one moon. They are real links, in a real list, so
   the keyboard and a screen reader get the same map the eye gets. On a wide
   screen they sit where they sit in the sky; under 900px the same list becomes
   a single thread running down the page, which is easier to read with a thumb
   than any radial arrangement.

   Titles are always visible. The one-line description appears on hover or
   focus — discoverable, never hidden knowledge.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

(function () {
  'use strict';

  var util = NIGHT.util;
  var el = util.el;

  function spot(dest, index) {
    var content = NIGHT.content;
    var dormant = dest.id === 'memories' && !content.memories.items.length;
    var note = dormant && dest.dormantNote ? dest.dormantNote : dest.note;

    var link = el('a', {
      class: 'spot' + (dormant ? ' is-dormant' : ''),
      href: '#/' + dest.id,
      style: '--x:' + dest.point.x + '%;--y:' + dest.point.y + '%;--i:' + index
    }, [
      el('span', { class: 'spot-star', 'aria-hidden': 'true' }),
      el('span', { class: 'spot-glyph', 'aria-hidden': 'true', html: NIGHT.icons.glyph(dest.glyph) }),
      el('span', { class: 'spot-label' }, [
        el('span', { class: 'spot-title', text: dest.title }),
        el('span', { class: 'spot-note', text: note })
      ])
    ]);

    return el('li', { class: 'spots-item' }, [link]);
  }

  /* Built as markup, not with createElement: an <svg> made by
     document.createElement is an HTML element of that name and renders
     nothing. */
  function threads(destinations) {
    var points = destinations.map(function (d) { return d.point.x + ',' + d.point.y; }).join(' ');
    return el('div', {
      class: 'threads-wrap',
      'aria-hidden': 'true',
      html: '<svg class="threads" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">' +
            '<polyline points="' + points + '" /></svg>'
    });
  }

  function mount(stage) {
    var content = NIGHT.content;

    var head = el('header', { class: 'hub-head' }, [
      el('p', { class: 'eyebrow', text: 'Happy 23rd birthday' }),
      el('h1', { class: 'hub-title', text: 'Everything here was left for you.' }),
      el('p', { class: 'hub-sub', text: 'There is no correct order. Take your time.' })
    ]);

    var field = el('div', { class: 'field' }, [
      el('div', { class: 'field-moon', 'aria-hidden': 'true' }),
      threads(content.destinations),
      el('ul', { class: 'spots' }, content.destinations.map(spot))
    ]);

    var foot = el('footer', { class: 'hub-foot' }, [
      el('button', {
        type: 'button',
        class: 'link-quiet',
        onclick: function () { NIGHT.note.open(); }
      }, [
        el('span', { class: 'link-quiet__icon', 'aria-hidden': 'true', html: NIGHT.icons.ui('note') }),
        el('span', { text: content.note.label })
      ])
    ]);

    stage.appendChild(el('section', { class: 'hub' }, [head, field, foot]));
  }

  NIGHT.router.register({ id: 'hub', title: 'The night', mount: mount });
})();
