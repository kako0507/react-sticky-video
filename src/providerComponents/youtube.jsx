/* global YT */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import useDeepCompareEffect from 'use-deep-compare-effect';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  controls,
  onReady,
  onTimeUpdate,
  onPlayChange,
  onDurationChange,
  onSeeking,
  onSetMuted,
  onSetVolume,
  setPlayerControls,
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
    },
  });
  let timeupdateInterval;
  let prevPlayerState;

  const getLoaded = () => {
    if (player.getVideoLoadedFraction) {
      return player.getVideoLoadedFraction();
    }
    return undefined;
  };
  const handleReadyEvent = () => {
    onReady({
      duration: player.getDuration(),
      isMuted: player.isMuted(),
      volume: player.getVolume() / 100,
    });
    setPlayerControls((playerControl) => ({
      ...playerControl,
      play: () => {
        player.playVideo();
      },
      pause: () => {
        player.pauseVideo();
      },
      seekTo: (fraction) => {
        onSeeking(fraction, (second, isSeeking, isPlaying) => {
          player.seekTo(second, !isSeeking);
          if (!isSeeking && isPlaying) {
            player.playVideo();
          } else if (timeupdateInterval) {
            clearInterval(timeupdateInterval);
          }
        });
      },
      setMuted: (isMuted) => {
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
        onSetMuted(isMuted);
      },
      setVolume: (volume) => {
        player.setVolume(Math.round(volume * 100));
        if (volume > 0 && player.isMuted()) {
          player.unMute();
        }
        onSetVolume(volume);
      },
    }));
  };
  const handleTimeUpdateEvent = () => {
    const currentTime = player.getCurrentTime();
    const loaded = getLoaded();
    onTimeUpdate(currentTime, loaded);
  };
  const handleStateChange = ({ data: playerState }) => {
    if (playerState === YT.PlayerState.PLAYING) {
      timeupdateInterval = setInterval(handleTimeUpdateEvent, 200);
    } else {
      clearInterval(timeupdateInterval);
    }
    switch (playerState) {
      case YT.PlayerState.ENDED:
        onPlayChange(false);
        break;
      case YT.PlayerState.PLAYING:
        onPlayChange(true);
        break;
      case YT.PlayerState.PAUSED:
        onPlayChange(false);
        break;
      case YT.PlayerState.BUFFERING:
        if ([
          -1,
          YT.PlayerState.PLAYING,
        ].indexOf(prevPlayerState) > -1) {
          onPlayChange(true);
        }
        break;
      case YT.PlayerState.CUED:
        onDurationChange(player.getDuration());
        break;
      default:
    }
    prevPlayerState = playerState;
  };

  player.addEventListener('onReady', handleReadyEvent);
  player.addEventListener('onStateChange', handleStateChange);
  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('onReady', handleReadyEvent);
      player.removeEventListener('onStateChange', handleStateChange);
      clearInterval(timeupdateInterval);
    },
  });
};

const Youtube = ({
  videoId,
  playerVars,
  controls,
  onReady,
  onTimeUpdate,
  onPlayChange,
  onDurationChange,
  onSeeking,
  onSetMuted,
  onSetVolume,
  onDestroy,
  setPlayerControls,
}) => {
  const [player, setPlayer] = useState({});
  const refPlayer = useRef(null);

  // create/destory the youtube player
  useDeepCompareEffect(() => {
    if (!player.element) {
      const params = {
        elemPlayer: refPlayer.current,
        videoId,
        playerVars,
        controls,
        onReady,
        onTimeUpdate,
        onPlayChange,
        onDurationChange,
        onSeeking,
        onSetMuted,
        onSetVolume,
        setPlayerControls,
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
        onDestroy();
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
  onReady: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func.isRequired,
  onPlayChange: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onSeeking: PropTypes.func.isRequired,
  onSetMuted: PropTypes.func.isRequired,
  onSetVolume: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  setPlayerControls: PropTypes.func.isRequired,
};

export default Youtube;
