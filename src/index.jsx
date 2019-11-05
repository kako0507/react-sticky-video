import _ from 'lodash';
import React, {
  useReducer,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';
import urlParser from 'js-video-url-parser/lib/base';
import 'js-video-url-parser/lib/provider/dailymotion';
import 'js-video-url-parser/lib/provider/youtube';
import checkIsMobile from 'ismobilejs';
import t from './constants/actionTypes';
import {
  isElementInViewport,
  checkFullScreen,
  openFullscreen,
  closeFullscreen,
} from './utils';
import Store from './store';
import reducer from './reducer';
import usePlayerControls from './hooks/use-player-controls';
import Track from './components/track';
import Controls from './components/controls';
import CaptionSetting from './components/caption-setting';
import Youtube from './providerComponents/youtube';
import Dailymotion from './providerComponents/dailymotion';
import FileSource from './providerComponents/file-source';
import styles from './styles.scss';

const initialState = {
  playerStatus: {},
  playerControls: {},
  fullPage: {},
  vttCues: {},
};

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
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    isSticky,
    isFullScreen,
    fullPage,
    isFocusPlayer,
    selectedCaption,
    playerStatus: {
      isReady,
      isPlaying,
      isSeeking,
      isChangingVolume,
      isVolumeSliderVisible,
      currentTime,
    },
  } = state;

  const {
    seekTo,
  } = usePlayerControls(dispatch);

  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);
  const refCCButton = useRef(null);

  const isShowControls = isFocusPlayer || !isPlaying;
  const isFullPage = fullPage?.open;

  const playerSize = isSticky
    ? {
      width: stickyWidth,
      height: stickyHeight,
    }
    : {
      width,
      height,
    };
  const isMobile = playerSize.width < 400 || checkIsMobile(window.navigator.userAgent).any;

  let videoId;
  let provider;
  if (typeof url === 'string') {
    ({ id: videoId, provider } = urlParser.parse(url));
  } else {
    provider = 'file';
  }

  const handleHideControls = useCallback(() => {
    if (_.every([
      !isSeeking,
      !isChangingVolume,
      !isVolumeSliderVisible,
    ])) {
      dispatch({
        type: t.FOCUS_PLAYER,
        data: false,
      });
    }
  }, [
    isSeeking,
    isChangingVolume,
    isVolumeSliderVisible,
  ]);
  const [debounceHideControls, cancelHideControls] = useDebouncedCallback(
    handleHideControls,
    3000,
  );
  const handleShowControls = useCallback(() => {
    dispatch({
      type: t.FOCUS_PLAYER,
      data: true,
    });
    debounceHideControls();
  }, [debounceHideControls]);
  const handlePlayerControl = useCallback((event) => {
    const playing = !isPlaying;
    if (event.type === 'keypress' && event.charCode !== 32) {
      return;
    }
    dispatch({
      type: t.SET_PLAYING,
      data: {
        isPlaying: playing,
        hasAlreadyChanged: false,
      },
    });
    if (playing) {
      handleShowControls();
    }
    event.stopPropagation();
  }, [handleShowControls, isPlaying]);
  const handleClickFullscreen = useCallback(() => {
    const support = openFullscreen(refPlayerContainer.current);
    if (!support) {
      dispatch({
        type: t.SET_FULLPAGE,
        data: true,
      });
    }
  }, []);
  const handleCancelFullscreen = useCallback(() => {
    closeFullscreen();
    if (isFullPage) {
      dispatch({
        type: t.SET_FULLPAGE,
        data: false,
      });
    }
  }, [isFullPage]);

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!isSticky && !isElementInViewport(element)) {
        if (isPlaying) {
          dispatch({
            type: t.SET_STICKY,
            data: true,
          });
        }
      }
      if (isSticky && isElementInViewport(element)) {
        dispatch({
          type: t.SET_STICKY,
          data: false,
        });
      }
    };
    const handleMouseUp = () => {
      if (!isFocusPlayer) {
        return;
      }
      if (isSeeking) {
        seekTo();
      } else if (isChangingVolume) {
        dispatch({
          type: t.SET_VOLUME,
        });
      }
      debounceHideControls();
    };
    const handleFullScreeChange = () => {
      dispatch({
        type: t.SET_FULLSCREEN,
        data: checkFullScreen(),
      });
    };
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('fullscreenchange', handleFullScreeChange);
    document.addEventListener('mozfullscreenchange', handleFullScreeChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreeChange);
    document.addEventListener('msfullscreenchange', handleFullScreeChange);
    return () => {
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('fullscreenchange', handleFullScreeChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreeChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreeChange);
      document.removeEventListener('msfullscreenchange', handleFullScreeChange);
    };
  }, [
    isSticky,
    width,
    height,
    stickyWidth,
    stickyHeight,
    isFocusPlayer,
    seekTo,
    isSeeking,
    isChangingVolume,
    debounceHideControls,
    isPlaying,
  ]);

  useEffect(() => {
    dispatch({
      type: t.SET_PLAYING,
    });
  }, [url]);

  let nodePlayer;
  switch (provider) {
    case 'youtube':
      nodePlayer = (
        <Youtube
          videoId={videoId}
          playerVars={playerVars}
          controls={originalControls}
        />
      );
      break;
    case 'dailymotion':
      nodePlayer = (
        <Dailymotion
          videoId={videoId}
          playerVars={playerVars}
          controls={originalControls}
        />
      );
      break;
    default:
      nodePlayer = (
        <FileSource
          source={url}
          playerVars={playerVars}
          controls={originalControls}
        />
      );
  }

  return (
    <Store.Provider
      value={{
        state,
        dispatch,
      }}
    >
      <div
        className={styles.container}
        style={{
          width,
          height,
        }}
      >
        <div
          ref={refHidden}
          className={classNames(
            styles.hidden,
            { [styles.loading]: !isReady },
          )}
        />
        <div
          role="button"
          tabIndex="0"
          ref={refPlayerContainer}
          className={classNames(
            styles.player,
            {
              [styles.fullPage]: isFullPage,
              [styles.sticky]: isSticky && !isFullPage,
              [styles.stTopRight]: position === 'top-right',
              [styles.stTopLeft]: position === 'top-left',
              [styles.stBottomRight]: position === 'bottom-right',
              [styles.stBottomLeft]: position === 'bottom-left',
            },
          )}
          style={playerSize}
          onMouseLeave={handleHideControls}
          onMouseMove={handleShowControls}
          onFocus={handleShowControls}
        >
          <div
            role="button"
            tabIndex="0"
            className={classNames(
              styles.playerContainer,
              {
                [styles.seeking]: !originalControls && _.some([
                  isSeeking,
                  isChangingVolume,
                  isPlaying,
                ]),
                [styles.hide]: !isReady,
              },
            )}
            onClick={handlePlayerControl}
            onKeyPress={handlePlayerControl}
          >
            {nodePlayer}
          </div>
          {!originalControls && (
            <Controls
              ref={refCCButton}
              isReady={isReady}
              show={isShowControls}
              isFullScreen={isFullScreen || isFullPage}
              isMobile={isMobile}
              captions={captions}
              onClickFullscreen={handleClickFullscreen}
              onCancelFullscreen={handleCancelFullscreen}
              cancelHideControls={cancelHideControls}
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
          {captions?.length > 0 && (
            <CaptionSetting
              elemCCButton={refCCButton.current}
              captions={captions}
              selectedCaption={selectedCaption}
            />
          )}
        </div>
      </div>
    </Store.Provider>
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
