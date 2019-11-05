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
import appStyles from '../../app.scss';
import styles from './progress-bar.scss';

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
    seekTo(fraction);
  }, [seekTo]);

  const handleProgressClick = useCallback(() => {
    seekTo();
  }, [seekTo]);

  const handleProgressMouseOut = useCallback(() => {
    if (!isSeeking) {
      dispatch({
        type: t.SET_HOVERED_TIME,
      });
    }
  }, [dispatch, isSeeking]);

  useEffect(() => {
    const elemProgress = refProgressContainer.current;
    const handleProgressMouseMove = (event) => {
      if (isSeeking) {
        const fraction = getFractionFromMouseEvent(elemProgress, event);
        seekTo(fraction);
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
    document.addEventListener('touchmove', handleProgressMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
      document.removeEventListener('touchmove', handleProgressMouseMove);
    };
  }, [seekTo, isSeeking, dispatch]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      role="slider"
      tabIndex="-1"
      ref={refProgressContainer}
      className={styles.container}
      onClick={handleProgressClick}
      onMouseDown={handleProgressMouseDown}
      onTouchStart={handleProgressMouseDown}
      onMouseOut={handleProgressMouseOut}
      onTouchCancel={handleProgressMouseOut}
      onBlur={handleProgressMouseOut}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={currentTimePercentage}
    >
      <div className={styles.rel}>
        <div
          className={classNames(
            styles.loaded,
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
            styles.hovered,
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
            styles.played,
            {
              [appStyles.hide]: currentTime === undefined,
            },
          )}
          style={{
            width: `${currentTimePercentage}%`,
          }}
        >
          <div className={styles.dot} />
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
