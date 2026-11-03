import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import appStyles from '../../app.module.scss';
import styles from './icon-button.module.scss';

const IconButton = ({
  icon,
  label,
  hide = false,
  disabled = false,
  onClick,
}) => (
  <button
    type="button"
    className={clsx(
      styles.content,
      {
        [appStyles.hide]: hide,
      },
    )}
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
  >
    <FontAwesomeIcon icon={icon} />
  </button>
);

export default IconButton;
