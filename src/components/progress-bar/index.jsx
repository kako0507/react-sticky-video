import React, {
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  getFractionFromMouseEvent,
  getTimeStringFromSeconds,
} from '../../utils';
import appStyles from '../../styles.scss';
import styles from './styles.scss';

const tooltipContainerWidth = 200;

const ProgressBar = ({
  playerStatus: {
    isSeeking,
    duration,
    loaded,
    hovered,
    played,
  },
  onChangeHoveredTime,
  seekTo,
}) => {
  const refProgressContainer = useRef(null);

  let timeStringHover;
  if (duration !== undefined) {
    if (hovered !== undefined) {
      timeStringHover = getTimeStringFromSeconds(Math.round(duration * hovered));
    }
  }

  const handleProgressMouseDown = useCallback((event) => {
    const fraction = getFractionFromMouseEvent(refProgressContainer.current, event);
    if (seekTo) {
      seekTo(fraction);
    }
    event.preventDefault();
    event.stopPropagation();
  }, [seekTo]);

  const handleProgressClick = useCallback((event) => {
    if (seekTo) {
      seekTo();
    }
    event.preventDefault();
    event.stopPropagation();
  }, [seekTo]);

  const handleProgressMouseOut = useCallback((event) => {
    if (!isSeeking) {
      onChangeHoveredTime(undefined);
      event.preventDefault();
      event.stopPropagation();
    }
  }, [isSeeking, onChangeHoveredTime]);

  useEffect(() => {
    const elemProgress = refProgressContainer.current;
    const handleProgressMouseMove = (event) => {
      if (isSeeking) {
        if (seekTo) {
          const fraction = getFractionFromMouseEvent(elemProgress, event);
          seekTo(fraction);
        }
      } else {
        const isInProgressBar = elemProgress.contains(event.target);
        if (isInProgressBar) {
          const fraction = getFractionFromMouseEvent(elemProgress, event);
          onChangeHoveredTime(fraction);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener('mousemove', handleProgressMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
    };
  }, [seekTo, isSeeking, onChangeHoveredTime]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      role="slider"
      tabIndex="-1"
      ref={refProgressContainer}
      className={styles.progressContainer}
      onTouchStart={handleProgressMouseDown}
      onClick={handleProgressClick}
      onMouseDown={handleProgressMouseDown}
      onMouseOut={handleProgressMouseOut}
      onBlur={handleProgressMouseOut}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={played * 100}
    >
      <div className={styles.progress}>
        <div
          className={classNames(
            styles.progressLoaded,
            {
              [appStyles.hide]: loaded === undefined,
            },
          )}
          style={{
            width: `${loaded * 100}%`,
          }}
        />
        <div
          className={classNames(
            styles.progressHover,
            {
              [appStyles.hide]: hovered === undefined,
            },
          )}
          style={{
            width: `${hovered * 100}%`,
          }}
        />
        <div
          className={classNames(
            styles.progressPlayed,
            {
              [appStyles.hide]: played === undefined,
            },
          )}
          style={{
            width: `${played * 100}%`,
          }}
        >
          <div className={styles.progressDot} />
        </div>
        <div
          className={classNames(
            styles.tooltipContainer,
            {
              [appStyles.hide]: hovered === undefined,
            },
          )}
          style={{
            left: `calc(${hovered * 100}% - ${tooltipContainerWidth / 2}px)`,
            width: tooltipContainerWidth,
          }}
        >
          <span className={styles.tooltipText}>
            {timeStringHover}
          </span>
        </div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  playerStatus: PropTypes.shape({
    isSeeking: PropTypes.bool,
    duration: PropTypes.number,
    loaded: PropTypes.number,
    hovered: PropTypes.number,
    played: PropTypes.number,
  }).isRequired,
  seekTo: PropTypes.func,
  onChangeHoveredTime: PropTypes.func.isRequired,
};

ProgressBar.defaultProps = {
  seekTo: undefined,
};

export default ProgressBar;
