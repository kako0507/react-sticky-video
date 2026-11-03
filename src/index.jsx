import {
  useReducer,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import clsx from 'clsx';
import { useDebouncedCallback } from 'use-debounce';
import t from './constants/actionTypes';
import {
  parseYouTubeVideoId,
  isElementInViewport,
  checkFullScreen,
  openFullscreen,
  closeFullscreen,
} from './utils';
import Store from './store';
import reducer from './reducer';
import usePlayerControls from './hooks/use-player-controls';
import useMediaQuery from './hooks/use-media-query';
import useDraggable from './hooks/use-draggable';
import Track from './components/track';
import Controls from './components/controls';
import CaptionSetting from './components/caption-setting';
import Youtube from './providerComponents/youtube';
import FileSource from './providerComponents/file-source';
import styles from './app.module.scss';

const initialState = {
  playerStatus: {},
  playerControls: {},
  vttCues: {},
};

const DEFAULT_PLAYER_VARS = Object.freeze({
  autoplay: false,
  muted: false,
});

const DEFAULT_CAPTIONS = Object.freeze([]);

const DEFAULT_STICKY_CONFIG = Object.freeze({
  width: 320,
  height: 180,
  position: 'bottom-right',
  draggable: true,
});

const HIDE_CONTROLS_DELAY = 3000;

// touch screens can't hover, so the volume slider is hidden there
const TOUCH_DEVICE_QUERY = '(pointer: coarse)';
const COMPACT_PLAYER_WIDTH = 400;

const getVideoSource = (url) => {
  const videoId = parseYouTubeVideoId(url);
  return videoId
    ? { provider: 'youtube', videoId }
    : { provider: 'file' };
};

/**
 * A video player that floats to a corner of the viewport while it is playing
 * and has been scrolled out of view.
 *
 * @param {object} props
 * @param {string | Array<{ src: string, type?: string }>} props.url
 *   A YouTube URL, a video file URL, or a list of `<source>` entries.
 * @param {number} [props.width=640] Width of the inline player.
 * @param {number} [props.height=360] Height of the inline player.
 * @param {object} [props.playerVars] Parameters passed to the underlying player.
 * @param {Array<{ src: string, label: string, default?: boolean }>} [props.captions]
 *   WebVTT caption tracks.
 * @param {{ width?: number, height?: number, position?: 'top-right' | 'top-left'
 *   | 'bottom-right' | 'bottom-left', draggable?: boolean }} [props.stickyConfig]
 *   Size, position and dragging behavior of the floating player.
 * @param {boolean} [props.originalControls=false] Use the provider's native controls.
 */
const StickyVideo = ({
  url,
  width = 640,
  height = 360,
  playerVars = DEFAULT_PLAYER_VARS,
  captions = DEFAULT_CAPTIONS,
  stickyConfig,
  originalControls = false,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    isSticky,
    isFullScreen,
    isFullPage,
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
    width: stickyWidth,
    height: stickyHeight,
    position,
    draggable,
  } = { ...DEFAULT_STICKY_CONFIG, ...stickyConfig };

  const { seekTo } = usePlayerControls(dispatch);

  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);
  const refCCButton = useRef(null);

  const isShowControls = isFocusPlayer || !isPlaying;
  const hasCaptions = captions.length > 0;

  const playerSize = isSticky
    ? { width: stickyWidth, height: stickyHeight }
    : { width, height };
  const isFloating = isSticky && !isFullPage;
  const isDraggable = isFloating && draggable;
  const { offset: dragOffset, isDragging, dragHandlers } = useDraggable({
    enabled: isDraggable,
    layout: { position, width: stickyWidth, height: stickyHeight },
  });

  const isTouchDevice = useMediaQuery(TOUCH_DEVICE_QUERY);
  const isMobile = playerSize.width < COMPACT_PLAYER_WIDTH || isTouchDevice;

  const { provider, videoId } = getVideoSource(url);

  const canHideControls = !isSeeking && !isChangingVolume && !isVolumeSliderVisible;
  const handleHideControls = useCallback(() => {
    if (canHideControls) {
      dispatch({
        type: t.FOCUS_PLAYER,
        data: false,
      });
    }
  }, [canHideControls]);
  const debounceHideControls = useDebouncedCallback(
    handleHideControls,
    HIDE_CONTROLS_DELAY,
  );
  const cancelHideControls = debounceHideControls.cancel;
  const handleShowControls = useCallback(() => {
    dispatch({
      type: t.FOCUS_PLAYER,
      data: true,
    });
    debounceHideControls();
  }, [debounceHideControls]);
  const handlePlayerControl = useCallback((event) => {
    if (event.type === 'keydown') {
      if (event.key !== ' ') {
        return;
      }
      event.preventDefault();
    }
    const playing = !isPlaying;
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
    dispatch({
      type: t.SET_FULLPAGE,
      data: false,
    });
  }, []);

  // float the player while it is playing and scrolled out of the viewport
  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      const inViewport = isElementInViewport(element);
      if (!isSticky && !inViewport && isPlaying) {
        dispatch({
          type: t.SET_STICKY,
          data: true,
        });
      } else if (isSticky && inViewport) {
        dispatch({
          type: t.SET_STICKY,
          data: false,
        });
      }
    };
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky, isPlaying]);

  // finish seeking / changing volume when the pointer is released anywhere
  useEffect(() => {
    if (!isFocusPlayer) {
      return undefined;
    }
    const handleMouseUp = () => {
      if (isSeeking) {
        seekTo();
      } else if (isChangingVolume) {
        dispatch({
          type: t.SET_VOLUME,
        });
      }
      debounceHideControls();
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isFocusPlayer, isSeeking, isChangingVolume, seekTo, debounceHideControls]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      dispatch({
        type: t.SET_FULLSCREEN,
        data: checkFullScreen(),
      });
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    };
  }, []);

  // "full page" fallback for browsers without the Fullscreen API (e.g. iOS Safari)
  useEffect(() => {
    if (!isFullPage) {
      return undefined;
    }
    const { style } = document.body;
    const { width: bodyWidth, height: bodyHeight, overflow } = style;
    style.width = '100vw';
    style.height = '100vh';
    style.overflow = 'hidden';
    return () => {
      style.width = bodyWidth;
      style.height = bodyHeight;
      style.overflow = overflow;
    };
  }, [isFullPage]);

  useEffect(() => {
    dispatch({
      type: t.SET_PLAYING,
    });
  }, [url]);

  useEffect(() => () => {
    debounceHideControls.cancel();
  }, [debounceHideControls]);

  const storeValue = useMemo(() => ({ state, dispatch }), [state]);

  const nodePlayer = provider === 'youtube'
    ? (
      <Youtube
        videoId={videoId}
        playerVars={playerVars}
        controls={originalControls}
      />
    )
    : (
      <FileSource
        // remount when the source changes so the browser reloads the media
        key={JSON.stringify(url)}
        source={url}
        playerVars={playerVars}
        controls={originalControls}
      />
    );

  return (
    <Store.Provider value={storeValue}>
      <div
        className={styles.container}
        style={{ width, height }}
      >
        <div
          ref={refHidden}
          className={clsx(
            styles.hidden,
            { [styles.loading]: !isReady },
          )}
        />
        <div
          role="region"
          aria-label="Video player"
          ref={refPlayerContainer}
          className={clsx(
            styles.player,
            {
              [styles.fullPage]: isFullPage,
              [styles.sticky]: isFloating,
              [styles.stTopRight]: position === 'top-right',
              [styles.stTopLeft]: position === 'top-left',
              [styles.stBottomRight]: position === 'bottom-right',
              [styles.stBottomLeft]: position === 'bottom-left',
            },
          )}
          style={isDraggable
            ? { ...playerSize, translate: `${dragOffset.x}px ${dragOffset.y}px` }
            : playerSize}
          onMouseLeave={handleHideControls}
          onMouseMove={handleShowControls}
          onFocus={handleShowControls}
        >
          <div
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={clsx(
              styles.playerContainer,
              {
                // let our handlers (not the YouTube iframe) receive pointer events
                [styles.seeking]: !originalControls
                  && (isSeeking || isChangingVolume || isPlaying || isDraggable),
                [styles.draggable]: isDraggable,
                [styles.dragging]: isDragging,
                [styles.hide]: !isReady,
              },
            )}
            {...dragHandlers}
            onClick={handlePlayerControl}
            onKeyDown={handlePlayerControl}
          >
            {nodePlayer}
          </div>
          {!originalControls && (
            <Controls
              ccButtonRef={refCCButton}
              isReady={isReady}
              show={isShowControls}
              isFullScreen={isFullScreen || isFullPage}
              isMobile={isMobile}
              hasCaptions={hasCaptions}
              onClickFullscreen={handleClickFullscreen}
              onCancelFullscreen={handleCancelFullscreen}
              cancelHideControls={cancelHideControls}
            />
          )}
          {selectedCaption && hasCaptions && (
            <Track
              isShowControls={isShowControls}
              currentTime={currentTime}
              captions={captions}
              selectedCaption={selectedCaption}
            />
          )}
          {hasCaptions && (
            <CaptionSetting
              refCCButton={refCCButton}
              captions={captions}
            />
          )}
        </div>
      </div>
    </Store.Provider>
  );
};

export default StickyVideo;
