import clsx from 'clsx';
import { getTimeStringFromSeconds } from '../../utils';
import appStyles from '../../app.module.scss';
import styles from './timer.module.scss';

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
      className={clsx(
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

export default Timer;
