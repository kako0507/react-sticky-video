/* eslint-disable max-classes-per-file */
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import GithubCorner from 'react-github-corner';
import ReactMarkDown from 'react-markdown';
import queryString from 'query-string';
import Readme from '../README.md';
import StickyVideo from '../src/index';

const md = `
## Demo
Please play the video and scroll down.
`;

const tracks = [
  {
    src: 'trailer_400p.vtt',
    srcLang: 'en',
    label: 'English Subtitles',
    kind: 'subtitles',
    isDefault: true,
  },
];

const App = () => {
  const [demo, setDemo] = useState('');
  const refVideoContainer = useRef(null);
  let demoVideoElement;

  useEffect(() => {
    const updateDemoVideo = (hash) => {
      const { video } = queryString.parse(hash);
      setDemo(video);
    };
    const handleClickDemo = (event) => {
      updateDemoVideo(event.target.href.split('#')[1]);
      refVideoContainer.current.scrollIntoView();
      event.preventDefault();
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
  }, []);

  switch (demo) {
    case 'youtube':
      demoVideoElement = (
        <StickyVideo
          url="https://www.youtube.com/watch?v=TmubVRCj8Ug"
          width={960}
          height={540}
          autoPlay
        />
      );
      break;
    case 'stickyConfig':
      demoVideoElement = (
        <StickyVideo
          url="https://www.youtube.com/watch?v=7EIkSKnCW8E"
          stickyConfig={{
            width: 480,
            height: 270,
            position: 'top-left',
          }}
        />
      );
      break;
    case 'tracks':
      demoVideoElement = (
        <StickyVideo
          url="trailer_400p.ogg"
          tracks={tracks}
        />
      );
      break;
    default:
      demoVideoElement = (
        <StickyVideo
          url="trailer_400p.ogg"
        />
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
        <div ref={refVideoContainer} className="container is-medium">
          {demoVideoElement}
        </div>
        <br />
        <div className="container is-small">
          <ReactMarkDown className="content" source={Readme} />
        </div>
      </section>
    </>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('main'),
);
