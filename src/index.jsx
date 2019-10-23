import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Youtube from './services/youtube';
import Facebook from './services/facebook';
import FileSource from './services/file-source';
import { isElementInViewport, getVideoInfo } from './utils';
import styles from './styles.scss';

const StickyVideo = ({
  url,
  height,
  width,
  autoPlay,
  controls,
  playsInline,
  stickyConfig: {
    width: stickyWidth,
    height: stickyHeight,
    position,
  },
  serviceConfig,
}) => {
  const [sticky, setSticky] = useState(false);
  const [isPlaying, setPlaying] = useState(false);

  const refContainer = useRef(null);
  const refHidden = useRef(null);
  const refPlayerContainer = useRef(null);

  const { id: videoId, service } = getVideoInfo(url);

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!sticky && !isElementInViewport(element)) {
        if (isPlaying) {
          setSticky(true);
        }
      }
      if (sticky && isElementInViewport(element)) {
        setSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    sticky,
    isPlaying,
    width,
    height,
    stickyWidth,
    stickyHeight,
  ]);

  let nodePlayer;
  switch (service) {
    case 'youtube':
      nodePlayer = (
        <Youtube
          videoId={videoId}
          controls={controls}
          autoPlay={autoPlay}
          playsInline={playsInline}
          setPlaying={setPlaying}
        />
      );
      break;
    case 'facebook':
      nodePlayer = (
        <Facebook
          url={url}
          width={width}
          height={height}
          controls={controls}
          autoPlay={autoPlay}
          playsInline={playsInline}
          setPlaying={setPlaying}
          config={serviceConfig.facebook}
        />
      );
      break;
    default:
      nodePlayer = (
        <FileSource
          src={url}
          controls={controls}
          autoPlay={autoPlay}
          playsInline={playsInline}
          setPlaying={setPlaying}
        />
      );
  }

  return (
    <div
      className={styles.container}
      style={{
        width,
        height,
      }}
    >
      <div
        ref={refHidden}
        className={styles.hidden}
      />
      <div
        ref={refContainer}
        className={classNames(
          styles.player,
          {
            [styles.sticky]: sticky,
            [styles.stTopRight]: position === 'top-right',
            [styles.stTopLeft]: position === 'top-left',
            [styles.stBottomRight]: position === 'bottom-right',
            [styles.stBottomLeft]: position === 'bottom-left',
          },
        )}
        style={(sticky
          ? {
            width: stickyWidth,
            height: stickyHeight,
          }
          : {
            width,
            height,
          }
        )}
      >
        <div
          ref={refPlayerContainer}
          className={styles.playerContainer}
        >
          {nodePlayer}
        </div>
        <div className={styles.controls} />
      </div>
    </div>
  );
};

StickyVideo.propTypes = {
  url: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  autoPlay: PropTypes.bool,
  controls: PropTypes.bool,
  playsInline: PropTypes.bool,
  stickyConfig: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    position: PropTypes.oneOf([
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left',
    ]),
  }),
  serviceConfig: PropTypes.shape({
    facebook: PropTypes.object,
  }),
};

StickyVideo.defaultProps = {
  width: 640,
  height: 360,
  autoPlay: false,
  controls: true,
  playsInline: true,
  stickyConfig: {
    width: 320,
    height: 180,
    position: 'bottom-right',
  },
  serviceConfig: {},
};

export default StickyVideo;
