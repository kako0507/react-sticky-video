/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useContext,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import t from '../constants/actionTypes';
import Store from '../store';

const FileSource = ({
  source,
  playerVars,
  controls,
}) => {
  const { dispatch } = useContext(Store);
  const refPlayer = useRef(null);
  const multiSource = Array.isArray(source);

  useEffect(() => {
    const elemPlayer = refPlayer.current;
    const handleReadyEvent = () => {
      dispatch({
        type: t.CREATE_PLAYER,
        data: {
          playerStatus: {
            duration: elemPlayer.duration,
            isMuted: elemPlayer.muted,
            volume: elemPlayer.volume,
          },
          playerControls: {
            play: () => {
              elemPlayer.play();
            },
            pause: () => {
              elemPlayer.pause();
            },
            seekTo: (fraction) => {
              dispatch({
                type: t.SEEK_TO_FRACTION,
                data: {
                  fraction,
                  handler: (second, isSeeking, isPlaying) => {
                    elemPlayer.currentTime = second;
                    if (isSeeking && !elemPlayer.paused) {
                      elemPlayer.pause();
                    }
                    if (!isSeeking && isPlaying) {
                      elemPlayer.play();
                    }
                  },
                },
              });
            },
            setMuted: (isMuted) => {
              elemPlayer.muted = isMuted;
              dispatch({
                type: t.SET_MUTE,
                data: isMuted,
              });
            },
            setVolume: (volume) => {
              elemPlayer.volume = volume;
              if (volume > 0 && elemPlayer.muted) {
                elemPlayer.muted = false;
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
          currentTime: elemPlayer.currentTime,
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
    const handleProgressUpdateEvent = () => {
      const { buffered, duration } = elemPlayer;
      let loaded = 0;
      if (buffered?.length && duration) {
        loaded = elemPlayer.buffered.end(0) / duration;
      }
      dispatch({
        type: t.SET_LOADED_PERCENTAGE,
        data: loaded,
      });
    };
    const handleDurationChangeEvent = () => {
      dispatch({
        type: t.SET_DURATION,
        data: elemPlayer.duration,
      });
    };

    elemPlayer.addEventListener('canplay', handleReadyEvent);
    elemPlayer.addEventListener('durationchange', handleDurationChangeEvent);
    elemPlayer.addEventListener('progress', handleProgressUpdateEvent);
    elemPlayer.addEventListener('timeupdate', handleTimeUpdateEvent);
    elemPlayer.addEventListener('play', handlePlayEvent);
    elemPlayer.addEventListener('pause', handlePauseEvent);
    return () => {
      elemPlayer.removeEventListener('canplay', handleReadyEvent);
      elemPlayer.removeEventListener('durationchange', handleDurationChangeEvent);
      elemPlayer.removeEventListener('progress', handleProgressUpdateEvent);
      elemPlayer.removeEventListener('timeupdate', handleTimeUpdateEvent);
      elemPlayer.removeEventListener('play', handlePlayEvent);
      elemPlayer.removeEventListener('pause', handlePauseEvent);
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
