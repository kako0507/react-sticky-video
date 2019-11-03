import _ from 'lodash';
import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import vtt from 'vtt.js';
import t from '../../constants/actionTypes';
import Store from '../../store';
import styles from './styles.scss';

const { WebVTT, VTTCue } = vtt;

const parseCues = (text) => {
  const cues = [];
  const oldVTTCue = global.VTTCue;
  try {
    global.VTTCue = VTTCue;
    const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
    parser.oncue = (c) => {
      cues.push(c);
    };
    parser.parse(text);
  } finally {
    global.VTTCue = oldVTTCue;
  }
  return cues;
};

const renderCues = (
  element,
  cues,
  setCues,
  selectedCaption,
  currentTime,
  isHeightChanged,
) => {
  const selected = cues[selectedCaption];
  if (selected?.cues?.length > 0) {
    let selectedCues = selected.cues;
    if (isHeightChanged) {
      selectedCues = parseCues(selected.text);
      setCues(
        selectedCaption,
        {
          cues: selectedCues,
          text: selected.text,
        },
      );
    }
    const cue = _.filter(selectedCues, (c) => _.every([
      c.startTime < currentTime,
      c.endTime >= currentTime,
    ]));
    WebVTT.processCues(
      window,
      cue,
      element,
    );
  }
};

const Track = ({
  isShowControls,
  isSticky,
  captions,
  currentTime,
  selectedCaption,
}) => {
  const {
    state: { vttCues },
    dispatch,
  } = useContext(Store);
  const refTrack = useRef(null);

  const setCues = useCallback((label, data) => {
    dispatch({
      type: t.SET_WEBVTT_CUES,
      data: {
        [label]: data,
      },
    });
  }, [dispatch]);

  useEffect(() => {
    captions.forEach((caption) => {
      const request = new XMLHttpRequest();
      request.open(
        'GET',
        caption.src,
        true,
      );
      request.send(null);
      request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
          const type = request.getResponseHeader('Content-Type');
          if (type.indexOf('text') !== 1) {
            setCues(
              caption.label,
              {
                cues: parseCues(request.responseText),
                text: request.responseText,
              },
            );
          }
        }
      };
    });
  }, [captions, setCues]);

  useEffect(() => {
    renderCues(
      refTrack.current,
      vttCues,
      setCues,
      selectedCaption,
      currentTime,
    );
  }, [
    vttCues,
    setCues,
    selectedCaption,
    currentTime,
  ]);

  useEffect(() => {
    renderCues(
      refTrack.current,
      vttCues,
      setCues,
      selectedCaption,
      currentTime,
      true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowControls, isSticky]);

  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.pullUp]: isShowControls,
        },
      )}
    >
      <div
        ref={refTrack}
        className={styles.track}
      />
    </div>
  );
};

Track.propTypes = {
  isShowControls: PropTypes.bool.isRequired,
  isSticky: PropTypes.bool,
  currentTime: PropTypes.number,
  captions: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string,
  })).isRequired,
  selectedCaption: PropTypes.string.isRequired,
};

Track.defaultProps = {
  isSticky: false,
  currentTime: 0,
};

export default Track;
