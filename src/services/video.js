export default ({
  container,
  setPlayer,
}) => {
  // eslint-disable-next-line no-unused-expressions
  container.querySelector('iframe')?.remove();
  setPlayer({
    isPlayed: () => {
      const video = container.querySelector('video');
      return video?.paused === false;
    },
  });
};
