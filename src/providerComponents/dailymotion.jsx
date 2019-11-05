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
import usePlayerEvents from '../hooks/use-player-events';
import styles from '../styles.scss';

let libLoaded;

const genPlayer = ({
  elemPlayer,
  videoId,
  playerVars,
  controls,
  events,
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

  const onReady = () => {
    events.onReady(
      player.duration,
      player.muted,
      player.volume,
      {
        play: () => {
          player.play();
        },
        pause: () => {
          player.pause();
        },
        seekTo: (second, isSeeking, isPlaying) => {
          player.seek(second);
          if (isSeeking && !player.paused) {
            player.pause();
          }
          if (!isSeeking && isPlaying) {
            player.play();
          }
        },
        setMuted: (isMuted) => {
          player.setMuted(isMuted);
        },
        setVolume: (volume) => {
          if (volume !== undefined) {
            player.setVolume(volume);
            if (volume > 0 && player.muted) {
              player.setMute(false);
            }
          }
        },
      },
    );
  };
  const onDurationChange = () => {
    events.onDurationChange(player.duration);
  };
  const onTimeUpdate = () => {
    events.onTimeUpdate(player.currentTime);
  };
  const onProgressUpdate = () => {
    const {
      bufferedTime,
      duration,
    } = player;
    let loaded = 0;
    if (bufferedTime && duration) {
      loaded = bufferedTime / duration;
    }
    events.onProgressUpdate(loaded);
  };

  player.addEventListener('apiready', onReady);
  player.addEventListener('durationchange', onDurationChange);
  player.addEventListener('timeupdate', onTimeUpdate);
  player.addEventListener('progress', onProgressUpdate);
  player.addEventListener('play', events.onPlay);
  player.addEventListener('pause', events.onPause);
  player.addEventListener('end', events.onPause);
  setPlayer({
    element: player,
    removeEventListeners: () => {
      player.removeEventListener('apiready', onReady);
      player.removeEventListener('durationchange', onDurationChange);
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('progress', onProgressUpdate);
      player.removeEventListener('play', events.onPlay);
      player.removeEventListener('pause', events.onPause);
      player.removeEventListener('end', events.onPause);
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
  const events = usePlayerEvents(dispatch);

  // create the dailymotion player
  useEffect(() => {
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
  }, [player]);

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
