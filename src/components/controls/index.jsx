import React, {
  forwardRef,
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
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
import appStyles from '../../styles.scss';
import styles from './styles.scss';
import Timer from '../timer';

const Controls = forwardRef((
  {
    isReady,
    show,
    isFullScreen,
    isMobile,
    captions,
    onClickFullscreen,
    onCancelFullscreen,
    cancelHideControls,
  },
  refCCButton,
) => {
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

  const {
    play,
    pause,
    seekTo,
  } = usePlayerControls(dispatch);

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
            hide={isPlaying}
            onClick={play}
          />
          <IconButton
            icon={faPause}
            hide={!isPlaying}
            onClick={pause}
          />
          <VolumeSlider show={!isMobile} />
          <Timer
            currentTime={currentTime}
            duration={duration}
          />
          <div className={styles.flex1} />
          {captions.length > 0 && (
            <div ref={refCCButton}>
              <IconButton
                icon={faClosedCaptioning}
                onClick={handleShowCC}
              />
            </div>
          )}
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
});

Controls.propTypes = {
  isReady: PropTypes.bool,
  show: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  isMobile: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  captions: PropTypes.array.isRequired,
  onClickFullscreen: PropTypes.func.isRequired,
  onCancelFullscreen: PropTypes.func.isRequired,
  cancelHideControls: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  isReady: false,
  show: false,
  isFullScreen: false,
  isMobile: false,
};

export default Controls;
