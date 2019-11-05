/* global YT */
import load from 'load-script';
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import useDeepCompareEffect from 'use-deep-compare-effect';
import t from '../constants/actionTypes';
import Store from '../store';
import usePlayerEvents from '../hooks/use-player-events';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  controls,
  events,
  setPlayer,
}) => {
  const player = new YT.Player(elemPlayer, {
    videoId,
    playerVars: {
      ...playerVars,
      controls: controls ? 1 : 0,
      playsinline: 1,
      fs: 0,
      origin: window.location.origin,
      cc_load_policy: 3,
    },
  });
  let timeupdateInterval;
  let prevPlayerState;

  const onReady = () => {
    events.onReady(
      player.getDuration(),
      player.isMuted(),
      player.getVolume() / 100,
      {
        play: () => {
          player.playVideo();
        },
        pause: () => {
          player.pauseVideo();
        },
        seekTo: (second, isSeeking, isPlaying) => {
          player.seekTo(second, !isSeeking);
          if (!isSeeking && isPlaying) {
            player.playVideo();
          } else if (timeupdateInterval) {
            clearInterval(timeupdateInterval);
          }
        },
        setMuted: (isMuted) => {
          if (isMuted) {
            player.mute();
          } else {
            player.unMute();
          }
        },
        setVolume: (volume) => {
          if (volume !== undefined) {
            player.setVolume(Math.round(volume * 100));
            if (volume > 0 && player.muted) {
              player.unMute();
            }
          }
        },
      },
    );
  };
  const onTimeUpdate = () => {
    events.onTimeUpdate(
      player.getCurrentTime(),
      player.getVideoLoadedFraction
        ? player.getVideoLoadedFraction()
        : undefined,
    );
  };
  const onStateChange = ({ data: playerState }) => {
    if (playerState === YT.PlayerState.PLAYING) {
      timeupdateInterval = setInterval(onTimeUpdate, 200);
    } else {
      clearInterval(timeupdateInterval);
    }
    switch (playerState) {
      case YT.PlayerState.PLAYING:
        events.onPlay();
        break;
      case YT.PlayerState.BUFFERING:
        if ([
          -1,
          YT.PlayerState.PLAYING,
        ].indexOf(prevPlayerState) > -1) {
          events.onPlay();
        }
        break;
      case YT.PlayerState.ENDED:
      case YT.PlayerState.PAUSED:
        events.onPause();
        break;
      case YT.PlayerState.CUED:
        events.onDurationChange(player.getDuration());
        break;
      default:
    }
    prevPlayerState = playerState;
  };

  player.addEventListener('onReady', onReady);
  player.addEventListener('onStateChange', onStateChange);
  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('onReady', onReady);
      player.removeEventListener('onStateChange', onStateChange);
      clearInterval(timeupdateInterval);
    },
  });
};

const Youtube = ({
  videoId,
  playerVars,
  controls,
}) => {
  const { dispatch } = useContext(Store);
  const [player, setPlayer] = useState({});
  const refPlayer = useRef(null);
  const events = usePlayerEvents(dispatch);

  // create/destory the youtube player
  useDeepCompareEffect(() => {
    if (!player.element) {
      const params = {
        elemPlayer: refPlayer.current,
        videoId,
        playerVars,
        controls,
        events,
        setPlayer,
      };
      if (libLoaded) {
        genPlayer(params);
      } else {
        load('https://www.youtube.com/iframe_api', () => {
          window.onYouTubeIframeAPIReady = () => {
            genPlayer(params);
            libLoaded = true;
          };
        });
      }
    }
    return () => {
      if (player.element) {
        player.removeEventListeners();
        player.element.destroy();
        dispatch({
          type: t.DESTROY_PLAYER,
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, playerVars]);

  // play another video
  useEffect(() => {
    if (player.element) {
      if (playerVars.autoplay) {
        player.element.loadVideoById(videoId);
      } else {
        player.element.cueVideoById(videoId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return <div ref={refPlayer} />;
};

Youtube.propTypes = {
  videoId: PropTypes.string.isRequired,
  playerVars: PropTypes.shape({
    autoplay: PropTypes.bool,
  }).isRequired,
  controls: PropTypes.bool.isRequired,
};

export default Youtube;
