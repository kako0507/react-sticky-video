const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

/**
 * Returns the video id of a YouTube URL, or `undefined` for anything else.
 * Supports watch, youtu.be, embed, shorts and live URLs.
 */
export const parseYouTubeVideoId = (url) => {
  if (typeof url !== 'string') {
    return undefined;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const host = parsed.hostname.toLowerCase();
  const [first, second] = parsed.pathname.split('/').filter(Boolean);
  let id;
  if (host === 'youtu.be') {
    id = first;
  } else if (YOUTUBE_HOSTS.has(host)) {
    id = first === 'watch'
      ? parsed.searchParams.get('v')
      : ['embed', 'shorts', 'live', 'v'].includes(first) && second;
  }
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : undefined;
};

export const isElementInViewport = (element) => {
  const {
    top,
    left,
    height,
    width,
  } = element.getBoundingClientRect();
  const verticalVisible = top <= window.innerHeight && top + height >= 0;
  const horizontalVisible = left <= window.innerWidth && left + width >= 0;
  return verticalVisible && horizontalVisible;
};

export const getFractionFromMouseEvent = (element, event) => {
  const rect = element.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
  const relativeX = clientX - rect.left + 1;
  return Math.min(Math.max(relativeX / rect.width, 0), 1);
};

export const checkFullScreen = () => Boolean(
  document.fullscreenElement || document.webkitFullscreenElement,
);

export const openFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else {
    return false;
  }
  return true;
};

export const closeFullscreen = () => {
  if (!checkFullScreen()) {
    return false;
  }
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else {
    return false;
  }
  return true;
};

const pad = (value) => String(value).padStart(2, '0');

export const getTimeStringFromSeconds = (totalSeconds) => {
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

let youtubeApiPromise;

/**
 * Loads the YouTube IFrame Player API once and resolves with the global `YT` namespace.
 * Safe to call from multiple players at the same time.
 */
export const loadYouTubeIframeApi = () => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        youtubeApiPromise = undefined;
        reject(new Error('Failed to load the YouTube IFrame Player API.'));
      };
      document.head.appendChild(script);
    });
  }
  return youtubeApiPromise;
};
