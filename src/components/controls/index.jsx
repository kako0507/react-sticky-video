import { use, useCallback } from 'react';
import classNames from 'classnames';
import {
  faPlay,
  faPause,
  faExpand,
  faCompress,
  faClosedCaptioning,
} from '@fortawesome/free-solid-svg-icons';
import t from '../../constants/actionTypes';
import Store from '../../store';
import usePlayerControls from '../../hooks/use-player-controls';
import PlayCircle from '../play-circle';
import ProgressBar from '../progress-bar';
import IconButton from '../icon-button';
import VolumeSlider from '../volume-slider';
import Timer from '../timer';
import appStyles from '../../app.module.scss';
import styles from './controls.module.scss';

const Controls = ({
  ref,
  isReady = false,
  show = false,
  isFullScreen = false,
  isMobile = false,
  hasCaptions = false,
  onClickFullscreen,
  onCancelFullscreen,
  cancelHideControls,
}) => {
  const {
    state: {
      playerStatus: {
        hasPlayed,
        isPlaying,
        currentTime,
        duration,
      },
    },
    dispatch,
  } = use(Store);

  const { play, pause, seekTo } = usePlayerControls(dispatch);

  const containerStyle = {
    [appStyles.hide]: !hasPlayed || !show,
  };

  const handleMouseMove = useCallback((event) => {
    cancelHideControls();
    event.stopPropagation();
  }, [cancelHideControls]);

  const handleShowCC = useCallback(() => {
    dispatch({
      type: t.SHOW_CC_SETTING,
    });
  }, [dispatch]);

  return (
    <>
      {!hasPlayed && <PlayCircle isReady={isReady} />}
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
        onMouseMove={handleMouseMove}
      >
        <ProgressBar seekTo={seekTo} />
        <div className={styles.buttons}>
          <IconButton
            icon={faPlay}
            label="Play"
            hide={isPlaying}
            onClick={play}
          />
          <IconButton
            icon={faPause}
            label="Pause"
            hide={!isPlaying}
            onClick={pause}
          />
          <VolumeSlider show={!isMobile} />
          <Timer
            currentTime={currentTime}
            duration={duration}
          />
          <div className={styles.flex1} />
          {hasCaptions && (
            <div ref={ref}>
              <IconButton
                icon={faClosedCaptioning}
                label="Captions"
                onClick={handleShowCC}
              />
            </div>
          )}
          <IconButton
            icon={faExpand}
            label="Full screen"
            hide={isFullScreen}
            onClick={onClickFullscreen}
          />
          <IconButton
            icon={faCompress}
            label="Exit full screen"
            hide={!isFullScreen}
            onClick={onCancelFullscreen}
          />
        </div>
      </div>
    </>
  );
};

export default Controls;
