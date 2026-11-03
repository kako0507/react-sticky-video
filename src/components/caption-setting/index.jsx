import {
  use,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import classNames from 'classnames';
import t from '../../constants/actionTypes';
import Store from '../../store';
import useOnClickOutside from '../../hooks/use-onclickoutside';
import CaptionMenuItem from './caption-menu-item';
import appStyles from '../../app.module.scss';
import styles from './caption-setting.module.scss';

const CaptionSetting = ({ captions, refCCButton }) => {
  const {
    state: { isShowingCCSetting },
    dispatch,
  } = use(Store);
  const refPanel = useRef(null);

  const close = useCallback(() => {
    dispatch({
      type: t.SHOW_CC_SETTING,
      data: false,
    });
  }, [dispatch]);

  const defaultCaptionLabel = captions.find((caption) => caption.default)?.label;
  useEffect(() => {
    if (defaultCaptionLabel) {
      dispatch({
        type: t.SELECT_CAPTION,
        data: defaultCaptionLabel,
      });
    }
  }, [dispatch, defaultCaptionLabel]);

  useOnClickOutside(refPanel, close, refCCButton);

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

export default CaptionSetting;
