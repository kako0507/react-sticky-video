import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import getVideoId from 'get-video-id';
import youtube from './services/youtube';
import video from './services/video';
import { isElementInViewport } from './utils';
import styles from './styles.scss';

const StickyVideo = ({
  url,
  tracks,
  height,
  width,
  autoPlay,
  controls,
  stickyConfig: {
    width: stickyWidth,
    height: stickyHeight,
    position,
  },
}) => {
  const [sticky, setSticky] = useState(false);
  const [player, setPlayer] = useState(null);

  const refContainer = useRef(null);
  const refHidden = useRef(null);
  const refPlayer = useRef(null);

  const { id: videoId, service } = getVideoId(url);

  useEffect(() => {
    const element = refHidden.current;
    const handleScroll = () => {
      if (!sticky && !isElementInViewport(element)) {
        if (player?.isPlayed()) {
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
    player,
    sticky,
    width,
    height,
    stickyWidth,
    stickyHeight,
  ]);

  useEffect(() => {
    const params = {
      videoId,
      container: refContainer.current,
      setPlayer,
      autoPlay,
      controls,
      tracks,
    };
    if (player && player.service === service) {
      if (videoId !== player.videoId) {
        player.loadVideo(videoId, autoPlay);
      }
      return;
    }
    switch (service) {
      case 'youtube':
        youtube(params);
        break;
      default:
        video(params);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

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
        {!service && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={refPlayer}
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
            src={url}
            autoPlay={autoPlay}
            controls={controls}
          >
            {tracks.map(({
              src,
              srcLang,
              kind,
              label,
              isDefault,
            }) => (
              <track
                src={src}
                srcLang={srcLang}
                kind={kind}
                label={label}
                default={isDefault}
                key={src}
              />
            ))}
          </video>
        )}
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
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string,
      srcLang: PropTypes.string,
      kind: PropTypes.string,
      label: PropTypes.string,
      isDefault: PropTypes.bool,
    }),
  ),
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
};

StickyVideo.defaultProps = {
  tracks: [],
  width: 640,
  height: 360,
  autoPlay: false,
  controls: true,
  stickyConfig: {
    width: 320,
    height: 180,
    position: 'bottom-right',
  },
};

export default StickyVideo;
