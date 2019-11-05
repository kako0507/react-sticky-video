/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useContext,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import t from '../constants/actionTypes';
import Store from '../store';
import usePlayerEvents from '../hooks/use-player-events';

const FileSource = ({
  source,
  playerVars,
  controls,
}) => {
  const { dispatch } = useContext(Store);
  const refPlayer = useRef(null);
  const events = usePlayerEvents(dispatch);
  const multiSource = Array.isArray(source);

  useEffect(() => {
    const elemPlayer = refPlayer.current;
    const onReady = () => {
      events.onReady(
        elemPlayer.duration,
        elemPlayer.muted,
        elemPlayer.volume,
        {
          play: () => {
            elemPlayer.play();
          },
          pause: () => {
            elemPlayer.pause();
          },
          seekTo: (second, isSeeking, isPlaying) => {
            elemPlayer.currentTime = second;
            if (isSeeking && !elemPlayer.paused) {
              elemPlayer.pause();
            }
            if (!isSeeking && isPlaying) {
              elemPlayer.play();
            }
          },
          setMuted: (isMuted) => {
            elemPlayer.muted = isMuted;
          },
          setVolume: (volume) => {
            elemPlayer.volume = volume;
            if (volume > 0 && elemPlayer.muted) {
              elemPlayer.muted = false;
            }
          },
        },
      );
    };
    const onDurationChange = () => {
      events.onDurationChange(elemPlayer.duration);
    };
    const onTimeUpdate = () => {
      events.onTimeUpdate(elemPlayer.currentTime);
    };
    const onProgressUpdate = () => {
      const { buffered, duration } = elemPlayer;
      let loaded = 0;
      if (buffered?.length && duration) {
        loaded = elemPlayer.buffered.end(0) / duration;
      }
      events.onProgressUpdate(loaded);
    };

    elemPlayer.addEventListener('canplay', onReady);
    elemPlayer.addEventListener('durationchange', onDurationChange);
    elemPlayer.addEventListener('timeupdate', onTimeUpdate);
    elemPlayer.addEventListener('progress', onProgressUpdate);
    elemPlayer.addEventListener('play', events.onPlay);
    elemPlayer.addEventListener('pause', events.onPause);
    return () => {
      elemPlayer.removeEventListener('canplay', onReady);
      elemPlayer.removeEventListener('durationchange', onDurationChange);
      elemPlayer.removeEventListener('timeupdate', onTimeUpdate);
      elemPlayer.removeEventListener('progress', onProgressUpdate);
      elemPlayer.removeEventListener('play', events.onPlay);
      elemPlayer.removeEventListener('pause', events.onPause);
      dispatch({
        type: t.DESTROY_PLAYER,
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({
      type: t.SET_MUTE,
      data: playerVars.muted,
    });
  }, [dispatch, playerVars.muted]);

  return (
    <video
      ref={refPlayer}
      src={multiSource ? undefined : source}
      autoPlay={playerVars.autoplay}
      loop={playerVars.loop}
      muted={playerVars.muted}
      controls={controls}
      playsInline
    >
      {multiSource && source.map(({ src, type }) => (
        <source
          src={src}
          type={type}
          key={src}
        />
      ))}
    </video>
  );
};

FileSource.propTypes = {
  source: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string,
        type: PropTypes.string,
      }),
    ),
  ]).isRequired,
  playerVars: PropTypes.shape({
    autoplay: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
  }).isRequired,
  controls: PropTypes.bool.isRequired,
};

export default FileSource;
