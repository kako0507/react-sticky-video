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
    case t.SET_MUTE: {
      const { setMuted } = state.playerControls;
      if (!setMuted) {
        return state;
      }
      setMuted(data);
      return update(state, {
        playerStatus: {
          isMuted: {
            $set: data,
          },
        },
      });
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
    case t.ADD_VOLUME: {
      const { setVolume } = state.playerControls;
      let { volume } = state.playerStatus || 0;
      if (!setVolume) {
        return state;
      }
      volume += data;
      if (volume < 0) {
        volume = 0;
      } else if (volume > 1) {
        volume = 1;
      }
      setVolume(volume);
      return update(state, {
        playerStatus: {
          $merge: {
            volume,
            isMuted: volume === 0,
            isChangingVolume: true,
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
