import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlayCircle,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import appStyles from '../../styles.scss';
import styles from './styles.scss';

const PlayCircle = ({ isReady }) => (
  <>
    <div
      className={classNames(
        styles.bg,
        { [appStyles.hide]: !isReady },
      )}
    />
    <div
      className={styles.container}
    >
      <FontAwesomeIcon
        icon={isReady ? faPlayCircle : faCircleNotch}
        spin={!isReady}
      />
    </div>
  </>
);

PlayCircle.propTypes = {
  isReady: PropTypes.bool,
};

PlayCircle.defaultProps = {
  isReady: false,
};

export default PlayCircle;
