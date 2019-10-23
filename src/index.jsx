import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import urlParser from 'js-video-url-parser/lib/base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
} from '@fortawesome/free-solid-svg-icons';
import 'js-video-url-parser/lib/provider/dailymotion';
import 'js-video-url-parser/lib/provider/youtube';

import Youtube from './services/youtube';
import Dailymotion from './services/daylimotion';
import FileSource from './services/file-source';
import { isElementInViewport } from './utils';
import styles from './styles.scss';

const StickyVideo = ({
  url,
  height,
  width,
  playerVars,
  stickyConfig: {
    width: stickyWidth,
    height: stickyHeight,
    position,
  },
}) => {
  const [sticky, setSticky] = useState(false);
  const [isPlaying, setPlaying] = useState(false);

  const refContainer = useRef(null);
  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);

  let videoId;
  let provider;
  if (typeof url === 'string') {
    ({ id: videoId, provider } = urlParser.parse(url));
  } else {
    provider = 'file';
  }

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!sticky && !isElementInViewport(element)) {
        if (isPlaying) {
          setSticky(true);
        }
      }
      if (sticky && isElementInViewport(element)) {
        setSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    sticky,
    isPlaying,
    width,
    height,
    stickyWidth,
    stickyHeight,
  ]);

  let nodePlayer;
  switch (provider) {
    case 'youtube':
      nodePlayer = (
        <Youtube
          videoId={videoId}
          playerVars={playerVars}
          setPlaying={setPlaying}
        />
      );
      break;
    case 'dailymotion':
      nodePlayer = (
        <Dailymotion
          videoId={videoId}
          playerVars={playerVars}
          setPlaying={setPlaying}
        />
      );
      break;
    default:
      nodePlayer = (
        <FileSource
          source={url}
          playerVars={playerVars}
          setPlaying={setPlaying}
        />
      );
  }

  return (
    <div
      className={styles.container}
      style={{
        width,
        height,
      }}
    >
      <div
        ref={refHidden}
        className={styles.hidden}
      />
      <div
        ref={refContainer}
        className={classNames(
          styles.player,
          {
            [styles.sticky]: sticky,
            [styles.stTopRight]: position === 'top-right',
            [styles.stTopLeft]: position === 'top-left',
            [styles.stBottomRight]: position === 'bottom-right',
            [styles.stBottomLeft]: position === 'bottom-left',
          },
        )}
        style={(sticky
          ? {
            width: stickyWidth,
            height: stickyHeight,
          }
          : {
            width,
            height,
          }
        )}
      >
        <div
          ref={refPlayerContainer}
          className={styles.playerContainer}
        >
          {nodePlayer}
        </div>
        <div className={styles.controls}>
          <FontAwesomeIcon
            icon={isPlaying ? faPause : faPlay}
          />
          <div />
          <div />
        </div>
      </div>
    </div>
  );
};

StickyVideo.propTypes = {
  url: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  playerVars: PropTypes.shape({
    autoplay: PropTypes.bool,
    controls: PropTypes.bool,
  }),
  stickyConfig: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.oneOf([
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left',
    ]),
  }),
};

StickyVideo.defaultProps = {
  width: 640,
  height: 360,
  playerVars: {
    autoplay: true,
    controls: true,
    iv_load_policy: 3,
  },
  stickyConfig: {
    width: 320,
    height: 180,
    position: 'bottom-right',
  },
};

export default StickyVideo;
