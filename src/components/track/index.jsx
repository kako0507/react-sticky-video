import { use, useEffect } from 'react';
import clsx from 'clsx';
import t from '../../constants/actionTypes';
import Store from '../../store';
import { parseWebVTT, getActiveCues } from '../../webvtt';
import styles from './track.module.scss';

const Track = ({
  isShowControls,
  captions,
  currentTime = 0,
  selectedCaption,
}) => {
  const {
    state: { vttCues },
    dispatch,
  } = use(Store);

  // Avoid re-downloading when the parent passes a new but equal `captions` array.
  const captionsKey = JSON.stringify(captions.map(({ src, label }) => ({ src, label })));

  // download and parse every caption file
  useEffect(() => {
    const controller = new AbortController();
    JSON.parse(captionsKey).forEach(async ({ src, label }) => {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load captions "${label}" (${response.status})`);
        }
        const cues = parseWebVTT(await response.text());
        dispatch({
          type: t.SET_WEBVTT_CUES,
          data: { [label]: cues },
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      }
    });
    return () => {
      controller.abort();
    };
  }, [captionsKey, dispatch]);

  const activeCues = getActiveCues(vttCues[selectedCaption], currentTime);

  return (
    <div
      className={clsx(
        styles.container,
        {
          [styles.pullUp]: isShowControls,
        },
      )}
    >
      <div className={styles.content}>
        {activeCues.map((cue) => (
          <div
            key={`${cue.startTime}-${cue.endTime}-${cue.text}`}
            className={styles.cue}
          >
            {cue.text.split('\n').map((line, index) => (
              <span key={index} className={styles.line}>{line}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Track;
