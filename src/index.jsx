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
import Track from './components/track';
import Controls from './components/controls';
import CaptionSetting from './components/caption-setting';
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
  captions,
  stickyConfig: {
    width: stickyWidth,
    height: stickyHeight,
    position,
  },
  originalControls,
}) => {
  const [isSticky, setSticky] = useState(false);
  const [isFocusPlayer, setFocusPlayer] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [fullPage, setFullPage] = useState({
    open: false,
  });
  const [playerStatus, setPlayerStatus] = useState({});
  const [playerControls, setPlayerControls] = useState({});
  const [selectedCaption, setSelectedCaption] = useState('');

  const {
    isSeeking,
    isSettingVolume,
    currentTime,
  } = playerStatus;

  const {
    seekTo,
  } = playerControls;

  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);

  const isShowControls = isFocusPlayer || !playerStatus.isPlaying;

  let videoId;
  let provider;
  if (typeof url === 'string') {
    ({ id: videoId, provider } = urlParser.parse(url));
  } else {
    provider = 'file';
  }

  const handleHideControls = useCallback(() => {
    if (!isSeeking && !isSettingVolume) {
      setFocusPlayer(false);
    }
  }, [isSeeking, isSettingVolume]);
  const debounceHideControls = useCallback(
    _.debounce(handleHideControls, 3000),
    [],
  );
  const handleShowControls = useCallback(() => {
    setFocusPlayer(true);
    debounceHideControls();
  }, [debounceHideControls]);
  const handlePlayerControl = useCallback((event) => {
    if (event.type === 'keypress' && event.charCode !== 32) {
      return;
    }
    if (playerStatus.isPlaying) {
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
  }, [handleShowControls, playerControls, playerStatus.isPlaying]);
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

  const handleReady = useCallback((status) => {
    setPlayerStatus((ps) => ({
      ...ps,
      ...status,
    }));
  }, []);
  const handleTimeUpdate = useCallback((time, loaded) => {
    setPlayerStatus((ps) => {
      const { duration } = ps;
      if (!time || !duration || ps.isSeeking) {
        return ps;
      }
      return {
        ...ps,
        currentTime: time,
        loaded: loaded || ps.loaded,
      };
    });
  }, []);
  const handlePlayChange = useCallback((isPlaying) => {
    setPlayerStatus((ps) => {
      if (ps.isSeeking) {
        return ps;
      }
      return {
        ...ps,
        isPlaying,
        hasPlayed: isPlaying || ps.hasPlayed,
      };
    });
  }, []);
  const handleProgressUpdate = useCallback((loaded) => {
    setPlayerStatus((ps) => ({
      ...ps,
      loaded,
    }));
  }, []);
  const handleDurationChange = useCallback((duration) => {
    setPlayerStatus((ps) => ({
      ...ps,
      duration,
    }));
  }, []);
  const handleSeeking = useCallback((fraction, handler) => {
    setPlayerStatus((ps) => {
      const time = fraction === undefined
        ? ps.currentTime
        : ps.duration * fraction;
      const seeking = !!fraction;
      handler(time, seeking, ps.isPlaying);
      return {
        ...ps,
        isSeeking: seeking,
        currentTime: time,
        hoveredTime: seeking ? time : undefined,
      };
    });
  }, []);
  const handleSetMuted = useCallback((isMuted) => {
    setPlayerStatus((ps) => ({
      ...ps,
      isMuted,
    }));
  }, []);
  const handleSetVolume = useCallback((volume) => {
    setPlayerStatus((ps) => ({
      ...ps,
      volume,
      isMuted: volume === 0,
      isSettingVolume: true,
    }));
  }, []);
  const handleDestroy = useCallback(() => {
    setPlayerStatus({});
    setPlayerControls({});
  }, []);

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!isSticky && !isElementInViewport(element)) {
        if (playerStatus.isPlaying) {
          setSticky(true);
        }
      }
      if (isSticky && isElementInViewport(element)) {
        setSticky(false);
      }
    };
    const handleMouseUp = (event) => {
      if (!isFocusPlayer) {
        return;
      }
      if (isSeeking) {
        if (seekTo) {
          seekTo();
        }
      } else if (isSettingVolume) {
        setPlayerStatus((ps) => ({
          ...ps,
          isSettingVolume: false,
        }));
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const handleFullScreeChange = () => {
      setFullScreen(checkFullScreen());
    };
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('fullscreenchange', handleFullScreeChange);
    document.addEventListener('mozfullscreenchange', handleFullScreeChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreeChange);
    document.addEventListener('msfullscreenchange', handleFullScreeChange);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('fullscreenchange', handleFullScreeChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreeChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreeChange);
      document.removeEventListener('msfullscreenchange', handleFullScreeChange);
    };
  }, [
    isSticky,
    playerStatus.isPlaying,
    width,
    height,
    stickyWidth,
    stickyHeight,
    isFocusPlayer,
    seekTo,
    isSeeking,
    isSettingVolume,
  ]);

  useEffect(() => {
    setPlayerStatus((ps) => ({
      ...ps,
      hasPlayed: playerVars.autoplay,
      isPlaying: false,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  let nodePlayer;
  switch (provider) {
    case 'youtube':
      nodePlayer = (
        <Youtube
          videoId={videoId}
          playerVars={playerVars}
          controls={originalControls}
          onReady={handleReady}
          onTimeUpdate={handleTimeUpdate}
          onPlayChange={handlePlayChange}
          onDurationChange={handleDurationChange}
          onSeeking={handleSeeking}
          onSetMuted={handleSetMuted}
          onSetVolume={handleSetVolume}
          onDestroy={handleDestroy}
          setPlayerControls={setPlayerControls}
        />
      );
      break;
    case 'dailymotion':
      nodePlayer = (
        <Dailymotion
          videoId={videoId}
          playerVars={playerVars}
          controls={originalControls}
          onReady={handleReady}
          onTimeUpdate={handleTimeUpdate}
          onPlayChange={handlePlayChange}
          onProgressUpdate={handleProgressUpdate}
          onDurationChange={handleDurationChange}
          onSeeking={handleSeeking}
          onSetMuted={handleSetMuted}
          onSetVolume={handleSetVolume}
          onDestroy={handleDestroy}
          setPlayerControls={setPlayerControls}
        />
      );
      break;
    default:
      nodePlayer = (
        <FileSource
          source={url}
          playerVars={playerVars}
          controls={originalControls}
          onReady={handleReady}
          onTimeUpdate={handleTimeUpdate}
          onPlayChange={handlePlayChange}
          onProgressUpdate={handleProgressUpdate}
          onDurationChange={handleDurationChange}
          onSeeking={handleSeeking}
          onSetMuted={handleSetMuted}
          onSetVolume={handleSetVolume}
          onDestroy={handleDestroy}
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
            [styles.sticky]: isSticky && !fullPage.open,
            [styles.stTopRight]: position === 'top-right',
            [styles.stTopLeft]: position === 'top-left',
            [styles.stBottomRight]: position === 'bottom-right',
            [styles.stBottomLeft]: position === 'bottom-left',
          },
        )}
        style={(isSticky
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
              [styles.seeking]: !originalControls && _.some([
                playerStatus.isSeeking,
                playerStatus.isSettingVolume,
                playerStatus.isPlaying,
              ]),
            },
          )}
          onClick={handlePlayerControl}
          onKeyPress={handlePlayerControl}
        >
          {nodePlayer}
        </div>
        {!originalControls && (
          <Controls
            isFullScreen={isFullScreen || fullPage.open}
            onClickFullscreen={handleClickFullscreen}
            onCancelFullscreen={handleCancelFullscreen}
            playerStatus={playerStatus}
            playerControls={playerControls}
            setPlayerStatus={setPlayerStatus}
            captions={captions}
            selectedCaption={selectedCaption}
            setSelectedCaption={setSelectedCaption}
            show={isShowControls}
          />
        )}
        {selectedCaption && captions?.length > 0 && (
          <Track
            isShowControls={isShowControls}
            isSticky={isSticky}
            currentTime={currentTime}
            captions={captions}
            selectedCaption={selectedCaption}
          />
        )}
        <CaptionSetting
          captions={captions}
          selectedCaption={selectedCaption}
          setSelectedCaption={setSelectedCaption}
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
  }),
  captions: PropTypes.arrayOf(
    PropTypes.object,
  ),
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
  originalControls: PropTypes.bool,
};

StickyVideo.defaultProps = {
  width: 640,
  height: 360,
  playerVars: {
    autoplay: false,
    mute: false,
  },
  captions: [],
  stickyConfig: {
    width: 320,
    height: 180,
    position: 'bottom-right',
  },
  originalControls: false,
};

export default StickyVideo;
