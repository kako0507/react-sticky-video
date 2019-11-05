import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  faVolumeUp,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';
import t from '../../constants/actionTypes';
import {
  getFractionFromMouseEvent,
} from '../../utils';
import Store from '../../store';
import IconButton from '../icon-button';
import styles from './volume-slider.scss';
import variables from '../../variables.scss';
import usePlayerControls from '../../hooks/use-player-controls';

const [volumeSliderWidth] = variables.volumeSliderWidth.split('px');

const VolumeSlider = ({ show }) => {
  const {
    state: {
      isVolumeSliderVisible,
      playerStatus: {
        isMuted,
        volume,
        isChangingVolume,
      },
    },
    dispatch,
  } = useContext(Store);
  const {
    setMuted,
    setVolume,
    addVolume,
  } = usePlayerControls(dispatch);
  const refSliderPanel = useRef(null);

  const setToMuted = useCallback(() => {
    setMuted(true);
  }, [setMuted]);
  const setToUnMuted = useCallback(() => {
    setMuted(false);
  }, [setMuted]);
  const handleMouseOver = useCallback(() => {
    dispatch({
      type: t.SHOW_VOLUME_SLIDER,
      data: true,
    });
  }, [dispatch]);
  const handleMouseOut = useCallback(() => {
    if (!isChangingVolume) {
      dispatch({
        type: t.SHOW_VOLUME_SLIDER,
        data: false,
      });
    }
  }, [dispatch, isChangingVolume]);

  const handleSliderMouseDown = useCallback((event) => {
    const elemSliderPanel = refSliderPanel.current;
    const fraction = getFractionFromMouseEvent(elemSliderPanel, event);
    setVolume(fraction);
    elemSliderPanel.focus();
  }, [setVolume]);
  const handleStopSliderAction = useCallback(() => {
    setVolume();
  }, [setVolume]);
  const handleSliderKeyDown = useCallback((event) => {
    if (!addVolume) {
      return;
    }
    if (event.keyCode === 39) {
      addVolume(0.1);
    } else if (event.keyCode === 37) {
      addVolume(-0.1);
    }
  }, [addVolume]);

  useEffect(() => {
    const elemSliderPanel = refSliderPanel.current;
    const handleSliderMouseMove = (event) => {
      if (isChangingVolume) {
        const fraction = getFractionFromMouseEvent(elemSliderPanel, event);
        setVolume(fraction);
      }
    };
    document.addEventListener('mousemove', handleSliderMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleSliderMouseMove);
    };
  }, [isChangingVolume, setVolume]);

  return (
    <div
      className={styles.container}
      onFocus={handleMouseOver}
      onMouseOver={handleMouseOver}
      onBlur={handleMouseOut}
      onMouseOut={handleMouseOut}
    >
      <IconButton
        icon={isMuted
          ? faVolumeMute
          : faVolumeUp}
        onClick={isMuted
          ? setToUnMuted
          : setToMuted}
        disabled={!setMuted}
      />
      <div
        ref={refSliderPanel}
        role="slider"
        tabIndex="0"
        className={classNames(
          styles.panel,
          {
            [styles.active]: show && isVolumeSliderVisible,
          },
        )}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        onMouseDown={handleSliderMouseDown}
        onKeyDown={handleSliderKeyDown}
        onKeyUp={handleStopSliderAction}
        onClick={handleStopSliderAction}
      >
        <div className={styles.content}>
          <div
            className={styles.handle}
            style={{
              left: (isMuted || !volume) ? 0 : volume * volumeSliderWidth,
            }}
          />
        </div>
      </div>
    </div>
  );
};

VolumeSlider.propTypes = {
  show: PropTypes.bool,
};

VolumeSlider.defaultProps = {
  show: false,
};

export default VolumeSlider;
