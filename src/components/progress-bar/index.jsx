import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import t from '../../constants/actionTypes';
import {
  getFractionFromMouseEvent,
  getTimeStringFromSeconds,
} from '../../utils';
import Store from '../../store';
import appStyles from '../../styles.scss';
import styles from './styles.scss';

const tooltipContainerWidth = 200;

const ProgressBar = ({
  seekTo,
}) => {
  const {
    state: {
      playerStatus: {
        isSeeking,
        currentTime,
        hoveredTime,
        duration,
        loaded,
      },
    },
    dispatch,
  } = useContext(Store);
  const refProgressContainer = useRef(null);
  let currentTimePercentage;
  let hoveredTimePercentage;
  let hoveredTimeString;
  if (duration !== undefined) {
    if (currentTime !== undefined) {
      currentTimePercentage = (currentTime * 100) / duration;
    }
    if (hoveredTime !== undefined) {
      hoveredTimePercentage = (hoveredTime * 100) / duration;
      hoveredTimeString = getTimeStringFromSeconds(Math.round(hoveredTime));
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
      dispatch({
        type: t.SET_HOVERED_TIME,
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }, [dispatch, isSeeking]);

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
          dispatch({
            type: t.SET_HOVERED_TIME,
            data: fraction,
          });
        }
      }
    };
    document.addEventListener('mousemove', handleProgressMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
    };
  }, [seekTo, isSeeking, dispatch]);

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
      aria-valuenow={currentTimePercentage}
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
              [appStyles.hide]: hoveredTime === undefined,
            },
          )}
          style={{
            width: `${hoveredTimePercentage}%`,
          }}
        />
        <div
          className={classNames(
            styles.progressPlayed,
            {
              [appStyles.hide]: currentTime === undefined,
            },
          )}
          style={{
            width: `${currentTimePercentage}%`,
          }}
        >
          <div className={styles.progressDot} />
        </div>
        <div
          className={classNames(
            styles.tooltipContainer,
            {
              [appStyles.hide]: hoveredTime === undefined,
            },
          )}
          style={{
            left: `calc(${hoveredTimePercentage}% - ${tooltipContainerWidth / 2}px)`,
            width: tooltipContainerWidth,
          }}
        >
          <span className={styles.tooltipText}>
            {hoveredTimeString}
          </span>
        </div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  seekTo: PropTypes.func,
};

ProgressBar.defaultProps = {
  seekTo: undefined,
};

export default ProgressBar;
