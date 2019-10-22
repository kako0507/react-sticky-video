## Installation

```
yarn add react-sticky-video
```

## Props

### Basic Configuration

Name | Type | Default | Description
---- | ---- | ------- | -----------
url | string | undefined | The URL of the video to embed. (current supported source: file, Youtube)
width | number | 640 | The width of the video's display area.
height | number | 360 | The width of the video's display area.
autoPlay | boolean | false | If specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data.
controls | boolean | true | If this attribute is present, it will offer controls to allow the user to control video playback.

#### example

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="trailer_400p.ogg"
  />
);
```
[Demo](http://kako0507.github.io/react-sticky-video/#video=file)


```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.youtube.com/watch?v=TmubVRCj8Ug"
    width={960}
    height={540}
    autoPlay
  />
);
```

[Demo](http://kako0507.github.io/react-sticky-video/#video=youtube)

### stickyConfig
Name | Type | Default | Description
---- | ---- | ------- | -----------
width | number | 320 | The width of the sticky video's display area.
height | number | 180 | The width of the sticky video's display area.
position | oneOf(\['top-right', 'top-left', 'bottom-right', 'bottom-left'\]) | 'bottom-right' | The position of the sticky video 

#### example

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.youtube.com/watch?v=7EIkSKnCW8E"
    stickyConfig={
      width: 480,
      height: 270,
      position: 'top-left',
    }
  />
);
```

[Demo](http://kako0507.github.io/react-sticky-video/#video=stickyConfig)
