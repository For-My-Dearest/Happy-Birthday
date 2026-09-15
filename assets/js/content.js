/* ============================================================================
   content.js — the single source of truth for this night.

   Nothing in here is presentation. Every room reads from this file, so adding
   a song, a letter page or a memory is a one-line change and no component
   needs to be touched. Text that came with the original gift (the note, the
   poem, the clue) is reproduced here word for word and must not be edited.
   ========================================================================== */

window.NIGHT = window.NIGHT || {};

NIGHT.content = {

  /* -- the note that came with the gift (README_FIRST.md) ------------------
     Used two ways: the three lines below carry the opening sequence, and the
     full text is available from the hub as "the note that came first".       */
  note: {
    label: 'the note that came first',
    opening: ['For you.', 'There is no correct order.', 'Take your time.'],
    body: [
      'Before you open anything...',
      'Happy Birthday:>',
      '',
      'I wanted to give you something this year.',
      'You told me to keep the real gift until we finally meet,',
      'so I did.',
      '',
      'Instead, I made you this.',
      "It's a small collection of thoughts, words, music,",
      'and a little mystery for my princess\uD83E\uDD2D',
      '',
      "There's no correct order to explore it.",
      'Take your time.',
      '',
      'Read.',
      'Listen.',
      'Smile. :)',
      '',
      'Somewhere in here,',
      'there is one last secret waiting for you.',
      'If you decide to chase it,',
      'I hope you enjoy the journey just as much as the destination.',
      '',
      'Happy 23rd Birthday.',
      '',
      'With all my love,',
      '',
      '-Your Dearest'
    ]
  },

  /* -- the hub -------------------------------------------------------------
     `glyph` names an icon drawn in icons.js. `point` is the position on the
     desktop constellation field, in percent. Order here is the order on
     mobile and in the tab sequence.                                          */
  destinations: [
    {
      id: 'letter',
      title: 'The Letter',
      note: 'Two pages, in his own hand',
      glyph: 'envelope',
      point: { x: 13, y: 30 }
    },
    {
      id: 'playlist',
      title: 'The Playlist',
      note: 'Nine songs, chosen one at a time',
      glyph: 'record',
      point: { x: 30, y: 76 }
    },
    {
      id: 'poem',
      title: 'The Poem',
      note: '\u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A \u2014 read to you, under the moon',
      glyph: 'cat',
      point: { x: 52, y: 16 }
    },
    {
      id: 'memories',
      title: 'The Board',
      note: 'Where pictures will be pinned',
      glyph: 'frame',
      point: { x: 71, y: 67 },
      dormantNote: 'Nothing pinned here yet'
    },
    {
      id: 'secret',
      title: 'The Last Lock',
      note: 'Every lock has a key. This one has two.',
      glyph: 'lock',
      point: { x: 88, y: 33 }
    }
  ],

  /* -- the letter ----------------------------------------------------------
     `src` is a WebP made from the scan for fast, crisp display; `original` is
     the untouched PNG, offered as the download. Add a third page by adding a
     third entry — the page-turn logic counts this array.                     */
  letter: {
    title: 'The Letter',
    intro: 'It came folded. Take it out.',
    pages: [
      {
        src: 'assets/img/letter/page-01.webp',
        original: 'assets/img/letter/page-01.png',
        width: 1023,
        height: 1537,
        alt: 'Page one of a handwritten letter on cream lined paper, with a crescent moon, small stars, hearts and a drawn cat in the margins.'
      },
      {
        src: 'assets/img/letter/page-02.webp',
        original: 'assets/img/letter/page-02.png',
        width: 1023,
        height: 1537,
        alt: 'Page two of the handwritten letter, ending with a signature beneath a drawn moon and a sitting cat.'
      }
    ]
  },

  /* -- the playlist --------------------------------------------------------
     Titles are exactly as they were given. `file` is the original filename in
     assets/audio/playlist/. `seconds` is the real duration, so the list can
     show times before a track is ever loaded. To add a song: drop the mp3 in
     that folder and add a line here.                                         */
  playlist: {
    title: 'The Playlist',
    note: 'Nine songs, in the order he put them in.',
    tracks: [
      { n: 1, title: 'Queen & Poet', file: '1. Queen & Poet.mp3', seconds: 177.7 },
      { n: 2, title: 'Safe With Me', file: '2. Safe With Me.mp3', seconds: 231.6 },
      { n: 3, title: 'Used To You', file: '3. Used To You.mp3', seconds: 144.4 },
      { n: 4, title: 'Mystery Of Love', file: '4. Mystery Of Love.mp3', seconds: 249.2 },
      { n: 5, title: 'Diet Mountain Dew (DEMO)', file: '5. Diet Mountain Dew (DEMO).mp3', seconds: 221.0 },
      { n: 6, title: 'Angel', file: '6. Angel.mp3', seconds: 380.6 },
      { n: 7, title: 'Space Song', file: '7. Space Song.mp3', seconds: 320.5 },
      { n: 8, title: 'Bloom', file: '8. Bloom.mp3', seconds: 210.1 },
      { n: 9, title: 'A Thousand Years', file: '9. A Thousand Years.mp3', seconds: 180.4 }
    ],
    folder: 'assets/audio/playlist/'
  },

  /* -- the poem ------------------------------------------------------------
     Persian text, verbatim from the original page. Stanza breaks are the
     array boundaries; the divider ornament is drawn between them.            */
  poem: {
    title: '\u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A',
    subtitle: '\u0634\u0639\u0631\u06CC \u062F\u0631 \u0633\u062A\u0627\u06CC\u0634\u0650 \u0646\u06AF\u0627\u0647\u06CC \u06A9\u0647 \u0622\u0631\u0627\u0645\u200C\u062C\u0627\u0646\u0650 \u0634\u0628\u200C\u0647\u0627\u06CC \u0633\u0631\u062F \u0648 \u0631\u0648\u0632\u0647\u0627\u06CC \u067E\u0631\u0622\u0634\u0648\u0628\u200C\u0627\u0646\u062F',
    audio: 'assets/audio/poem/song.mp3',
    audioName: 'do-cheshmanet.mp3',
    labels: {
      idle: '\u0628\u0631\u0627\u06CC \u0634\u0646\u06CC\u062F\u0646\u0650 \u062A\u0631\u0627\u0646\u0647\u060C \u0631\u0648\u06CC \u0645\u0627\u0647 \u0628\u0632\u0646',
      playing: '\u062F\u0631 \u062D\u0627\u0644 \u067E\u062E\u0634... \u0628\u0631\u0627\u06CC \u062A\u0648\u0642\u0641 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0632\u0646',
      missing: '\u0641\u0627\u06CC\u0644 \u062A\u0631\u0627\u0646\u0647 \u0628\u0627\u0632 \u0646\u0634\u062F',
      play: '\u067E\u062E\u0634 \u06CC\u0627 \u062A\u0648\u0642\u0641 \u062A\u0631\u0627\u0646\u0647',
      download: '\u062F\u0627\u0646\u0644\u0648\u062F \u062A\u0631\u0627\u0646\u0647',
      copy: '\u06A9\u067E\u06CC \u0634\u0639\u0631',
      copied: '\u06A9\u067E\u06CC \u0634\u062F!',
      full: '\u0645\u062A\u0646\u0650 \u06A9\u0627\u0645\u0644 \u0634\u0639\u0631',
      footer: '\u0628\u0631\u0627\u06CC \u062A\u0648\u060C \u0632\u06CC\u0631 \u0647\u0645\u06CC\u0646 \u0645\u0627\u0647'
    },
    stanzas: [
      [
        '\u0627\u0632 \u0622\u0646 \u062F\u0645 \u06A9\u0650\u0647 \u0646\u06AF\u0627\u0647\u0645 \u06AF\u0634\u062A \u0645\u0647\u0645\u0627\u0646\u0650 \u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A',
        '\u0642\u0631\u0627\u0631 \u0627\u0632 \u062C\u0627\u0646\u0650 \u0645\u0646 \u0628\u06AF\u0631\u0641\u062A\u060C \u0631\u0628\u0648\u062F \u0647\u0648\u0634\u0645 \u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A',
        '\u0627\u0632 \u0622\u0646 \u067E\u0633 \u062D\u0627\u0644\u0650 \u0645\u0646 \u0627\u06CC\u0646 \u0634\u062F\u061B \u0633\u0631\u0645 \u0645\u0633\u062A \u0648 \u062F\u0644\u0645 \u0639\u0627\u0634\u0642',
        '\u06A9\u0647 \u0647\u0631 \u0633\u0648 \u062F\u06CC\u062F\u0647 \u06AF\u0631\u062F\u0627\u0646\u062F\u0645\u060C \u0647\u0645\u0627\u0646 \u062F\u06CC\u062F\u0645 \u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A'
      ],
      [
        '\u0628\u0647 \u062E\u0648\u0631\u0634\u06CC\u062F\u0650 \u062C\u0647\u0627\u0646\u200C\u0627\u0641\u0631\u0648\u0632\u060C \u0628\u0647 \u0622\u0646 \u0645\u0627\u0647\u0650 \u062C\u0647\u0627\u0646\u200C\u0622\u0631\u0627',
        '\u0628\u0647 \u0647\u0631 \u062F\u0634\u062A\u0650 \u067E\u0631 \u0627\u0632 \u0622\u0648\u0627\u0632\u060C \u0628\u0647 \u0647\u0631 \u0635\u062D\u0631\u0627\u06CC \u0628\u06CC \u0622\u0648\u0627',
        '\u0628\u0647 \u0647\u0631 \u06AF\u0648\u0634\u0647 \u06A9\u0647 \u0628\u0646\u06AF\u0634\u062A\u0645\u060C \u0647\u0645\u0627\u0646 \u062F\u06CC\u062F\u0645 \u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A',
        '\u06A9\u0647 \u06AF\u0648\u06CC\u06CC \u0646\u0648\u0631\u0650 \u0639\u0627\u0644\u0645 \u0631\u0627 \u062E\u062F\u0627 \u0628\u0646\u0647\u0627\u062F \u0628\u0647 \u0686\u0634\u0645\u0627\u0646\u062A'
      ],
      [
        '\u0627\u06AF\u0631 \u0634\u0628 \u0633\u0631\u062F \u0648 \u0637\u0648\u0644\u0627\u0646\u06CC\u200C\u0633\u062A\u060C \u067E\u0646\u0627\u0647\u0650 \u062C\u0627\u0646 \u0645\u0646 \u0628\u0627\u0634\u06CC',
        '\u0648 \u0627\u06AF\u0631 \u0635\u0628\u062D \u0627\u0632 \u0627\u0641\u0642 \u062E\u06CC\u0632\u062F\u060C \u062A\u0648\u06CC\u06CC \u0622\u0631\u0627\u0645\u0650 \u062C\u0627\u0646\u0650 \u0645\u0646',
        '\u0627\u06AF\u0631 \u062F\u0646\u06CC\u0627 \u0647\u0645\u0647 \u0622\u0634\u0648\u0628\u060C \u0627\u06AF\u0631 \u062A\u0642\u062F\u06CC\u0631 \u0637\u0648\u0641\u0627\u0646\u06CC\u200C\u0633\u062A',
        '\u067E\u0646\u0627\u0647\u0650 \u062E\u0633\u062A\u0647\u200C\u062C\u0627\u0646\u0645 \u0634\u062F\u060C \u0633\u06A9\u0648\u062A\u0650 \u0646\u0631\u0645\u0650 \u0686\u0634\u0645\u0627\u0646\u062A'
      ],
      [
        '\u0648 \u0647\u0646\u06AF\u0627\u0645\u06CC \u06A9\u0647 \u0686\u0634\u0645\u0627\u0646\u062A\u060C \u062A\u0644\u0627\u0644\u0648 \u0628\u062E\u0634\u062F \u062C\u0647\u0627\u0646\u0645 \u0631\u0627',
        '\u0646\u0645\u0627\u0646\u062F \u062F\u0631 \u062F\u0644\u0645 \u062A\u0631\u062F\u06CC\u062F\u060C \u06A9\u0647 \u062C\u0627\u0646\u0645 \u063A\u0631\u0642 \u0646\u0648\u0631 \u0622\u0645\u062F',
        '\u0646\u0647 \u062A\u0646\u0647\u0627 \u0645\u0627\u0647 \u0648 \u06AF\u0644 \u062F\u06CC\u062F\u0645\u060C \u0646\u0647 \u062A\u0646\u0647\u0627 \u0628\u0627\u063A \u0648 \u062F\u0631\u06CC\u0627 \u0631\u0627',
        '\u06A9\u0647 \u0647\u0631 \u062E\u0648\u0628\u06CC \u06A9\u0647 \u0645\u06CC\u200C\u062C\u0633\u062A\u0645\u060C \u0633\u0631\u0627\u0646\u062C\u0627\u0645\u0634 \u062F\u0648 \u0686\u0634\u0645\u0627\u0646\u062A'
      ],
      [
        '\u0648 \u0627\u06A9\u0646\u0648\u0646 \u06CC\u06A9 \u062F\u0639\u0627 \u0628\u0627\u0634\u062F\u060C \u0628\u0631 \u0627\u06CC\u0646 \u0644\u0628 \u0647\u0627\u06CC \u062E\u0627\u0645\u0648\u0634\u0645:',
        '\u062E\u062F\u0627 \u062E\u0646\u062F\u0627\u0646 \u0646\u06AF\u0647 \u062F\u0627\u0631\u062F \u0647\u0645\u06CC\u0634\u0647 \u0646\u0648\u0631\u0650 \u0686\u0634\u0645\u0627\u0646\u062A'
      ]
    ]
  },

  /* -- the board -----------------------------------------------------------
     Deliberately empty. The gift contains no photographs, and inventing them
     would be a lie. To pin one: drop the file in assets/img/memories/ and add
     { src, alt, caption, date } here. The room renders whatever is in this
     array and shows its resting state when there is nothing.                 */
  memories: {
    title: 'The Board',
    empty: {
      heading: 'Nothing is pinned here yet.',
      lines: [
        'This wall was built to hold pictures \u2014 the ones already chosen, and the ones from the day you finally meet.',
        'It stays here, waiting, with the pins ready.'
      ]
    },
    items: []
  },

  /* -- the last lock -------------------------------------------------------
     The clue is reproduced exactly as written in HINT.md, split into the
     stages it already describes. The answer is nowhere in this project: the
     archive is opened by decrypting it with whatever is typed in, so a wrong
     guess simply fails to turn the lock.                                     */
  secret: {
    title: 'The Last Lock',
    opening: ['Every lock has a key.', 'This one has two.'],
    stages: [
      {
        id: 'key-1',
        eyebrow: 'First Key',
        lines: ['Seek the night when three simple words became something more than words.'],
        mark: '23:12 \u00B7 12 July',
        close: 'Bring them with you.',
        label: 'The first key',
        placeholder: 'the three words'
      },
      {
        id: 'key-2',
        eyebrow: 'Second Key',
        lines: [
          'The second key was never spoken first.',
          'It was born after a picture found its place among the memories we chose never to lose.',
          'Look where memories are pinned.'
        ],
        close: 'Bring those words as well.',
        label: 'The second key',
        placeholder: 'those words'
      }
    ],
    rule: ['Join the two keys.', 'Remove every space.', 'Use no uppercase.', 'The order matters.'],
    signoff: 'hihi:>',
    turn: 'Turn the key',
    misses: [
      'The lock holds. Nothing moves.',
      'Still closed. Read the clue once more \u2014 both halves, in order.',
      'Not yet. Remember: no spaces, no capitals, first key first.',
      'Take your time. It is only waiting for the right words.'
    ],
    opened: {
      title: 'Prologue',
      line: 'The last thing left here for you.'
    },
    archive: 'Prologue.pdf'
  }
};
