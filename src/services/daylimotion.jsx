/* global DM */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles.scss';

let loaded;

const genPlayer = ({
  elemPlayer,
  playerVars: {
    autoplay,
    mute,
    ...playerVars
  },
  setPlayer,
  setPlaying,
}) => {
  const handlePlayEvent = setPlaying.bind(null, true);
  const handlePauseEvent = setPlaying.bind(null, false);

  const player = DM.player(elemPlayer, {
    video: 'xwr14q',
    width: '100%',
    height: '100%',
    params: {
      ...playerVars,
      autoplay,
      mute: autoplay ? true : mute,
      playsinline: true,
    },
  });

  player.addEventListener('play', handlePlayEvent);
  player.addEventListener('pause', handlePauseEvent);
  player.addEventListener('end', handlePauseEvent);

  setPlayer(player);
};

const Dailymotion = ({
  videoId,
  playerVars,
  setPlaying,
}) => {
  const [player, setPlayer] = useState(null);
  const refPlayer = useRef(null);

  // create/destory the youtube player
  useEffect(() => {
    if (!player) {
      const params = {
        elemPlayer: refPlayer.current,
        playerVars,
        setPlaying,
        setPlayer,
      };
      if (loaded) {
        genPlayer(params);
      } else {
        load('https://api.dmcdn.net/all.js', () => {
          loaded = true;
          genPlayer(params);
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    if (player) {
      player.load({
        video: videoId,
        autoplay: playerVars.autoplay,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

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
  setPlaying: PropTypes.func.isRequired,
};

export default Dailymotion;
