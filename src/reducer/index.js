import t from '../constants/actionTypes';

const mergePlayerStatus = (state, patch) => ({
  ...state,
  playerStatus: {
    ...state.playerStatus,
    ...patch,
  },
});

export default (state = {}, { type, data }) => {
  switch (type) {
    case t.SET_STICKY:
      return {
        ...state,
        isSticky: data,
      };
    case t.SET_FULLSCREEN:
      return {
        ...state,
        isFullScreen: data,
      };
    case t.SET_FULLPAGE:
      return {
        ...state,
        isFullPage: data,
      };
    case t.FOCUS_PLAYER:
      return {
        ...state,
        isFocusPlayer: data,
        isShowingCCSetting: data
          ? state.isShowingCCSetting
          : false,
      };
    case t.SHOW_VOLUME_SLIDER:
      return {
        ...state,
        isVolumeSliderVisible: data,
      };
    case t.CREATE_PLAYER:
      if (state.playerStatus.hasPlayed) {
        return state;
      }
      return {
        ...state,
        ...data,
      };
    case t.SET_PLAYING: {
      const { isSeeking } = state.playerStatus;
      const { isPlaying, hasAlreadyChanged } = (data || {});
      let { hasPlayed } = state.playerStatus;
      if (isSeeking) {
        return state;
      }
      if (data === undefined) {
        hasPlayed = false;
      } else if (isPlaying) {
        hasPlayed = true;
      }
      if (data && !hasAlreadyChanged) {
        const { play, pause } = state.playerControls;
        if (!play || !pause) {
          return state;
        }
        if (isPlaying) {
          play();
        } else {
          pause();
        }
      }
      return mergePlayerStatus(state, {
            isPlaying,
            hasPlayed,
          });
    }
    case t.SET_DURATION: {
      return mergePlayerStatus(state, { duration: data });
    }
    case t.SET_CURRENT_TIME: {
      const { isSeeking, loaded } = state.playerStatus;
      const { currentTime } = data;
      if (currentTime === undefined || isSeeking) {
        return state;
      }
      return mergePlayerStatus(state, {
            currentTime,
            loaded: data.loaded || loaded,
          });
    }
    case t.SET_LOADED_PERCENTAGE: {
      return mergePlayerStatus(state, { loaded: data });
    }
    case t.SET_HOVERED_TIME: {
      const { playerStatus } = state;
      const hoveredTime = data === undefined
        ? undefined
        : playerStatus.duration * data;
      return mergePlayerStatus(state, { hoveredTime });
    }
    case t.SEEK_TO_FRACTION: {
      const {
        playerStatus: { duration, currentTime, isPlaying },
        playerControls: { seekTo },
      } = state;
      if (!seekTo) {
        return state;
      }
      const fraction = data;
      const time = fraction === undefined
        ? currentTime
        : duration * fraction;
      const isSeeking = !!fraction;
      seekTo(time, isSeeking, isPlaying);
      return mergePlayerStatus(state, {
            isSeeking,
            currentTime: time,
            hoveredTime: isSeeking ? time : undefined,
          });
    }
    case t.SET_MUTE: {
      const { setMuted } = state.playerControls;
      if (!setMuted) {
        return state;
      }
      setMuted(data);
      return mergePlayerStatus(state, { isMuted: data });
    }
    case t.SET_VOLUME: {
      const { setVolume } = state.playerControls;
      let volume = data;
      let isChangingVolume;
      if (!setVolume) {
        return state;
      }
      if (volume === undefined) {
        ({ volume } = state.playerStatus);
        isChangingVolume = false;
      } else {
        isChangingVolume = true;
        setVolume(volume);
      }
      return mergePlayerStatus(state, {
            volume,
            isMuted: volume === 0,
            isChangingVolume,
          });
    }
    case t.ADD_VOLUME: {
      const { setVolume } = state.playerControls;
      if (!setVolume) {
        return state;
      }
      const volume = Math.min(Math.max((state.playerStatus.volume ?? 0) + data, 0), 1);
      setVolume(volume);
      return mergePlayerStatus(state, {
            volume,
            isMuted: volume === 0,
            isChangingVolume: true,
          });
    }
    case t.DESTROY_PLAYER:
      return {
        ...state,
        playerStatus: {},
        playerControls: {},
      };
    case t.SET_WEBVTT_CUES:
      return {
        ...state,
        vttCues: { ...state.vttCues, ...data },
      };
    case t.SHOW_CC_SETTING:
      return {
        ...state,
        isShowingCCSetting: data === undefined
          ? !state.isShowingCCSetting
          : data,
      };
    case t.SELECT_CAPTION:
      return {
        ...state,
        selectedCaption: data,
      };
    default:
      return state;
  }
};
