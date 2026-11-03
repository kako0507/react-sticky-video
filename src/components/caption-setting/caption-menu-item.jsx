import { useContext, useCallback } from 'react';
import t from '../../constants/actionTypes';
import Store from '../../store';
import styles from './caption-setting.module.scss';

const CaptionMenuItem = ({ label }) => {
  const {
    state: { selectedCaption },
    dispatch,
  } = useContext(Store);

  const handleSelect = useCallback(() => {
    dispatch({
      type: t.SELECT_CAPTION,
      data: label,
    });
  }, [dispatch, label]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  }, [handleSelect]);

  return (
    <div
      tabIndex={-1}
      role="menuitemradio"
      className={styles.menuItem}
      aria-checked={selectedCaption === label}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.label}>
        {label}
      </div>
    </div>
  );
};

export default CaptionMenuItem;
