# React Sticky Video

[![npm](https://img.shields.io/npm/v/react-sticky-video.svg)](https://www.npmjs.com/package/react-sticky-video)
[![license](https://img.shields.io/npm/l/react-sticky-video.svg)](./LICENSE)

A React component for creating sticky, floating videos with ease.
When a playing video is scrolled out of view, it keeps playing in a small floating player pinned to a corner of the screen.

**[Live demo →](https://kako0507.github.io/react-sticky-video/)**

## Features

- Floating "picture-in-picture" style player while scrolling, with a configurable size and corner
- Supports **YouTube** videos and **video files** (including multiple `<source>` fallbacks)
- A consistent, YouTube-like control bar for every source: play/pause, seeking, volume, full screen
- **WebVTT captions** with a built-in caption picker
- Works on mobile, with a full-page fallback where the Fullscreen API isn't available

## Requirements

- React **19** or later

## Installation

```sh
npm install react-sticky-video
```

Import the stylesheet once in your app:

```js
import 'react-sticky-video/dist/index.css';
```

## Quick start

```jsx
import StickyVideo from 'react-sticky-video';
import 'react-sticky-video/dist/index.css';

export default function App() {
  return <StickyVideo url="https://www.youtube.com/watch?v=7EIkSKnCW8E" />;
}
```

Play the video and scroll down — the player will float to the bottom-right corner.

## Props

Name | Type | Default | Description
---- | ---- | ------- | -----------
`url` | `string` \| `{ src, type }[]` | — (required) | A YouTube URL, a video file URL, or a list of sources for the `<video>` element.
`width` | `number` | `640` | Width of the player in pixels.
`height` | `number` | `360` | Height of the player in pixels.
`playerVars` | `object` | `{ autoplay: false, muted: false }` | Parameters passed to the underlying player. See [Video sources](#video-sources).
`captions` | `{ src, label, default? }[]` | `[]` | WebVTT caption tracks. See [WebVTT captions](#webvtt-captions).
`stickyConfig` | `object` | see below | Size and position of the floating player. See [Sticky configuration](#sticky-configuration).
`originalControls` | `boolean` | `false` | Use the provider's native controls instead of the built-in control bar.

## Video sources

### Video files

[▶ Try the demo](https://kako0507.github.io/react-sticky-video/#service=file)

Pass a single URL, or a list of sources so each browser can pick a format it supports.

```jsx
<StickyVideo url="/videos/trailer.mp4" />

<StickyVideo
  url={[
    { src: '/videos/trailer.mp4', type: 'video/mp4' },
    { src: '/videos/trailer.webm', type: 'video/webm' },
  ]}
/>
```

Supported `playerVars`:

Name | Type | Default | Description
---- | ---- | ------- | -----------
`autoplay` | `boolean` | `false` | Start playing as soon as the video is ready. Most browsers only allow this when the video is also `muted`.
`loop` | `boolean` | `false` | Start over again every time the video ends.
`muted` | `boolean` | `false` | Mute the audio.

### YouTube

[▶ Try the demo](https://kako0507.github.io/react-sticky-video/#service=youtube)

Any common YouTube URL works: `youtube.com/watch?v=…`, `youtu.be/…`, `/embed/…`, `/shorts/…` and `/live/…`.

```jsx
<StickyVideo
  url="https://www.youtube.com/watch?v=7EIkSKnCW8E"
  playerVars={{ autoplay: true, muted: true }}
/>
```

`playerVars` accepts any of the [YouTube player parameters](https://developers.google.com/youtube/player_parameters#Parameters); boolean values are converted to `1` / `0` for you.

## Sticky configuration

[▶ Try the demo](https://kako0507.github.io/react-sticky-video/#video=stickyConfig)

Name | Type | Default | Description
---- | ---- | ------- | -----------
`width` | `number` | `320` | Width of the floating player in pixels.
`height` | `number` | `180` | Height of the floating player in pixels.
`position` | `'top-right'` \| `'top-left'` \| `'bottom-right'` \| `'bottom-left'` | `'bottom-right'` | The corner the floating player is pinned to.

Any option you leave out falls back to its default.

```jsx
<StickyVideo
  url="https://www.youtube.com/watch?v=7EIkSKnCW8E"
  stickyConfig={{
    width: 480,
    height: 270,
    position: 'top-left',
  }}
/>
```

## WebVTT captions

[▶ Try the demo](https://kako0507.github.io/react-sticky-video/#video=captions)

Captions work with every video source. Mark one track as `default` to show it right away; viewers can switch tracks with the **CC** button.

```jsx
<StickyVideo
  url="https://youtu.be/Fkd9TWUtFm0"
  captions={[
    { src: '/captions/ted-en.vtt', label: 'English', default: true },
    { src: '/captions/ted-zh-TW.vtt', label: '中文' },
  ]}
/>
```

Caption files are downloaded with `fetch`, so they must be served from the same origin or with CORS enabled.

## Upgrading from 0.x

- React 19 is now required.
- Dailymotion support has been removed; only YouTube and video files are supported.
- `stickyConfig` options are now merged with the defaults, so you can set just the ones you need.
- Captions are parsed and rendered by a small built-in WebVTT parser. Cue text (with markup removed) is shown at the bottom of the player; cue settings such as position and alignment, regions and `STYLE` blocks are ignored.
- The package ships ES module (`dist/index.mjs`) and CommonJS (`dist/index.cjs`) builds instead of UMD.

## Development

```sh
npm install
npm run dev            # start the demo at http://localhost:5173
npm test               # unit tests (Vitest + Testing Library)
npm run test:e2e       # end-to-end tests (Playwright)
npm run lint
npm run build          # build the library into dist/
npm run build-example  # build the demo site into demo-dist/
```

Run `npx playwright install` once before the first end-to-end run.

## License

[MIT](./LICENSE)
