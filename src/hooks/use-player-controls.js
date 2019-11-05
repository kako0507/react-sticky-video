import { useCallback } from 'react';
import t from '../constants/actionTypes';

export default function usePlayerControls(dispatch) {
  const setPlaying = useCallback((isPlaying) => {
    dispatch({
      type: t.SET_PLAYING,
      data: {
        isPlaying,
        hasAlreadyChanged: false,
      },
    });
  }, [dispatch]);

  const play = useCallback(() => {
    setPlaying(true);
  }, [setPlaying]);

  const pause = useCallback(() => {
    setPlaying(false);
  }, [setPlaying]);

  const seekTo = useCallback((fraction) => {
    dispatch({
      type: t.SEEK_TO_FRACTION,
      data: fraction,
    });
  }, [dispatch]);

  const setMuted = useCallback((muted) => {
    dispatch({
      type: t.SET_MUTE,
      data: muted,
    });
  }, [dispatch]);

  const setVolume = useCallback((volume) => {
    dispatch({
      type: t.SET_VOLUME,
      data: volume,
    });
  }, [dispatch]);

  const addVolume = useCallback((value) => {
    dispatch({
      type: t.ADD_VOLUME,
      data: value,
    });
  }, [dispatch]);

  return {
    play,
    pause,
    seekTo,
    setMuted,
    setVolume,
    addVolume,
  };
}
