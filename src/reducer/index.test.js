import { describe, expect, it, vi } from 'vitest';
import reducer from '.';
import t from '../constants/actionTypes';

const createState = (overrides = {}) => ({
  playerStatus: {},
  playerControls: {},
  vttCues: {},
  ...overrides,
});

const createControls = () => ({
  play: vi.fn(),
  pause: vi.fn(),
  seekTo: vi.fn(),
  setMuted: vi.fn(),
  setVolume: vi.fn(),
});

describe('reducer', () => {
  it('returns the same state for unknown actions', () => {
    const state = createState();
    expect(reducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  it('toggles sticky / full page flags', () => {
    let state = reducer(createState(), { type: t.SET_STICKY, data: true });
    expect(state.isSticky).toBe(true);
    state = reducer(state, { type: t.SET_FULLPAGE, data: true });
    expect(state.isFullPage).toBe(true);
  });

  it('hides the caption menu when the player loses focus', () => {
    const state = reducer(
      createState({ isShowingCCSetting: true }),
      { type: t.FOCUS_PLAYER, data: false },
    );
    expect(state.isShowingCCSetting).toBe(false);
  });

  describe('SET_PLAYING', () => {
    it('asks the player to play and marks the video as played', () => {
      const playerControls = createControls();
      const state = reducer(
        createState({ playerControls }),
        { type: t.SET_PLAYING, data: { isPlaying: true, hasAlreadyChanged: false } },
      );
      expect(playerControls.play).toHaveBeenCalledOnce();
      expect(state.playerStatus).toMatchObject({ isPlaying: true, hasPlayed: true });
    });

    it('only records the status when the player already changed', () => {
      const playerControls = createControls();
      const state = reducer(
        createState({ playerControls }),
        { type: t.SET_PLAYING, data: { isPlaying: false, hasAlreadyChanged: true } },
      );
      expect(playerControls.pause).not.toHaveBeenCalled();
      expect(state.playerStatus.isPlaying).toBe(false);
    });

    it('ignores requests before the player is ready', () => {
      const state = createState();
      expect(reducer(
        state,
        { type: t.SET_PLAYING, data: { isPlaying: true, hasAlreadyChanged: false } },
      )).toBe(state);
    });

    it('resets the played flag when the source changes', () => {
      const state = reducer(
        createState({ playerStatus: { hasPlayed: true } }),
        { type: t.SET_PLAYING },
      );
      expect(state.playerStatus.hasPlayed).toBe(false);
    });
  });

  it('seeks to a fraction of the duration', () => {
    const playerControls = createControls();
    const state = reducer(
      createState({ playerControls, playerStatus: { duration: 200, isPlaying: true } }),
      { type: t.SEEK_TO_FRACTION, data: 0.25 },
    );
    expect(playerControls.seekTo).toHaveBeenCalledWith(50, true, true);
    expect(state.playerStatus).toMatchObject({ isSeeking: true, currentTime: 50 });
  });

  it('ignores time updates while seeking', () => {
    const state = createState({ playerStatus: { isSeeking: true, currentTime: 10 } });
    expect(reducer(
      state,
      { type: t.SET_CURRENT_TIME, data: { currentTime: 20 } },
    )).toBe(state);
  });

  it('clamps the volume when adding to it', () => {
    const playerControls = createControls();
    let state = createState({ playerControls, playerStatus: { volume: 0.95 } });
    state = reducer(state, { type: t.ADD_VOLUME, data: 0.1 });
    expect(state.playerStatus.volume).toBe(1);
    state = reducer({ ...state, playerStatus: { volume: 0.05 } }, { type: t.ADD_VOLUME, data: -0.1 });
    expect(state.playerStatus).toMatchObject({ volume: 0, isMuted: true });
    expect(playerControls.setVolume).toHaveBeenLastCalledWith(0);
  });

  it('treats an unknown volume as 0 when adding to it', () => {
    const playerControls = createControls();
    const state = reducer(createState({ playerControls }), { type: t.ADD_VOLUME, data: 0.1 });
    expect(state.playerStatus.volume).toBe(0.1);
  });

  it('merges WebVTT cues per track', () => {
    let state = reducer(createState(), { type: t.SET_WEBVTT_CUES, data: { English: [1] } });
    state = reducer(state, { type: t.SET_WEBVTT_CUES, data: { 中文: [2] } });
    expect(state.vttCues).toEqual({ English: [1], 中文: [2] });
  });

  it('does not mutate the previous state', () => {
    const playerControls = createControls();
    const state = Object.freeze(createState({
      playerControls,
      playerStatus: Object.freeze({ volume: 0.5 }),
    }));
    const next = reducer(state, { type: t.SET_VOLUME, data: 0.8 });
    expect(next).not.toBe(state);
    expect(next.playerStatus).not.toBe(state.playerStatus);
    expect(state.playerStatus.volume).toBe(0.5);
  });

  it('clears the player on destroy', () => {
    const state = reducer(
      createState({ playerControls: createControls(), playerStatus: { isReady: true } }),
      { type: t.DESTROY_PLAYER },
    );
    expect(state.playerStatus).toEqual({});
    expect(state.playerControls).toEqual({});
  });
});
