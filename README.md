## Installation

```
yarn add react-sticky-video
```

## Props

### Basic Configuration

Name | Type | Default | Description
---- | ---- | ------- | -----------
url | string | undefined | The URL of the video to embed. (current supported source: file, Youtube, Facebook)
width | number | 640 | The width of the video's display area.
height | number | 360 | The width of the video's display area.
autoPlay | boolean | false | If specified, the video automatically begins to play back as soon as it can do so without stopping to finish loading the data.
controls | boolean | true | If this attribute is present, it will offer controls to allow the user to control video playback.

#### Example

##### File Source - [Demo](http://kako0507.github.io/react-sticky-video/#service=file)

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="trailer_400p.ogg"
  />
);
```

##### Youtube - [Demo](http://kako0507.github.io/react-sticky-video/#service=youtube)

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.youtube.com/watch?v=XXXXXXXXXXX"
  />
);
```

##### Facebook - [Demo](http://kako0507.github.io/react-sticky-video/#service=facebook)


```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.facebook.com/XXXXXXXXXXX/videos/XXXXXXXXXXX/"
    serviceConfig={{
      facebook: {
        appId: 'XXXXXXXXXXX',
      },
    }}
  />
);
```

### stickyConfig
Name | Type | Default | Description
---- | ---- | ------- | -----------
width | number | 320 | The width of the sticky video's display area.
height | number | 180 | The width of the sticky video's display area.
position | oneOf(\['top-right', 'top-left', 'bottom-right', 'bottom-left'\]) | 'bottom-right' | The position of the sticky video 

#### Example - [Demo](http://kako0507.github.io/react-sticky-video/#video=stickyConfig)

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="XXXXXXXXXXX"
    stickyConfig={
      width: 480,
      height: 270,
      position: 'top-left',
    }
  />
);
```