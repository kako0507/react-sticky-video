import React, {
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  faPlay,
  faPause,
  faExpand,
  faCompress,
} from '@fortawesome/free-solid-svg-icons';
import PlayCircle from '../play-circle';
import ProgressBar from '../progress-bar';
import IconButton from '../icon-button';
import VolumeSlider from '../volume-slider';
import appStyles from '../../styles.scss';
import styles from './styles.scss';
import Timer from '../timer';

const Controls = ({
  show,
  isFullScreen,
  onClickFullscreen,
  onCancelFullscreen,
  playerStatus,
  playerControls,
  setPlayerStatus,
}) => {
  const {
    hasPlayed,
    isPlaying,
    isSettingVolume,
    played,
    duration,
    isMuted,
    volume,
  } = playerStatus;

  const {
    play,
    pause,
    seekTo,
    setMuted,
    setVolume,
  } = playerControls;

  const containerStyle = {
    [appStyles.hide]: !hasPlayed || !show,
  };

  const handleChangeHoveredTime = useCallback((hovered) => {
    setPlayerStatus((ps) => ({ ...ps, hovered }));
  }, [setPlayerStatus]);
  const handleChangeSeeking = useCallback((isSeeking) => {
    setPlayerStatus((ps) => ({ ...ps, isSeeking }));
  }, [setPlayerStatus]);
  const handleChangeVolume = useCallback((v) => {
    setPlayerStatus((ps) => {
      if (v === undefined) {
        return { ...ps, isSettingVolume: false };
      }
      if (setVolume) {
        setVolume(v);
      }
      return { ...ps, volume: v };
    });
  }, [setPlayerStatus, setVolume]);

  return (
    <>
      {!hasPlayed && <PlayCircle />}
      <div
        className={classNames(
          styles.gradientBottom,
          containerStyle,
        )}
      />
      <div
        className={classNames(
          styles.container,
          containerStyle,
        )}
      >
        <ProgressBar
          playerStatus={playerStatus}
          seekTo={seekTo}
          onChangeHoveredTime={handleChangeHoveredTime}
          onChangeSeeking={handleChangeSeeking}

        />
        <div className={styles.buttons}>
          <IconButton
            icon={faPlay}
            hide={isPlaying}
            onClick={play}
            disabled={!play}
          />
          <IconButton
            icon={faPause}
            hide={!isPlaying}
            onClick={pause}
            disabled={!pause}
          />
          <VolumeSlider
            isMuted={isMuted}
            isSettingVolume={isSettingVolume}
            volume={volume}
            onSetMuted={setMuted}
            onChangeVolume={handleChangeVolume}
          />
          <Timer
            played={played}
            duration={duration}
          />
          <div className={styles.flex1} />
          <IconButton
            icon={faExpand}
            hide={isFullScreen}
            onClick={onClickFullscreen}
          />
          <IconButton
            icon={faCompress}
            hide={!isFullScreen}
            onClick={onCancelFullscreen}
          />
        </div>
      </div>
    </>
  );
};

Controls.propTypes = {
  show: PropTypes.bool,
  isFullScreen: PropTypes.bool.isRequired,
  onClickFullscreen: PropTypes.func.isRequired,
  onCancelFullscreen: PropTypes.func.isRequired,
  playerStatus: PropTypes.shape({
    hasPlayed: PropTypes.bool,
    isPlaying: PropTypes.bool,
    isSettingVolume: PropTypes.bool,
    duration: PropTypes.number,
    hovered: PropTypes.number,
    played: PropTypes.number,
    isMuted: PropTypes.bool,
    volume: PropTypes.number,
  }).isRequired,
  playerControls: PropTypes.shape({
    play: PropTypes.func,
    pause: PropTypes.func,
    seekTo: PropTypes.func,
    setMuted: PropTypes.func,
    setVolume: PropTypes.func,
  }).isRequired,
  setPlayerStatus: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  show: false,
};

export default Controls;
