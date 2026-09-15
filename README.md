# A night for you

A single-page world built around the original gift: the letter, the nine songs,
the poem, a board waiting for photographs, and the last lock.

Nothing in the gift was rewritten. The letter is the original scan, the songs
are the original files under their original names, the poem is the original
text, the clue is reproduced word for word, and the sealed archive is still
sealed exactly as it arrived.

---

## Opening it

**Simplest:** unzip the folder and double-click `index.html`. Everything works
from disk — the fonts, the music, the poem, the lock. No server, no internet,
no build step, no installation.

**If you would rather host it** (so it can be opened from a phone by link), any
static host works: drop the folder into Netlify Drop, GitHub Pages, Vercel, or
anything similar. There is nothing to compile.

A note on browsers: Chrome, Edge, Firefox and Safari are all fine. If you send
it to someone, sending the whole folder matters — the site is the folder, not
just the HTML file.

---

## What is where

```
index.html                  the whole application shell
assets/
  css/     tokens, base, shell, then one file per room
  js/
    content.js              every piece of content, in one place
    icons.js                the drawing vocabulary
    util.js  audio.js  router.js  app.js
    ui/      sky, intro, note, miniplayer
    rooms/   hub, letter, playlist, poem, memories, secret
  img/letter/               the scans (.png originals, .webp for display)
  img/memories/             empty, waiting
  audio/playlist/           the nine songs, original filenames
  audio/poem/song.mp3
  fonts/                    bundled so it works offline
  vault/                    the sealed archive and the unzip library
```

Content is separate from presentation on purpose: **almost anything you want to
add is a line in `assets/js/content.js`**, not a change to a component.

---

## Adding things later

### Another song

1. Put the mp3 in `assets/audio/playlist/`.
2. Add a line to `NIGHT.content.playlist.tracks` in `content.js`:

```js
{ n: 10, title: 'Its Title', file: '10. Its Title.mp3', seconds: 214 }
```

`seconds` is only so the list can show a duration before the file is loaded.
If you do not know it, put `0` — the player fills it in once the song starts.
The music player itself needs no changes.

### A photograph on the board

The board is deliberately empty, because the gift contained no photographs and
inventing some would have been the one dishonest thing here. To pin one:

1. Put the image in `assets/img/memories/`.
2. Add it to `NIGHT.content.memories.items`:

```js
{ src: 'assets/img/memories/memory01.jpg',
  alt:  'what the picture shows',
  caption: 'a few words',
  date: 'July 2026' }
```

The room switches out of its waiting state on its own, and pins, captions,
tilt, the lightbox and keyboard handling are already built. Leave out `caption`
or `date` if there is nothing true to write there.

### Another letter page

1. Put the scan in `assets/img/letter/`.
2. Add it to `NIGHT.content.letter.pages`, with `src` (a WebP for display),
   `original` (the full-size file for downloading), `width`, `height`, `alt`.

The page-turn, the counter, the zoom and the keyboard all count the array.

---

## The last lock

Worth understanding, if you ever need to maintain it.

There is **no stored password and no stored hash**. `Secret.zip` is still
AES-encrypted exactly as it arrived, carried inside `assets/vault/sealed.js`,
and the only thing that happens when the key is turned is that the site tries
to decrypt it with whatever was typed. Right words, the archive opens and the
PDF appears. Wrong words, the lock simply does not move. The answer is not in
the JavaScript, the HTML, the CSS or a data attribute, because the answer was
never given to this project in the first place.

Small mercies are built in: the two keys are joined, lowercased and stripped of
spaces the way the clue says, and a few near-miss variants (Persian digits,
curly apostrophes, stray punctuation) are tried too. Being right is never
punished by a keyboard.

This is a lock on a bedroom door, not a bank vault. The encrypted bytes sit in
the page, so someone determined and technical could attack them offline. What
it does guarantee is that the experience cannot be spoiled by reading the
source, which is the part that matters.

**Do not** put the answer in the code to "make it easier". That would be the
one change that breaks the gift.

---

## Choices worth knowing

- **One sky.** The starfield is built once and shared, so it never resets
  between rooms — only dims or brightens. Each room fades its own light in
  behind it.
- **One voice.** All audio lives in `audio.js`. Starting the poem stops the
  playlist and the other way round, so the night never talks over itself.
  Nothing ever autoplays. The mini player appears only after she starts the
  music herself, and hides inside the music room where the full player already
  is.
- **The opening** runs once per browser, lasts about four seconds, and can be
  skipped with the button, Escape, or any key.
- **Reduced motion** is respected throughout: the stars stop twinkling, the
  record stops turning, pages cross-fade instead of turning, and the opening
  becomes two short fades.
- **Keyboard**: every room is operable. In the letter, arrows turn pages and
  then pan once zoomed, `+`/`-`/`0` handle zoom. In the music room, space plays,
  `←`/`→` move through a song, `↑`/`↓` change the volume, `n`/`p` change track.
  Escape leaves a room.
- **The PDF** is shown in the browser's own viewer when it can be, with open
  and download always offered. On small screens it goes straight to those
  buttons rather than showing a grey rectangle, because phones rarely render an
  embedded PDF properly.

---

## Credits

- Typefaces: Vazirmatn, Noto Naskh Arabic, Aref Ruqaa and Cormorant Garamond,
  all under the SIL Open Font License, bundled locally.
- `assets/vault/zip.min.js` is [zip.js](https://github.com/gildas-lormeau/zip.js)
  by Gildas Lormeau, BSD-3-Clause. It is used only to decrypt the sealed
  archive in the browser.
- Everything else — the letter, the songs, the poem, the clue — belongs to the
  person who made the gift.
