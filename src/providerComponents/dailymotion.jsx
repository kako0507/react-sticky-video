/* global DM */
import load from 'load-script';
import React, {
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import PropTypes from 'prop-types';
import t from '../constants/actionTypes';
import Store from '../store';
import styles from '../styles.scss';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  controls,
  dispatch,
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
    dispatch({
      type: t.CREATE_PLAYER,
      data: {
        playerStatus: {
          duration: player.duration,
          isMuted: player.muted,
          volume: player.volume,
        },
        playerControls: {
          play: () => {
            player.play();
          },
          pause: () => {
            player.pause();
          },
          seekTo: (fraction) => {
            dispatch({
              type: t.SEEK_TO_FRACTION,
              data: {
                fraction,
                handler: (second, isSeeking, isPlaying) => {
                  player.seek(second);
                  if (isSeeking && !player.paused) {
                    player.pause();
                  }
                  if (!isSeeking && isPlaying) {
                    player.play();
                  }
                },
              },
            });
          },
          setMuted: (isMuted) => {
            player.setMuted(isMuted);
            dispatch({
              type: t.SET_MUTE,
              data: isMuted,
            });
          },
          setVolume: (volume) => {
            if (volume !== undefined) {
              player.setVolume(volume);
              if (volume > 0 && player.muted) {
                player.setMute(false);
              }
            }
            dispatch({
              type: t.SET_VOLUME,
              data: volume,
            });
          },
        },
      },
    });
  };
  const handleTimeUpdateEvent = () => {
    dispatch({
      type: t.SET_CURRENT_TIME,
      data: {
        currentTime: player.currentTime,
      },
    });
  };
  const handlePlayEvent = () => {
    dispatch({
      type: t.SET_PLAYING,
      data: true,
    });
  };
  const handlePauseEvent = () => {
    dispatch({
      type: t.SET_PLAYING,
      data: false,
    });
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
    dispatch({
      type: t.SET_LOADED_PERCENTAGE,
      data: loaded,
    });
  };
  const handleDurationChange = () => {
    dispatch({
      type: t.SET_DURATION,
      data: player.duration,
    });
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
}) => {
  const { dispatch } = useContext(Store);
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
        dispatch,
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
        dispatch({
          type: t.DESTROY_PLAYER,
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, playerVars]);

  // play another video or update playerVars
  useDeepCompareEffect(() => {
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
};

export default Dailymotion;
