/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

const FileSource = ({
  src,
  controls,
  autoPlay,
  playsInline,
  setPlaying,
}) => {
  const refPlayer = useRef(null);

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
      src={src}
      controls={controls}
      autoPlay={autoPlay}
      playsInline={playsInline}
    />
  );
};

FileSource.propTypes = {
  src: PropTypes.string.isRequired,
  controls: PropTypes.bool.isRequired,
  autoPlay: PropTypes.bool.isRequired,
  playsInline: PropTypes.bool.isRequired,
  setPlaying: PropTypes.func.isRequired,
};

export default FileSource;
