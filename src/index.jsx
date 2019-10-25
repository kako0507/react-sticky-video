import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import urlParser from 'js-video-url-parser/lib/base';
import 'js-video-url-parser/lib/provider/dailymotion';
import 'js-video-url-parser/lib/provider/youtube';

import Youtube from './providerComponents/youtube';
import Dailymotion from './providerComponents/dailymotion';
import FileSource from './providerComponents/file-source';
import Controls from './components/controls';
import {
  isElementInViewport,
  checkFullScreen,
  openFullscreen,
  closeFullscreen,
} from './utils';
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
  const [isShowControls, setShowControls] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [fullPage, setFullPage] = useState({
    open: false,
  });
  const [playerStatus, setPlayerStatus] = useState({});
  const [playerControls, setPlayerControls] = useState({});

  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);

  let videoId;
  let provider;
  if (typeof url === 'string') {
    ({ id: videoId, provider } = urlParser.parse(url));
  } else {
    provider = 'file';
  }

  const handleHideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  const debounceHideControls = useCallback(
    _.debounce(handleHideControls, 3000),
    [],
  );

  const handleShowControls = useCallback(() => {
    setShowControls(true);
    debounceHideControls();
  }, [debounceHideControls]);

  const handlePlayerControl = useCallback((event) => {
    if (event.type === 'keypress' && event.charCode !== 32) {
      return;
    }
    if (playerStatus.playing) {
      if (playerControls.pause) {
        playerControls.pause();
      }
    } else {
      if (playerControls.play) {
        playerControls.play();
      }
      handleShowControls();
    }
    event.preventDefault();
    event.stopPropagation();
  }, [handleShowControls, playerControls, playerStatus.playing]);

  const handleClickFullscreen = useCallback(() => {
    const support = openFullscreen(refPlayerContainer.current);
    if (!support) {
      setFullPage({
        open: true,
        bodyOverflow: document.body.style.overflow,
        bodyWidth: document.body.style.width,
        bodyHeight: document.body.style.height,
      });
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleCancelFullscreen = useCallback(() => {
    closeFullscreen();
    if (fullPage.open) {
      document.body.style.width = fullPage.bodyWidth;
      document.body.style.height = fullPage.bodyHeight;
      document.body.style.overflow = fullPage.bodyOverflow;
      setFullPage({
        open: false,
        bodyWidth: undefined,
        bodyHeight: undefined,
        bodyOverflow: undefined,
      });
    }
  }, [fullPage]);

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!sticky && !isElementInViewport(element)) {
        if (playerStatus.playing) {
          setSticky(true);
        }
      }
      if (sticky && isElementInViewport(element)) {
        setSticky(false);
      }
    };
    const handleFullScreeChange = () => {
      setFullScreen(checkFullScreen());
    };
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('fullscreenchange', handleFullScreeChange);
    document.addEventListener('mozfullscreenchange', handleFullScreeChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreeChange);
    document.addEventListener('msfullscreenchange', handleFullScreeChange);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('fullscreenchange', handleFullScreeChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreeChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreeChange);
      document.removeEventListener('msfullscreenchange', handleFullScreeChange);
    };
  }, [
    sticky,
    playerStatus.playing,
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
          setPlayerStatus={setPlayerStatus}
          setPlayerControls={setPlayerControls}
        />
      );
      break;
    case 'dailymotion':
      nodePlayer = (
        <Dailymotion
          videoId={videoId}
          playerVars={playerVars}
          setPlayerStatus={setPlayerStatus}
          setPlayerControls={setPlayerControls}
        />
      );
      break;
    default:
      nodePlayer = (
        <FileSource
          source={url}
          playerVars={playerVars}
          setPlayerStatus={setPlayerStatus}
          setPlayerControls={setPlayerControls}
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
        role="button"
        tabIndex="0"
        ref={refPlayerContainer}
        className={classNames(
          styles.player,
          {
            [styles.fullPage]: fullPage.open,
            [styles.sticky]: sticky && !fullPage.open,
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
        onFocus={handleShowControls}
        onMouseMove={handleShowControls}
        onMouseOver={handleShowControls}
        onBlur={handleHideControls}
        onMouseOut={handleHideControls}
      >
        <div
          role="button"
          tabIndex="0"
          className={classNames(
            styles.playerContainer,
            {
              [styles.seeking]: playerStatus.seeking || playerStatus.playing,
            },
          )}
          onClick={handlePlayerControl}
          onKeyPress={handlePlayerControl}
        >
          {nodePlayer}
        </div>
        <Controls
          isFullScreen={isFullScreen || fullPage.open}
          onClickFullscreen={handleClickFullscreen}
          onCancelFullscreen={handleCancelFullscreen}
          playerStatus={playerStatus}
          playerControls={playerControls}
          setPlayerStatus={setPlayerStatus}
          show={isShowControls || !playerStatus.playing}
        />
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
    autoplay: false,
    mute: false,
    controls: false,
  },
  stickyConfig: {
    width: 320,
    height: 180,
    position: 'bottom-right',
  },
};

export default StickyVideo;
