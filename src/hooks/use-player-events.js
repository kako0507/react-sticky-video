import { useCallback } from 'react';
import t from '../constants/actionTypes';

export default function usePlayerEvents(dispatch) {
  const onReady = useCallback((
    duration,
    isMuted,
    volume,
    playerControls,
  ) => {
    dispatch({
      type: t.CREATE_PLAYER,
      data: {
        playerStatus: {
          duration,
          isMuted,
          volume,
          isReady: true,
        },
        playerControls,
      },
    });
  }, [dispatch]);

  const onDurationChange = useCallback((duration) => {
    dispatch({
      type: t.SET_DURATION,
      data: duration,
    });
  }, [dispatch]);

  const onTimeUpdate = useCallback((currentTime, loaded) => {
    dispatch({
      type: t.SET_CURRENT_TIME,
      data: {
        currentTime,
        loaded,
      },
    });
  }, [dispatch]);

  const onProgressUpdate = useCallback((loaded) => {
    dispatch({
      type: t.SET_LOADED_PERCENTAGE,
      data: loaded,
    });
  }, [dispatch]);

  const onPlay = useCallback(() => {
    dispatch({
      type: t.SET_PLAYING,
      data: {
        isPlaying: true,
        hasAlreadyChanged: true,
      },
    });
  }, [dispatch]);

  const onPause = useCallback(() => {
    dispatch({
      type: t.SET_PLAYING,
      data: {
        isPlaying: false,
        hasAlreadyChanged: true,
      },
    });
  }, [dispatch]);

  return {
    onReady,
    onDurationChange,
    onTimeUpdate,
    onProgressUpdate,
    onPlay,
    onPause,
  };
}
