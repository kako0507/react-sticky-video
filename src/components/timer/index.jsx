import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  getTimeStringFromSeconds,
} from '../../utils';
import appStyles from '../../styles.scss';
import styles from './styles.scss';

const Timer = ({
  currentTime,
  duration,
}) => {
  let timeStringDuration;
  let timeStringPlayed;
  if (duration !== undefined) {
    timeStringPlayed = getTimeStringFromSeconds(Math.round(currentTime || 0));
    timeStringDuration = getTimeStringFromSeconds(Math.round(duration));
  }
  return (
    <div
      className={classNames(
        styles.container,
        {
          [appStyles.hide]: duration === undefined,
        },
      )}
    >
      <span className={styles.current}>
        {timeStringPlayed}
      </span>
      <span className={styles.separator}> / </span>
      <span className={styles.duration}>
        {timeStringDuration}
      </span>
    </div>
  );
};

Timer.propTypes = {
  currentTime: PropTypes.number,
  duration: PropTypes.number,
};

Timer.defaultProps = {
  currentTime: undefined,
  duration: undefined,
};

export default Timer;
