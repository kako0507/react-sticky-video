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
  controls,
  onReady,
  onTimeUpdate,
  onPlayChange,
  onProgressUpdate,
  onDurationChange,
  onSeeking,
  onSetMuted,
  onSetVolume,
  setPlayerControls,
  setPlayer,
}) => {
  const player = DM.player(elemPlayer, {
    video: videoId,
    width: '100%',
    height: '100%',
    params: {
      ...playerVars,
      api: 1,
      controls,
      origin: window.location.origin,
    },
  });

  const handleReadyEvent = () => {
    onReady({
      duration: player.duration,
      isMuted: player.muted,
      volume: player.volume,
    });
    setPlayerControls((playerControl) => ({
      ...playerControl,
      play: () => {
        player.play();
      },
      pause: () => {
        player.pause();
      },
      seekTo: (fraction) => {
        onSeeking(fraction, (second, isSeeking, isPlaying) => {
          player.seek(second);
          if (isSeeking && !player.paused) {
            player.pause();
          }
          if (!isSeeking && isPlaying) {
            player.play();
          }
        });
      },
      setMuted: (isMuted) => {
        player.setMuted(isMuted);
        onSetMuted(isMuted);
      },
      setVolume: (volume) => {
        player.setVolume(volume);
        if (volume > 0 && player.muted) {
          player.setMute(false);
        }
        onSetVolume(volume);
      },
    }));
  };
  const handleTimeUpdateEvent = () => {
    onTimeUpdate(player.currentTime);
  };
  const handlePlayEvent = () => {
    onPlayChange(true);
  };
  const handlePauseEvent = () => {
    onPlayChange(false);
  };
  const handleProgressUpdate = () => {
    const {
      bufferedTime,
      duration,
    } = player;
    let loaded = 0;
    if (bufferedTime && duration) {
      loaded = bufferedTime / duration;
    }
    onProgressUpdate(loaded);
  };
  const handleDurationChange = () => {
    onDurationChange(player.duration);
  };

  player.addEventListener('apiready', handleReadyEvent);
  player.addEventListener('timeupdate', handleTimeUpdateEvent);
  player.addEventListener('play', handlePlayEvent);
  player.addEventListener('pause', handlePauseEvent);
  player.addEventListener('end', handlePauseEvent);
  player.addEventListener('progress', handleProgressUpdate);
  player.addEventListener('durationchange', handleDurationChange);
  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('apiready', handleReadyEvent);
      player.removeEventListener('timeupdate', handleTimeUpdateEvent);
      player.removeEventListener('play', handlePlayEvent);
      player.removeEventListener('pause', handlePauseEvent);
      player.removeEventListener('end', handlePauseEvent);
      player.removeEventListener('progress', handleProgressUpdate);
      player.removeEventListener('durationchange', handleDurationChange);
    },
  });
};

const Dailymotion = ({
  videoId,
  playerVars,
  controls,
  onReady,
  onTimeUpdate,
  onPlayChange,
  onProgressUpdate,
  onDurationChange,
  onSeeking,
  onSetMuted,
  onSetVolume,
  onDestroy,
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
        controls,
        onReady,
        onTimeUpdate,
        onPlayChange,
        onProgressUpdate,
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
        onDestroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, playerVars]);

  // play another video
  useEffect(() => {
    if (player.element) {
      player.element.load({
        ...playerVars,
        video: videoId,
      });
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
  controls: PropTypes.bool.isRequired,
  onReady: PropTypes.func.isRequired,
  onTimeUpdate: PropTypes.func.isRequired,
  onPlayChange: PropTypes.func.isRequired,
  onProgressUpdate: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onSeeking: PropTypes.func.isRequired,
  onSetMuted: PropTypes.func.isRequired,
  onSetVolume: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  setPlayerControls: PropTypes.func.isRequired,
};

export default Dailymotion;
