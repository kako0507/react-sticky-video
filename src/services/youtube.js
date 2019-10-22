/* eslint-disable no-undef */
import load from 'load-script';
import { genPlayerElement } from '../utils';

let loaded;

const genPlayer = ({
  videoId,
  container,
  setPlayer,
  autoPlay,
  controls,
}) => {
  const element = genPlayerElement(container, 'div');
  const player = new YT.Player(element, {
    videoId,
    playerVars: {
      autoplay: autoPlay ? 1 : 0,
      controls: controls ? 1 : 0,
    },
  });

  const isPlayed = () => {
    const state = player.getPlayerState();
    return state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING;
  };

  const loadVideo = (id, play) => {
    if (play) {
      player.loadVideoById(id);
    } else {
      player.cueVideoById(id);
    }
    setPlayer({
      player,
      videoId: id,
      service: 'youtube',
      loadVideo,
      isPlayed,
    });
  };

  setPlayer({
    player,
    videoId,
    service: 'youtube',
    loadVideo,
    isPlayed,
  });
};

export default (params) => {
  if (loaded) {
    genPlayer(params);
  }
  load('https://www.youtube.com/iframe_api', () => {
    window.onYouTubeIframeAPIReady = () => {
      genPlayer(params);
      loaded = true;
    };
  });
};
