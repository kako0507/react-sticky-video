/* global DM */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  setPlayer,
  setPlayerStatus,
  setPlayerControls,
}) => {
  const player = DM.player(elemPlayer, {
    video: videoId,
    width: '100%',
    height: '100%',
    params: {
      ...playerVars,
      api: 1,
      controls: false,
      origin: window.location.origin,
    },
  });

  const getLoaded = () => {
    const { bufferedTime, duration } = player;
    if (bufferedTime && duration) {
      return (bufferedTime * 100) / duration;
    }
    return undefined;
  };
  const handleReadyEvent = () => {
    setPlayerStatus((playerStatus) => ({
      ...playerStatus,
      duration: player.duration,
      muted: player.muted,
    }));
    setPlayerControls((playerControl) => ({
      ...playerControl,
      play: () => {
        player.play();
      },
      pause: () => {
        player.pause();
      },
      setMuted: (muted) => {
        player.setMuted(muted);
        console.log('setMuted', muted);
        setPlayerStatus((playerStatus) => ({
          ...playerStatus,
          muted,
        }));
      },
      seekTo: (fraction, allowSeekAhead) => {
        setPlayerStatus((playerStatus) => {
          if (!playerStatus.seeking) {
            return playerStatus;
          }

          const f = fraction === undefined
            ? playerStatus.played / 100
            : fraction;
          const second = playerStatus.duration * f;
          const seeking = !allowSeekAhead;
          const played = f * 100;
          player.seek(second);
          if (!player.paused) {
            player.pause();
          }
          if (!seeking && playerStatus.playing && player.paused) {
            player.play();
          }
          return {
            ...playerStatus,
            played,
            seeking,
            hovered: seeking ? played : undefined,
          };
        });
      },
    }));
  };
  const handleProgressUpdateEvent = () => {
    const loaded = getLoaded();
    if (loaded) {
      setPlayerStatus((playerStatus) => ({
        ...playerStatus,
        loaded,
        duration: player.duration,
      }));
    }
  };
  const handleTimeUpdateEvent = (event) => {
    const { currentTime, duration } = event.target;
    if (currentTime && duration) {
      const played = (currentTime * 100) / duration;
      const loaded = getLoaded(event);
      setPlayerStatus((playerStatus) => ({
        ...playerStatus,
        played,
        loaded: loaded || playerStatus.loaded,
      }));
    }
  };
  const handlePlayEvent = () => {
    setPlayerStatus((playerStatus) => {
      if (playerStatus.seeking) {
        return playerStatus;
      }
      return {
        ...playerStatus,
        playing: true,
        isPlayed: true,
      };
    });
  };
  const handlePauseEvent = () => {
    setPlayerStatus((playerStatus) => {
      if (playerStatus.seeking) {
        return playerStatus;
      }
      return {
        ...playerStatus,
        playing: false,
      };
    });
  };

  player.addEventListener('apiready', handleReadyEvent);
  player.addEventListener('timeupdate', handleTimeUpdateEvent);
  player.addEventListener('progress', handleProgressUpdateEvent);
  player.addEventListener('play', handlePlayEvent);
  player.addEventListener('pause', handlePauseEvent);
  player.addEventListener('end', handlePauseEvent);

  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('apiready', handleReadyEvent);
      player.removeEventListener('timeupdate', handleTimeUpdateEvent);
      player.removeEventListener('progress', handleProgressUpdateEvent);
      player.removeEventListener('play', handlePlayEvent);
      player.removeEventListener('pause', handlePauseEvent);
      player.removeEventListener('end', handlePauseEvent);
    },
  });
};

const Dailymotion = ({
  videoId,
  playerVars,
  setPlayerStatus,
  setPlayerControls,
}) => {
  const [player, setPlayer] = useState({});
  const refPlayer = useRef(null);

  // create the dailymotion player
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
        load('https://api.dmcdn.net/all.js', () => {
          window.dmAsyncInit = () => {
            setTimeout(() => {
              libLoaded = true;
              genPlayer(params);
            }, 1000);
          };
        });
      }
    }
    return () => {
      if (player.element) {
        player.removeEventListeners();
        setPlayerStatus({});
        setPlayerControls({});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // play another video
  useEffect(() => {
    if (player.element) {
      player.element.load({
        ...playerVars,
        video: videoId,
      });
      setPlayerStatus({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, playerVars]);

  return (
    <div className={styles.dailymotion}>
      <div ref={refPlayer} />
    </div>
  );
};

Dailymotion.propTypes = {
  videoId: PropTypes.string.isRequired,
  playerVars: PropTypes.shape({
    autoplay: PropTypes.bool,
  }).isRequired,
  setPlayerStatus: PropTypes.func.isRequired,
  setPlayerControls: PropTypes.func.isRequired,
};

export default Dailymotion;
