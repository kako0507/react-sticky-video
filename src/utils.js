import _ from 'lodash';
import leftPad from 'left-pad';

export const setAttributes = (element, attributes) => {
  _.forEach(attributes, (value, key) => {
    element.setAttribute(key, value);
  });
};

export const genPlayerElement = (container, tagName, attributes) => {
  const element = document.createElement(tagName);
  // eslint-disable-next-line no-param-reassign
  container.innerHTML = '';
  container.appendChild(element);
  if (attributes) {
    setAttributes(element, attributes);
  }
  return element;
};

export const isElementInViewport = (element) => {
  const {
    top,
    left,
    height,
    width,
  } = element.getBoundingClientRect();
  const verticalVisible = (top <= window.innerHeight) && ((top + height) >= 0);
  const horizontalVisible = (left <= window.innerWidth) && ((left + width) >= 0);
  return verticalVisible && horizontalVisible;
};

export const checkFullScreen = () => _.some([
  document.fullScreen,
  document.fullscreen,
  document.mozFullScreen,
  document.webkitIsFullScreen,
]);

export const openFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    return false;
  }
  return true;
};

export const closeFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    return false;
  }
  return true;
};

export const getTimeStringFromSeconds = (seconds) => {
  const second = seconds % 60;
  let minute;
  let hour;
  minute = Math.floor(seconds / 60);
  if (minute > 60) {
    hour = Math.floor(minute / 60);
    minute %= 60;
  }
  return `${hour || ''}${leftPad(minute || 0, 2, 0)}:${leftPad(second || 0, 2, 0)}`;
};
