/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

const FileSource = ({
  source,
  playerVars,
  setPlaying,
}) => {
  const refPlayer = useRef(null);
  const multiSource = Array.isArray(source);

  useEffect(() => {
    const elemPlayer = refPlayer.current;
    const handlePlayEvent = setPlaying.bind(null, true);
    const handlePauseEvent = setPlaying.bind(null, false);
    elemPlayer.addEventListener('play', handlePlayEvent);
    elemPlayer.addEventListener('pause', handlePauseEvent);
    return () => {
      elemPlayer.removeEventListener('play', handlePlayEvent);
      elemPlayer.addEventListener('pause', handlePauseEvent);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <video
      ref={refPlayer}
      src={multiSource ? undefined : source}
      autoPlay={playerVars.autoplay}
      controls={playerVars.controls}
      loop={playerVars.loop}
      muted={playerVars.muted}
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
    controls: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
  }).isRequired,
  setPlaying: PropTypes.func.isRequired,
};

export default FileSource;
