/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
} from 'react';
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
import styles from './styles.scss';
import variables from '../../variables.scss';

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
      playerControls: {
        setMuted,
        setVolume,
      },
    },
    dispatch,
  } = useContext(Store);
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
    const fraction = getFractionFromMouseEvent(refSliderPanel.current, event);
    if (setVolume) {
      setVolume(fraction);
    }
    event.preventDefault();
    event.stopPropagation();
  }, [setVolume]);
  const handleSliderClick = useCallback((event) => {
    if (setVolume) {
      setVolume();
    }
    event.preventDefault();
    event.stopPropagation();
  }, [setVolume]);

  useEffect(() => {
    const elemSliderPanel = refSliderPanel.current;
    const handleSliderMouseMove = (event) => {
      if (isChangingVolume) {
        if (setVolume) {
          const fraction = getFractionFromMouseEvent(elemSliderPanel, event);
          setVolume(fraction);
        }
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
          styles.sliderPanel,
          {
            [styles.active]: show && isVolumeSliderVisible,
          },
        )}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={volume}
        onClick={handleSliderClick}
        onMouseDown={handleSliderMouseDown}
      >
        <div className={styles.slider}>
          <div
            className={styles.sliderHandle}
            style={{
              left: (isMuted || !volume) ? 0 : volume * volumeSliderWidth,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeSlider;
