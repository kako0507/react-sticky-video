import update from 'immutability-helper';
import t from '../constants/actionTypes';

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
    case t.SET_FULLPAGE: {
      let {
        bodyWidth,
        bodyHeight,
        bodyOverflow,
      } = state.fullPage;
      if (data) {
        bodyWidth = document.body.style.width;
        bodyHeight = document.body.style.height;
        bodyOverflow = document.body.style.overflow;
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.width = bodyWidth;
        document.body.style.height = bodyHeight;
        document.body.style.overflow = bodyOverflow;
        bodyWidth = undefined;
        bodyHeight = undefined;
        bodyOverflow = undefined;
      }
      return {
        ...state,
        fullPage: {
          open: data,
          bodyWidth,
          bodyHeight,
          bodyOverflow,
        },
      };
    }
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
      const isPlaying = data;
      let { hasPlayed } = state.playerStatus;
      if (isSeeking) {
        return state;
      }
      if (isPlaying === undefined) {
        hasPlayed = false;
      } else if (isPlaying) {
        hasPlayed = true;
      }
      return update(state, {
        playerStatus: {
          $merge: {
            isPlaying,
            hasPlayed,
          },
        },
      });
    }
    case t.SET_DURATION: {
      return update(state, {
        playerStatus: {
          duration: {
            $set: data,
          },
        },
      });
    }
    case t.SET_CURRENT_TIME: {
      const { isSeeking, loaded } = state.playerStatus;
      const { currentTime } = data;
      if (currentTime === undefined || isSeeking) {
        return state;
      }
      return update(state, {
        playerStatus: {
          $merge: {
            currentTime,
            loaded: data.loaded || loaded,
          },
        },
      });
    }
    case t.SET_LOADED_PERCENTAGE: {
      return update(state, {
        playerStatus: {
          loaded: {
            $set: data,
          },
        },
      });
    }
    case t.SET_HOVERED_TIME: {
      const { playerStatus } = state;
      const hoveredTime = data === undefined
        ? undefined
        : playerStatus.duration * data;
      return update(state, {
        playerStatus: {
          $merge: { hoveredTime },
        },
      });
    }
    case t.SEEK_TO_FRACTION: {
      const { duration, currentTime, isPlaying } = state.playerStatus;
      const { fraction, handler } = data;
      const time = fraction === undefined
        ? currentTime
        : duration * fraction;
      const isSeeking = !!fraction;
      handler(time, isSeeking, isPlaying);
      return update(state, {
        playerStatus: {
          $merge: {
            isSeeking,
            currentTime: time,
            hoveredTime: isSeeking ? time : undefined,
          },
        },
      });
    }
    case t.SET_MUTE:
      return update(state, {
        playerStatus: {
          isMuted: {
            $set: data,
          },
        },
      });
    case t.SET_VOLUME: {
      let volume = data;
      let isChangingVolume;
      if (volume === undefined) {
        ({ volume } = state.playerStatus);
        isChangingVolume = false;
      } else {
        isChangingVolume = true;
      }
      return update(state, {
        playerStatus: {
          $merge: {
            volume,
            isMuted: volume === 0,
            isChangingVolume,
          },
        },
      });
    }
    case t.DESTROY_PLAYER:
      return {
        ...state,
        playerStatus: {},
        playerControls: {},
      };
    case t.SET_WEBVTT_CUES:
      return update(state, {
        vttCues: {
          $merge: data,
        },
      });
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
