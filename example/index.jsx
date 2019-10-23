import _ from 'lodash';
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

const fileSrcs = [
  'trailer_400p.ogg',
];

const youtubeSrcs = [
  'https://www.youtube.com/watch?v=7EIkSKnCW8E',
  'https://www.youtube.com/watch?v=TmubVRCj8Ug',
  'https://www.youtube.com/watch?v=uC9qU3X1JgM',
  'https://www.youtube.com/watch?v=Bey4XXJAqS8',
  'https://www.youtube.com/watch?v=LXb3EKWsInQ',
];

const facebookSrcs = [
  'https://www.facebook.com/facebook/videos/10153231379946729/',
  'https://www.facebook.com/facebook/videos/10157073475131729/',
  'https://www.facebook.com/facebook/videos/10156384500276729/',
  'https://www.facebook.com/facebook/videos/405261626724817/',
  'https://www.facebook.com/facebook/videos/267444427196392/',
  'https://www.facebook.com/facebook/videos/2194727650806689/',
];

const allVideoSrcs = _.union(
  fileSrcs,
  youtubeSrcs,
  facebookSrcs,
);

const App = () => {
  const [demo, setDemo] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const refVideoContainer = useRef(null);
  let demoVideoElement;

  useEffect(() => {
    const updateDemoVideo = (hash) => {
      const { video, service } = queryString.parse(hash);
      let srcs;

      setDemo(video || 'simple');
      switch (service) {
        case 'youtube':
          srcs = youtubeSrcs;
          break;
        case 'facebook':
          srcs = facebookSrcs;
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
    case 'simple':
      demoVideoElement = (demoUrl
        ? (
          <StickyVideo
            url={demoUrl}
            autoPlay
            serviceConfig={{
              facebook: {
                appId: '776172449485073',
              },
            }}
          />
        )
        : <div />
      );
      break;
    case 'stickyConfig':
      demoVideoElement = (
        <StickyVideo
          url={demoUrl}
          autoPlay
          stickyConfig={{
            width: 480,
            height: 270,
            position: 'top-left',
          }}
          serviceConfig={{
            facebook: {
              appId: '776172449485073',
            },
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
