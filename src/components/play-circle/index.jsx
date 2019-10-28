import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlayCircle,
} from '@fortawesome/free-solid-svg-icons';
import styles from './styles.scss';

const PlayCircle = () => (
  <>
    <div
      className={styles.bg}
    />
    <div
      className={styles.container}
    >
      <FontAwesomeIcon
        icon={faPlayCircle}
      />
    </div>
  </>
);

export default PlayCircle;
