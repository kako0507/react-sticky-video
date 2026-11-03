import {
  use,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import clsx from 'clsx';
import {
  faVolumeHigh,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';
import t from '../../constants/actionTypes';
import { getFractionFromMouseEvent } from '../../utils';
import Store from '../../store';
import IconButton from '../icon-button';
import usePlayerControls from '../../hooks/use-player-controls';
import styles from './volume-slider.module.scss';

const VOLUME_STEP = 0.1;

const VolumeSlider = ({ show = false }) => {
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
  } = use(Store);
  const { setMuted, setVolume, addVolume } = usePlayerControls(dispatch);
  const refSliderPanel = useRef(null);
  const displayedVolume = isMuted || !volume ? 0 : volume;

  const toggleMuted = useCallback(() => {
    setMuted(!isMuted);
  }, [setMuted, isMuted]);
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
    setVolume(getFractionFromMouseEvent(elemSliderPanel, event));
    elemSliderPanel.focus();
  }, [setVolume]);
  const handleStopSliderAction = useCallback(() => {
    setVolume();
  }, [setVolume]);
  const handleSliderKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      addVolume(VOLUME_STEP);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      addVolume(-VOLUME_STEP);
    }
  }, [addVolume]);

  useEffect(() => {
    if (!isChangingVolume) {
      return undefined;
    }
    const elemSliderPanel = refSliderPanel.current;
    const handleSliderMouseMove = (event) => {
      setVolume(getFractionFromMouseEvent(elemSliderPanel, event));
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
        icon={isMuted ? faVolumeXmark : faVolumeHigh}
        label={isMuted ? 'Unmute' : 'Mute'}
        onClick={toggleMuted}
      />
      <div
        ref={refSliderPanel}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        className={clsx(
          styles.panel,
          {
            [styles.active]: show && isVolumeSliderVisible,
          },
        )}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayedVolume * 100)}
        onMouseDown={handleSliderMouseDown}
        onKeyDown={handleSliderKeyDown}
        onKeyUp={handleStopSliderAction}
        onClick={handleStopSliderAction}
      >
        <div className={styles.content}>
          <div
            className={styles.handle}
            style={{ '--volume': displayedVolume }}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeSlider;
