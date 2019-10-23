/* global YT */
import load from 'load-script';
import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

let loaded;

const isPlayed = (state) => (
  [
    YT.PlayerState.PLAYING,
    YT.PlayerState.BUFFERING,
  ].indexOf(state) > -1
);

const genPlayer = ({
  elemPlayer,
  videoId,
  autoPlay,
  controls,
  playsInline,
  setPlaying,
  setPlayer,
}) => {
  const player = new YT.Player(elemPlayer, {
    videoId,
    playerVars: {
      controls: controls ? 1 : 0,
      playsinline: playsInline ? 1 : 0,
    },
    events: {
      onReady: (event) => {
        if (autoPlay) {
          event.target.mute();
          event.target.playVideo();
        }
      },
      onStateChange: (event) => {
        if (isPlayed(event.data)) {
          setPlaying(true);
        } else {
          setPlaying(false);
        }
      },
    },
  });

  setPlayer(player);
};

const Youtube = ({
  videoId,
  controls,
  autoPlay,
  playsInline,
  setPlaying,
}) => {
  const [player, setPlayer] = useState(null);
  const refPlayer = useRef(null);

  // create/destory the youtube player
  useEffect(() => {
    if (!player) {
      const params = {
        elemPlayer: refPlayer.current,
        videoId,
        controls,
        autoPlay,
        playsInline,
        setPlaying,
        setPlayer,
      };
      if (loaded) {
        genPlayer(params);
      } else {
        load('https://www.youtube.com/iframe_api', () => {
          window.onYouTubeIframeAPIReady = () => {
            genPlayer(params);
            loaded = true;
          };
        });
      }
    }
    return () => {
      if (player) {
        player.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    if (player) {
      if (autoPlay) {
        player.loadVideoById(videoId);
      } else {
        player.cueVideoById(videoId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return <div ref={refPlayer} />;
};

Youtube.propTypes = {
  videoId: PropTypes.string.isRequired,
  controls: PropTypes.bool.isRequired,
  autoPlay: PropTypes.bool.isRequired,
  playsInline: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
};

export default Youtube;
