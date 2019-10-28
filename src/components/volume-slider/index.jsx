/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useState,
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
import {
  getFractionFromMouseEvent,
} from '../../utils';
import IconButton from '../icon-button';
import styles from './styles.scss';
import variables from '../../variables.scss';

const [volumeSliderWidth] = variables.volumeSliderWidth.split('px');

const VolumeSlider = ({
  isMuted,
  isSettingVolume,
  volume,
  onSetMuted,
  onChangeVolume,
}) => {
  const [isShowingSlider, showSlider] = useState(false);
  const refSliderPanel = useRef(null);

  const setToMuted = useCallback(() => {
    onSetMuted(true);
  }, [onSetMuted]);
  const setToUnMuted = useCallback(() => {
    onSetMuted(false);
  }, [onSetMuted]);
  const handleMouseOver = useCallback(() => {
    showSlider(true);
  }, [showSlider]);
  const handleMouseOut = useCallback(() => {
    if (!isSettingVolume) {
      showSlider(false);
    }
  }, [isSettingVolume, showSlider]);

  const handleSliderMouseDown = useCallback((event) => {
    const fraction = getFractionFromMouseEvent(refSliderPanel.current, event);
    if (onChangeVolume) {
      onChangeVolume(fraction);
    }
    event.preventDefault();
    event.stopPropagation();
  }, [onChangeVolume]);
  const handleSliderClick = useCallback((event) => {
    if (onChangeVolume) {
      onChangeVolume();
    }
    event.preventDefault();
    event.stopPropagation();
  }, [onChangeVolume]);

  useEffect(() => {
    const elemSliderPanel = refSliderPanel.current;
    const handleSliderMouseMove = (event) => {
      if (isSettingVolume) {
        if (onChangeVolume) {
          const fraction = getFractionFromMouseEvent(elemSliderPanel, event);
          onChangeVolume(fraction);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    };
    document.addEventListener('mousemove', handleSliderMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleSliderMouseMove);
    };
  }, [isSettingVolume, onChangeVolume]);

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
        disabled={!onSetMuted}
      />
      <div
        ref={refSliderPanel}
        role="slider"
        tabIndex="0"
        className={classNames(
          styles.sliderPanel,
          {
            [styles.active]: isShowingSlider,
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
              left: isMuted ? 0 : volume * volumeSliderWidth,
            }}
          />
        </div>
      </div>
    </div>
  );
};

VolumeSlider.propTypes = {
  isMuted: PropTypes.bool,
  isSettingVolume: PropTypes.bool,
  volume: PropTypes.number,
  onSetMuted: PropTypes.func,
  onChangeVolume: PropTypes.func,
};

VolumeSlider.defaultProps = {
  isMuted: false,
  isSettingVolume: false,
  volume: 0,
  onSetMuted: undefined,
  onChangeVolume: undefined,
};

export default VolumeSlider;
