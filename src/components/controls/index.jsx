import { useContext, useCallback } from 'react';
import clsx from 'clsx';
import {
  faPlay,
  faPause,
  faExpand,
  faCompress,
  faWindowMaximize,
  faWindowRestore,
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
  ccButtonRef,
  isReady = false,
  show = false,
  isFullScreen = false,
  isFullPage = false,
  canFullScreen = false,
  isMobile = false,
  hasCaptions = false,
  onToggleFullScreen,
  onToggleFullPage,
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
  } = useContext(Store);

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
        className={clsx(
          styles.gradientBottom,
          containerStyle,
        )}
      />
      <div
        className={clsx(
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
            <div ref={ccButtonRef}>
              <IconButton
                icon={faClosedCaptioning}
                label="Captions"
                onClick={handleShowCC}
              />
            </div>
          )}
          <IconButton
            icon={isFullPage ? faWindowRestore : faWindowMaximize}
            label={isFullPage ? 'Exit full page' : 'Full page'}
            onClick={onToggleFullPage}
          />
          {canFullScreen && (
            <IconButton
              icon={isFullScreen ? faCompress : faExpand}
              label={isFullScreen ? 'Exit full screen' : 'Full screen'}
              onClick={onToggleFullScreen}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Controls;
