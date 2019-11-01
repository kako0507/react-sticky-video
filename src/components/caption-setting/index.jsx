import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import useDeepCompareEffect from 'use-deep-compare-effect';
import styles from './styles.scss';

const CaptionSetting = ({
  captions,
  selectedCaption,
  setSelectedCaption,
}) => {
  useDeepCompareEffect(() => {
    const defaultCaption = _.find(captions, (c) => c.default);
    if (defaultCaption?.label) {
      setSelectedCaption(defaultCaption.label);
    }
  }, [captions]);

  if (!captions.length) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div
        className={styles.menu}
        role="menu"
      >
        {captions.map(({ label }) => (
          <div
            tabIndex="0"
            role="menuitemradio"
            className={styles.menuItem}
            aria-checked={selectedCaption === label}
            onClick={() => {
              setSelectedCaption(label);
            }}
            key={label}
          >
            <div
              className={styles.label}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

CaptionSetting.propTypes = {
  captions: PropTypes.arrayOf(PropTypes.shape({
    default: PropTypes.bool,
    label: PropTypes.string,
  })).isRequired,
  selectedCaption: PropTypes.string.isRequired,
  setSelectedCaption: PropTypes.func.isRequired,
};

CaptionSetting.defaultProps = {
};

export default CaptionSetting;
