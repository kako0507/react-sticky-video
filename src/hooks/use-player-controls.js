import { useMemo } from 'react';
import t from '../constants/actionTypes';

/**
 * Returns a stable set of action creators for controlling the active player.
 */
export default function usePlayerControls(dispatch) {
  return useMemo(() => {
    const setPlaying = (isPlaying) => {
      dispatch({
        type: t.SET_PLAYING,
        data: {
          isPlaying,
          hasAlreadyChanged: false,
        },
      });
    };
    return {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seekTo: (fraction) => {
        dispatch({
          type: t.SEEK_TO_FRACTION,
          data: fraction,
        });
      },
      setMuted: (muted) => {
        dispatch({
          type: t.SET_MUTE,
          data: muted,
        });
      },
      setVolume: (volume) => {
        dispatch({
          type: t.SET_VOLUME,
          data: volume,
        });
      },
      addVolume: (value) => {
        dispatch({
          type: t.ADD_VOLUME,
          data: value,
        });
      },
    };
  }, [dispatch]);
}
