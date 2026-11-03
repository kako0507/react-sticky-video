import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCirclePlay,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import appStyles from '../../app.module.scss';
import styles from './play-circle.module.scss';

const PlayCircle = ({ isReady = false }) => (
  <>
    <div
      className={classNames(
        styles.bg,
        { [appStyles.hide]: !isReady },
      )}
    />
    <div className={styles.container}>
      <FontAwesomeIcon
        icon={isReady ? faCirclePlay : faCircleNotch}
        spin={!isReady}
      />
    </div>
  </>
);

export default PlayCircle;
