import _ from 'lodash';
import React, {
  useContext,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import useDeepCompareEffect from 'use-deep-compare-effect';
import t from '../../constants/actionTypes';
import Store from '../../store';
import useOnClickOutside from '../../hooks/use-onclickoutside';
import CaptionMenuItem from './caption-menu-item';
import appStyles from '../../app.scss';
import styles from './caption-setting.scss';

const CaptionSetting = ({ captions, elemCCButton }) => {
  const {
    state: {
      isShowingCCSetting,
    },
    dispatch,
  } = useContext(Store);
  const refPanel = useRef(null);

  const close = useCallback(() => {
    dispatch({
      type: t.SHOW_CC_SETTING,
      data: false,
    });
  }, [dispatch]);

  useDeepCompareEffect(() => {
    const defaultCaption = _.find(captions, (c) => c.default);
    if (defaultCaption?.label) {
      dispatch({
        type: t.SELECT_CAPTION,
        data: defaultCaption.label,
      });
    }
  }, [captions]);

  useOnClickOutside(refPanel, close, elemCCButton);

  return (
    <div
      ref={refPanel}
      className={classNames(
        styles.panel,
        {
          [appStyles.hide]: !isShowingCCSetting,
        },
      )}
    >
      <div
        className={styles.menu}
        role="menu"
      >
        {captions.map(({ label }) => (
          <CaptionMenuItem
            label={label}
            key={label}
          />
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
  elemCCButton: PropTypes.instanceOf(Element),
};

CaptionSetting.defaultProps = {
  elemCCButton: undefined,
};

export default CaptionSetting;
