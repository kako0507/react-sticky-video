import { use, useEffect, useRef } from 'react';
import t from '../constants/actionTypes';
import Store from '../store';
import usePlayerEvents from '../hooks/use-player-events';
import { loadYouTubeIframeApi } from '../utils';

// The IFrame API expects numeric flags, so convert booleans to 1 / 0.
const normalizePlayerVars = (playerVars) => Object.fromEntries(
  Object.entries(playerVars).map(([key, value]) => [
    key,
    typeof value === 'boolean' ? Number(value) : value,
  ]),
);

const createPlayer = ({
  YT,
  target,
  videoId,
  playerVars,
  controls,
  events,
  onPlayerReady,
}) => {
  let timeupdateInterval;
  let prevPlayerState;

  const stopTimeUpdate = () => {
    clearInterval(timeupdateInterval);
    timeupdateInterval = undefined;
  };

  const player = new YT.Player(target, {
    videoId,
    playerVars: {
      ...normalizePlayerVars(playerVars),
      controls: controls ? 1 : 0,
      playsinline: 1,
      fs: 0,
      origin: window.location.origin,
      cc_load_policy: 3,
    },
  });

  const onTimeUpdate = () => {
    events.onTimeUpdate(
      player.getCurrentTime(),
      player.getVideoLoadedFraction?.(),
    );
  };

  const onReady = () => {
    onPlayerReady(player);
    events.onReady(
      player.getDuration(),
      player.isMuted(),
      player.getVolume() / 100,
      {
        play: () => {
          player.playVideo();
        },
        pause: () => {
          player.pauseVideo();
        },
        seekTo: (second, isSeeking, isPlaying) => {
          player.seekTo(second, !isSeeking);
          if (!isSeeking && isPlaying) {
            player.playVideo();
          } else {
            stopTimeUpdate();
          }
        },
        setMuted: (isMuted) => {
          if (isMuted) {
            player.mute();
          } else {
            player.unMute();
          }
        },
        setVolume: (volume) => {
          if (volume !== undefined) {
            player.setVolume(Math.round(volume * 100));
            if (volume > 0 && player.isMuted()) {
              player.unMute();
            }
          }
        },
      },
    );
  };

  const onStateChange = ({ data: playerState }) => {
    stopTimeUpdate();
    if (playerState === YT.PlayerState.PLAYING) {
      timeupdateInterval = setInterval(onTimeUpdate, 200);
    }
    switch (playerState) {
      case YT.PlayerState.PLAYING:
        events.onPlay();
        break;
      case YT.PlayerState.BUFFERING:
        if ([-1, YT.PlayerState.PLAYING].includes(prevPlayerState)) {
          events.onPlay();
        }
        break;
      case YT.PlayerState.ENDED:
      case YT.PlayerState.PAUSED:
        events.onPause();
        break;
      case YT.PlayerState.CUED:
        events.onDurationChange(player.getDuration());
        break;
      default:
    }
    prevPlayerState = playerState;
  };

  player.addEventListener('onReady', onReady);
  player.addEventListener('onStateChange', onStateChange);

  return () => {
    stopTimeUpdate();
    player.destroy();
  };
};

const Youtube = ({
  videoId,
  playerVars,
  controls,
}) => {
  const { dispatch } = use(Store);
  const events = usePlayerEvents(dispatch);
  const refContainer = useRef(null);
  const refPlayer = useRef(null);
  const refVideoId = useRef(videoId);
  const refLoadedVideoId = useRef(videoId);
  const autoplay = Boolean(playerVars.autoplay);
  // Re-create the player only when the player parameters actually change.
  const playerVarsKey = JSON.stringify(playerVars);

  // create / destroy the YouTube player
  useEffect(() => {
    const container = refContainer.current;
    let cancelled = false;
    let destroyPlayer;

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled) {
        return;
      }
      // YT.Player replaces its target with an iframe, so give it a node React doesn't own.
      const target = document.createElement('div');
      container.appendChild(target);
      refLoadedVideoId.current = refVideoId.current;
      destroyPlayer = createPlayer({
        YT,
        target,
        videoId: refVideoId.current,
        playerVars: JSON.parse(playerVarsKey),
        controls,
        events,
        onPlayerReady: (player) => {
          refPlayer.current = player;
        },
      });
    }).catch((error) => {
      console.error(error);
    });

    return () => {
      cancelled = true;
      refPlayer.current = null;
      if (destroyPlayer) {
        destroyPlayer();
        dispatch({ type: t.DESTROY_PLAYER });
      }
      container.replaceChildren();
    };
  }, [playerVarsKey, controls, events, dispatch]);

  // play another video
  useEffect(() => {
    refVideoId.current = videoId;
    const player = refPlayer.current;
    if (!player || refLoadedVideoId.current === videoId) {
      return;
    }
    refLoadedVideoId.current = videoId;
    if (autoplay) {
      player.loadVideoById(videoId);
    } else {
      player.cueVideoById(videoId);
    }
  }, [videoId, autoplay]);

  return <div ref={refContainer} />;
};

export default Youtube;
