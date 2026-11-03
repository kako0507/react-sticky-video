import { useMemo } from 'react';
import t from '../constants/actionTypes';

/**
 * Returns a stable set of callbacks that provider components use to report
 * player events back to the store.
 */
export default function usePlayerEvents(dispatch) {
  return useMemo(() => ({
    onReady: (duration, isMuted, volume, playerControls) => {
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
    },
    onDurationChange: (duration) => {
      dispatch({
        type: t.SET_DURATION,
        data: duration,
      });
    },
    onTimeUpdate: (currentTime, loaded) => {
      dispatch({
        type: t.SET_CURRENT_TIME,
        data: {
          currentTime,
          loaded,
        },
      });
    },
    onProgressUpdate: (loaded) => {
      dispatch({
        type: t.SET_LOADED_PERCENTAGE,
        data: loaded,
      });
    },
    onPlay: () => {
      dispatch({
        type: t.SET_PLAYING,
        data: {
          isPlaying: true,
          hasAlreadyChanged: true,
        },
      });
    },
    onPause: () => {
      dispatch({
        type: t.SET_PLAYING,
        data: {
          isPlaying: false,
          hasAlreadyChanged: true,
        },
      });
    },
  }), [dispatch]);
}
