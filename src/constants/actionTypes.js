import _ from 'lodash';

export default _.mapKeys(
  [
    'SET_STICKY',
    'SET_FULLSCREEN',
    'SET_FULLPAGE',
    'FOCUS_PLAYER',

    'CREATE_PLAYER',
    'SET_PLAYING',
    'SET_DURATION',
    'SET_CURRENT_TIME',
    'SET_LOADED_PERCENTAGE',
    'SET_HOVERED_TIME',
    'SEEK_TO_FRACTION',
    'SET_MUTE',
    'SET_VOLUME',
    'DESTROY_PLAYER',

    'SET_WEBVTT_CUES',
    'SHOW_CC_SETTING',
    'SELECT_CAPTION',
  ],
  (value) => value,
);
