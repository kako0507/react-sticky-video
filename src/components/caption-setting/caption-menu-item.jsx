import React, { useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import t from '../../constants/actionTypes';
import Store from '../../store';
import styles from './styles.scss';

const CaptionMenuItem = ({
  label,
}) => {
  const {
    state: { selectedCaption },
    dispatch,
  } = useContext(Store);

  const handleClick = useCallback(() => {
    dispatch({
      type: t.SELECT_CAPTION,
      data: label,
    });
  }, [dispatch, label]);

  return (
    <div
      tabIndex="0"
      role="menuitemradio"
      className={styles.menuItem}
      aria-checked={selectedCaption === label}
      onClick={handleClick}
    >
      <div
        className={styles.label}
      >
        {label}
      </div>
    </div>
  );
};

CaptionMenuItem.propTypes = {
  label: PropTypes.string.isRequired,
};

export default CaptionMenuItem;
