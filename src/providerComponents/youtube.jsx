/* global YT */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  setPlayerStatus,
  setPlayerControls,
  setPlayer,
}) => {
  const player = new YT.Player(elemPlayer, {
    videoId,
    playerVars: {
      ...playerVars,
      controls: playerVars.controls ? 1 : 0,
      playsinline: 1,
    },
  });
  let timeupdateInterval;

  const getLoaded = () => {
    if (player.getVideoLoadedFraction) {
      const loaded = player.getVideoLoadedFraction();
      return loaded * 100;
    }
    return undefined;
  };
  const handleReadyEvent = () => {
    if (playerVars.autoplay) {
      player.playVideo();
    }

    setPlayerStatus((playerStatus) => ({
      ...playerStatus,
      duration: player.getDuration(),
    }));

    setPlayerControls((playerControl) => ({
      ...playerControl,
      play: () => {
        player.playVideo();
      },
      pause: () => {
        player.pauseVideo();
      },
      seekTo: (fraction, allowSeekAhead) => {
        setPlayerStatus((playerStatus) => {
          if (!playerStatus.seeking) {
            return playerStatus;
          }

          const f = fraction === undefined
            ? playerStatus.played / 100
            : fraction;
          const duration = player.getDuration();
          const second = duration * f;
          const seeking = !allowSeekAhead;
          const played = f * 100;
          player.seekTo(second, allowSeekAhead);
          return {
            ...playerStatus,
            played,
            seeking,
            hovered: seeking ? played : undefined,
          };
        });
        if (timeupdateInterval) {
          clearInterval(timeupdateInterval);
        }
      },
      setMuted: (muted) => {
        if (muted) {
          player.mute();
        } else {
          player.unMute();
        }
        setPlayerStatus((playerStatus) => ({
          ...playerStatus,
          muted,
        }));
      },
    }));
  };
  const handleTimeUpdateEvent = () => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (currentTime && duration) {
      const played = (currentTime * 100) / duration;
      const loaded = getLoaded();
      setPlayerStatus((playerStatus) => {
        if (playerStatus.seeking) {
          return playerStatus;
        }
        return {
          ...playerStatus,
          played,
          loaded: loaded || playerStatus.loaded,
        };
      });
    }
  };
  const handleStateChange = (event) => {
    setPlayerStatus((playerStatus) => {
      let playing = false;
      let isPlayed;
      switch (event.data) {
        case YT.PlayerState.PLAYING:
          playing = true;
          isPlayed = true;
          timeupdateInterval = setInterval(handleTimeUpdateEvent, 100);
          break;
        case YT.PlayerState.BUFFERING:
          playing = true;
          clearInterval(timeupdateInterval);
          break;
        default:
          clearInterval(timeupdateInterval);
      }
      if (playerStatus.seeking) {
        return playerStatus;
      }
      return {
        ...playerStatus,
        isPlayed: isPlayed || playerStatus.isPlayed,
        muted: player.isMuted(),
        playing,
      };
    });
  };

  player.addEventListener('onReady', handleReadyEvent);
  player.addEventListener('onStateChange', handleStateChange);
  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('onReady', handleReadyEvent);
      player.removeEventListener('onStateChange', handleStateChange);
    },
  });
};

const Youtube = ({
  videoId,
  playerVars,
  setPlayerStatus,
  setPlayerControls,
}) => {
  const [player, setPlayer] = useState({});
  const refPlayer = useRef(null);

  // create/destory the youtube player
  useEffect(() => {
    if (!player.element) {
      const params = {
        elemPlayer: refPlayer.current,
        videoId,
        playerVars,
        setPlayerStatus,
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
        setPlayerStatus({});
        setPlayerControls({});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // play another video
  useEffect(() => {
    if (player.element) {
      if (playerVars.autoplay) {
        player.element.loadVideoById(videoId);
      } else {
        player.element.cueVideoById(videoId);
        setPlayerStatus((playerStatus) => ({
          ...playerStatus,
          isPlayed: false,
        }));
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
  setPlayerStatus: PropTypes.func.isRequired,
  setPlayerControls: PropTypes.func.isRequired,
};

export default Youtube;
