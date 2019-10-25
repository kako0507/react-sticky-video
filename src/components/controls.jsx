import React, {
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faExpand,
  faCompress,
  faPlayCircle,
  faVolumeUp,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';
import {
  getTimeStringFromSeconds,
} from '../utils';
import IconButton from './icon-button';
import styles from '../styles.scss';

const tooltipContainerWidth = 200;

const getFraction = (elemProgress, event) => {
  const rect = elemProgress.getBoundingClientRect();
  const clientX = event.clientX || event.touches?.[0]?.clientX || 0;
  const reletiveX = clientX - rect.left + 1;
  const fraction = reletiveX / rect.width;
  if (fraction < 0) {
    return 0;
  }
  if (fraction > 1) {
    return 1;
  }
  return fraction;
};

const Controls = ({
  show,
  isFullScreen,
  onClickFullscreen,
  onCancelFullscreen,
  playerStatus,
  playerControls,
  setPlayerStatus,
}) => {
  const refProgressContainer = useRef(null);
  const {
    seeking,
    isPlayed,
    loaded,
    hovered,
    played,
    duration,
  } = playerStatus;

  let timeStringHover;
  let timeStringDuration;
  let timeStringPlayed;
  if (duration !== undefined) {
    if (hovered !== undefined) {
      timeStringHover = getTimeStringFromSeconds(Math.round((duration * hovered) / 100));
    }
    timeStringPlayed = getTimeStringFromSeconds(Math.round((duration * (played || 0)) / 100));
    timeStringDuration = getTimeStringFromSeconds(Math.round(duration));
  }

  const handleProgressMouseDown = useCallback((event) => {
    const fraction = getFraction(refProgressContainer.current, event);
    setPlayerStatus((ps) => ({
      ...ps,
      seeking: true,
    }));
    if (playerControls.seekTo) {
      playerControls.seekTo(fraction, false);
    }
    event.preventDefault();
    event.stopPropagation();
  }, [playerControls, setPlayerStatus]);

  const handleProgressMouseOut = useCallback((event) => {
    if (!seeking) {
      setPlayerStatus((ps) => ({
        ...ps,
        hovered: undefined,
      }));
      event.preventDefault();
      event.stopPropagation();
    }
  }, [seeking, setPlayerStatus]);

  const setToMuted = useCallback(() => {
    playerControls.setMuted(true);
  }, [playerControls]);

  const setToUnMuted = useCallback(() => {
    playerControls.setMuted(false);
  }, [playerControls]);

  useEffect(() => {
    const elemProgress = refProgressContainer.current;
    const handleProgressMouseMove = (event) => {
      if (seeking) {
        if (playerControls.seekTo) {
          const fraction = getFraction(elemProgress, event);
          playerControls.seekTo(fraction, false);
        }
      } else {
        const isInProgressBar = elemProgress.contains(event.target);
        if (isInProgressBar) {
          const fraction = getFraction(elemProgress, event);
          setPlayerStatus((ps) => ({
            ...ps,
            hovered: fraction * 100,
          }));
        }
      }
      event.preventDefault();
      event.stopPropagation();
    };
    const handleProgressMouseUp = (event) => {
      playerControls.seekTo(undefined, true);
      if (seeking) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('touchmove', handleProgressMouseMove);
    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener('touchend', handleProgressMouseUp);
    document.addEventListener('mouseup', handleProgressMouseUp);
    return () => {
      document.removeEventListener('touchmove', handleProgressMouseMove);
      document.removeEventListener('mousemove', handleProgressMouseMove);
      document.removeEventListener('touchend', handleProgressMouseUp);
      document.removeEventListener('mouseup', handleProgressMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerControls, seeking]);
  return (
    <>
      <div
        className={classNames(
          styles.playCircle,
          {
            [styles.hide]: isPlayed,
          },
        )}
      />
      <div
        className={classNames(
          styles.playIconContainer,
          {
            [styles.hide]: isPlayed,
          },
        )}
      >
        <FontAwesomeIcon
          icon={faPlayCircle}
        />
      </div>
      <div
        className={classNames(
          styles.gradientBottom,
          {
            [styles.hide]: !isPlayed || !show,
          },
        )}
      />
      <div
        className={classNames(
          styles.controls,
          {
            [styles.hide]: !isPlayed || !show,
          },
        )}
      >
        <div
          role="button"
          tabIndex="-1"
          ref={refProgressContainer}
          className={styles.progressContainer}
          onTouchStart={handleProgressMouseDown}
          onMouseDown={handleProgressMouseDown}
          onMouseOut={handleProgressMouseOut}
        >
          <div className={styles.progress}>
            <div
              className={classNames(
                styles.progressLoaded,
                {
                  [styles.hide]: loaded === undefined,
                },
              )}
              style={{
                width: `${loaded}%`,
              }}
            />
            <div
              className={classNames(
                styles.progressHover,
                {
                  [styles.hide]: hovered === undefined,
                },
              )}
              style={{
                width: `${hovered}%`,
              }}
            />
            <div
              className={classNames(
                styles.progressPlayed,
                {
                  [styles.hide]: played === undefined,
                },
              )}
              style={{
                width: `${played}%`,
              }}
            >
              <div className={styles.progressDot} />
            </div>
            <div
              className={classNames(
                styles.tooltipContainer,
                {
                  [styles.hide]: hovered === undefined,
                },
              )}
              style={{
                left: `calc(${hovered}% - ${tooltipContainerWidth / 2}px)`,
                width: tooltipContainerWidth,
              }}
            >
              <span className={styles.tooltipText}>
                {timeStringHover}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <IconButton
            icon={faPlay}
            hide={playerStatus.playing}
            onClick={playerControls.play}
            disabled={!playerControls.play}
          />
          <IconButton
            icon={faPause}
            hide={!playerStatus.playing}
            onClick={playerControls.pause}
            disabled={!playerControls.pause}
          />
          <IconButton
            icon={faVolumeUp}
            hide={playerStatus.muted}
            onClick={setToMuted}
            disabled={!playerControls.pause}
          />
          <IconButton
            icon={faVolumeMute}
            hide={!playerStatus.muted}
            onClick={setToUnMuted}
            disabled={!playerControls.pause}
          />
          <div
            className={classNames(
              styles.timeContainer,
              {
                [styles.hide]: duration === undefined,
              },
            )}
          >
            <span className={styles.timeCurrent}>
              {timeStringPlayed}
            </span>
            <span className={styles.timeSeparator}> / </span>
            <span className={styles.timeDuration}>
              {timeStringDuration}
            </span>
          </div>
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
    playing: PropTypes.bool,
    seeking: PropTypes.bool,
    isPlayed: PropTypes.bool,
    muted: PropTypes.bool,
    duration: PropTypes.number,
    loaded: PropTypes.number,
    hovered: PropTypes.number,
    played: PropTypes.number,
  }).isRequired,
  playerControls: PropTypes.shape({
    play: PropTypes.func,
    pause: PropTypes.func,
    setMuted: PropTypes.func,
    seekTo: PropTypes.func,
  }).isRequired,
  setPlayerStatus: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  show: false,
};

export default Controls;
