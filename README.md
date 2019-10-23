## Installation

```
yarn add react-sticky-video
```

## Props

### Basic Configuration

Name | Type | Default | Description
---- | ---- | ------- | -----------
url | string | undefined | The URL of the video to embed. (current supported source: file, Youtube, Dailymotion)
width | number | 640 | The width of the video's display area.
height | number | 360 | The width of the video's display area.
playerVars | object | -- | The object's properties identify player parameters that can be used to customize the player

#### Example

##### File Source - [Demo](http://kako0507.github.io/react-sticky-video/#service=file)

###### Supported playerVars

Name | Type | Default | Description
---- | ---- | ------- | -----------
autoplay | bool | false | Specifies that the video will start playing as soon as it is ready
controls | bool | true | Specifies that video controls should be displayed (such as a play/pause button etc).
loop | bool | false | Specifies that the video will start over again, every time it is finished
muted | bool | Specifies that the audio output of the video should be muted

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

###### [Supported playerVars](https://developers.google.com/youtube/player_parameters)

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.youtube.com/watch?v=XXXXXXXXXXX"
  />
);
```

##### Dailymotion - [Demo](http://kako0507.github.io/react-sticky-video/#service=dailymotion)

###### [Supported playerVars](https://developer.dailymotion.com/player/#player-parameters)

```js
import React from 'react';
import StickyVideo from 'react-sticky-video';

const App = () => (
  <StickyVideo
    url="https://www.dailymotion.com/video/x5ewub7"
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