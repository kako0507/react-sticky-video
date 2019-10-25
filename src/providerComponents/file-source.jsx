/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

const FileSource = ({
  source,
  playerVars,
  setPlayerStatus,
  setPlayerControls,
}) => {
  const refPlayer = useRef(null);
  const multiSource = Array.isArray(source);

  useEffect(() => {
    const elemPlayer = refPlayer.current;
    const getLoaded = () => {
      const { buffered, duration } = elemPlayer;
      if (buffered.length && duration) {
        return (elemPlayer.buffered.end(0) * 100) / duration;
      }
      return undefined;
    };
    const handleReadyEvent = () => {
      setPlayerStatus((playerStatus) => ({
        ...playerStatus,
        duration: elemPlayer.duration,
      }));
      setPlayerControls((playerControl) => ({
        ...playerControl,
        play: () => {
          elemPlayer.play();
        },
        pause: () => {
          elemPlayer.pause();
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
            elemPlayer.currentTime = second;
            if (!elemPlayer.paused) {
              elemPlayer.pause();
            }
            if (!seeking && playerStatus.playing) {
              elemPlayer.play();
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
        }));
      }
    };
    const handleTimeUpdateEvent = () => {
      const { currentTime, duration } = elemPlayer;
      if (currentTime && duration) {
        const played = (currentTime * 100) / duration;
        setPlayerStatus((playerStatus) => ({
          ...playerStatus,
          played,
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
    elemPlayer.addEventListener('canplay', handleReadyEvent);
    elemPlayer.addEventListener('progress', handleProgressUpdateEvent);
    elemPlayer.addEventListener('timeupdate', handleTimeUpdateEvent);
    elemPlayer.addEventListener('play', handlePlayEvent);
    elemPlayer.addEventListener('pause', handlePauseEvent);
    return () => {
      elemPlayer.removeEventListener('play', handlePlayEvent);
      elemPlayer.removeEventListener('pause', handlePauseEvent);
      elemPlayer.removeEventListener('timeupdate', handleTimeUpdateEvent);
      elemPlayer.removeEventListener('progress', handleProgressUpdateEvent);
      setPlayerStatus({});
      setPlayerControls({});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <video
      ref={refPlayer}
      src={multiSource ? undefined : source}
      autoPlay={playerVars.autoplay}
      loop={playerVars.loop}
      muted={playerVars.muted}
      controls={playerVars.controls}
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
    controls: PropTypes.bool,
  }).isRequired,
  setPlayerStatus: PropTypes.func.isRequired,
  setPlayerControls: PropTypes.func.isRequired,
};

export default FileSource;
