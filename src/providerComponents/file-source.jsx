/* eslint-disable jsx-a11y/media-has-caption -- captions are rendered by <Track /> */
import { use, useEffect, useRef } from 'react';
import t from '../constants/actionTypes';
import Store from '../store';
import usePlayerEvents from '../hooks/use-player-events';

const FileSource = ({
  source,
  playerVars,
  controls,
}) => {
  const { dispatch } = use(Store);
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
      const loaded = buffered.length && duration
        ? buffered.end(buffered.length - 1) / duration
        : 0;
      events.onProgressUpdate(loaded);
    };

    // The media may already be ready when the effect runs (e.g. cached files).
    if (elemPlayer.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      onReady();
    }

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
  }, [events, dispatch]);

  useEffect(() => {
    dispatch({
      type: t.SET_MUTE,
      data: Boolean(playerVars.muted),
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

export default FileSource;
