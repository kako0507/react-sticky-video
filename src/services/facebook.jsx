/* global FB */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

let loaded;

const refresh = (appId) => {
  FB.init({
    appId,
    xfbml: true,
    version: 'v3.2',
  });
};

const genPlayer = ({
  appId,
  setPlayer,
  setPlaying,
}) => {
  const handlePlayEvent = setPlaying.bind(null, true);
  const handlePauseEvent = setPlaying.bind(null, false);

  refresh(appId);

  FB.Event.subscribe('xfbml.ready', (msg) => {
    if (msg.type === 'video') {
      const player = msg.instance;
      player.subscribe('startedPlaying', handlePlayEvent);
      player.subscribe('paused', handlePauseEvent);
      player.subscribe('finishedPlaying', handlePauseEvent);
      player.subscribe('error', handlePauseEvent);
      setPlayer(player);
    }
  });
};

const Facebook = ({
  url,
  width,
  height,
  controls,
  autoPlay,
  setPlaying,
  config: { appId },
}) => {
  const [player, setPlayer] = useState(null);
  const refPlayer = useRef(null);

  // create/destory the youtube player
  useEffect(() => {
    if (!player) {
      const params = {
        appId,
        setPlaying,
        setPlayer,
      };
      if (loaded) {
        genPlayer(params);
      } else {
        load('https://connect.facebook.net/en_US/sdk.js', () => {
          window.fbAsyncInit = () => {
            loaded = true;
            genPlayer(params);
          };
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    if (player) {
      refresh(appId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div
      ref={refPlayer}
      className="fb-video"
      data-href={url}
      data-width={width}
      data-height={height}
      data-controls={controls}
      data-autoplay={autoPlay}
      data-allowfullscreen="true"
    />
  );
};

Facebook.propTypes = {
  url: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  controls: PropTypes.bool.isRequired,
  autoPlay: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
  config: PropTypes.shape({
    appId: PropTypes.string,
  }).isRequired,
};

export default Facebook;
