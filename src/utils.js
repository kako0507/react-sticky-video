export const genPlayerElement = (container, tagName) => {
  const element = document.createElement(tagName);
  // eslint-disable-next-line no-param-reassign
  container.innerHTML = '';
  container.appendChild(element);
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
