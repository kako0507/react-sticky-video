import _ from 'lodash';

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
