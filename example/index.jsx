import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useResizeObserver from 'use-resize-observer';
import GithubCorner from 'react-github-corner';
import ReactMarkDown from 'react-markdown';
import queryString from 'query-string';
import Readme from '../README.md';
import Table from './table';
import StickyVideo from '../src/index';

const md = `
## Demo
Please play the video and scroll down.
`;

const fileSrcs = [
  [
    {
      src: 'trailer_400p.ogg',
      type: 'video/ogg',
    },
    {
      src: 'trailer_480p.mov',
      type: 'video/mp4',
    },
  ],
];

const youtubeSrcs = [
  'https://www.youtube.com/watch?v=7EIkSKnCW8E',
  'https://www.youtube.com/watch?v=TmubVRCj8Ug',
  'https://www.youtube.com/watch?v=Bey4XXJAqS8',
  'https://www.youtube.com/watch?v=LXb3EKWsInQ',
];

const dailymotionSrcs = [
  'https://www.dailymotion.com/video/x5slpa7',
  'https://www.dailymotion.com/video/x2m8jpp',
  'https://www.dailymotion.com/video/xobru2',
];

const allVideoSrcs = _.union(
  fileSrcs,
  youtubeSrcs,
  dailymotionSrcs,
);

const App = () => {
  const [demo, setDemo] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const [refVideoContainer, width] = useResizeObserver();

  let demoVideoElement;

  useEffect(() => {
    const elemVideoContainer = refVideoContainer.current;
    const updateDemoVideo = (hash) => {
      const { video, service } = queryString.parse(hash);
      let srcs;

      setDemo(video || 'simple');
      switch (service) {
        case 'youtube':
          srcs = youtubeSrcs;
          break;
        case 'dailymotion':
          srcs = dailymotionSrcs;
          break;
        case 'file':
          srcs = fileSrcs;
          break;
        default:
          srcs = allVideoSrcs;
      }
      setDemoUrl(_.sample(srcs));
    };
    const handleClickDemo = (event) => {
      if (event.target.href.indexOf('kako0507') > -1) {
        updateDemoVideo(event.target.href.split('#')[1]);
        elemVideoContainer.scrollIntoView();
        event.preventDefault();
      }
    };

    updateDemoVideo(window.location.hash);

    document.querySelectorAll('.container.is-small a').forEach((element) => {
      element.addEventListener('click', handleClickDemo);
    });
    return () => {
      document.querySelectorAll('.container.is-small a').forEach((element) => {
        element.removeEventListener('click', handleClickDemo);
      });
    };
  }, [refVideoContainer]);

  switch (demo) {
    case 'simple':
      demoVideoElement = (demoUrl
        ? (
          <StickyVideo
            width={width}
            height={width * 0.5625}
            url={demoUrl}
          />
        )
        : <div />
      );
      break;
    case 'stickyConfig':
      demoVideoElement = (
        <StickyVideo
          url={demoUrl}
          width={width}
          height={width * 0.5625}
          stickyConfig={{
            width: 480,
            height: 270,
            position: 'top-left',
          }}
        />
      );
      break;
    default:
      demoVideoElement = (
        <div />
      );
  }

  return (
    <>
      <GithubCorner
        href="https://github.com/kako0507/react-sticky-video"
        octoColor="#64ceaa"
        bannerColor="#257459"
      />
      <section className="hero is-medium is-primary is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title is-size-1">
              React Sticky Video
            </h1>
            <h2 className="subtitle">
              A component for creating sticky and floating video easily.
            </h2>
          </div>
        </div>
      </section>
      <section className="section has-background-white is-small">
        <div className="container is-small">
          <ReactMarkDown className="content" source={md} />
        </div>
        <br />
        <div
          ref={refVideoContainer}
          className="container video-container is-medium"
        >
          {demoVideoElement}
        </div>
        <br />
        <div className="container is-small">
          <ReactMarkDown
            className="content"
            source={Readme}
            renderers={{
              table: Table,
            }}
          />
        </div>
      </section>
    </>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('main'),
);
