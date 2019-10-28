import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appStyles from '../../styles.scss';
import styles from './styles.scss';

const IconButton = ({
  icon,
  hide,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    className={classNames(
      styles.icon,
      {
        [appStyles.hide]: hide,
      },
    )}
    onClick={onClick}
    disabled={disabled}
  >
    <FontAwesomeIcon
      icon={icon}
    />
  </button>
);

IconButton.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string,
  ]).isRequired,
  hide: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

IconButton.defaultProps = {
  hide: false,
  disabled: false,
  onClick: undefined,
};

export default IconButton;
