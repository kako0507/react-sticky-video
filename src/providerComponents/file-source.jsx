/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

const FileSource = ({
  source,
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
  const refPlayer = useRef(null);
  const multiSource = Array.isArray(source);

  useEffect(() => {
    const elemPlayer = refPlayer.current;
    const handleReadyEvent = () => {
      onReady({
        duration: elemPlayer.duration,
        isMuted: elemPlayer.muted,
        volume: elemPlayer.volume,
      });
      setPlayerControls((playerControl) => ({
        ...playerControl,
        play: () => {
          elemPlayer.play();
        },
        pause: () => {
          elemPlayer.pause();
        },
        seekTo: (fraction) => {
          onSeeking(fraction, (second, isSeeking, isPlaying) => {
            elemPlayer.currentTime = second;
            if (isSeeking && !elemPlayer.paused) {
              elemPlayer.pause();
            }
            if (!isSeeking && isPlaying) {
              elemPlayer.play();
            }
          });
        },
        setMuted: (isMuted) => {
          elemPlayer.muted = isMuted;
          onSetMuted(isMuted);
        },
        setVolume: (volume) => {
          elemPlayer.volume = volume;
          if (volume > 0 && elemPlayer.muted) {
            elemPlayer.muted = false;
          }
          onSetVolume(volume);
        },
      }));
    };
    const handleTimeUpdateEvent = () => {
      onTimeUpdate(elemPlayer.currentTime);
    };
    const handlePlayEvent = () => {
      onPlayChange(true);
    };
    const handlePauseEvent = () => {
      onPlayChange(false);
    };
    const handleProgressUpdateEvent = () => {
      const { buffered, duration } = elemPlayer;
      let loaded = 0;
      if (buffered.length && duration) {
        loaded = elemPlayer.buffered.end(0) / duration;
      }
      onProgressUpdate(loaded);
    };
    const handleDurationChangeEvent = () => {
      onDurationChange(elemPlayer.duration);
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
      onDestroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onSetMuted(playerVars.muted);
  }, [onSetMuted, playerVars.muted]);

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

export default FileSource;
