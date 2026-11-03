import { describe, expect, it } from 'vitest';
import {
  parseYouTubeVideoId,
  getTimeStringFromSeconds,
  getFractionFromMouseEvent,
  isElementInViewport,
} from './utils';

const mockRect = (rect) => ({
  getBoundingClientRect: () => ({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    ...rect,
  }),
});

describe('parseYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=7EIkSKnCW8E', '7EIkSKnCW8E'],
    ['https://youtube.com/watch?v=7EIkSKnCW8E&t=42s', '7EIkSKnCW8E'],
    ['https://m.youtube.com/watch?v=7EIkSKnCW8E', '7EIkSKnCW8E'],
    ['https://youtu.be/Fkd9TWUtFm0', 'Fkd9TWUtFm0'],
    ['https://youtu.be/Fkd9TWUtFm0?si=abc', 'Fkd9TWUtFm0'],
    ['https://www.youtube.com/embed/Fkd9TWUtFm0', 'Fkd9TWUtFm0'],
    ['https://www.youtube-nocookie.com/embed/Fkd9TWUtFm0', 'Fkd9TWUtFm0'],
    ['https://www.youtube.com/shorts/Fkd9TWUtFm0', 'Fkd9TWUtFm0'],
    ['https://www.youtube.com/live/Fkd9TWUtFm0', 'Fkd9TWUtFm0'],
  ])('extracts the id from %s', (url, id) => {
    expect(parseYouTubeVideoId(url)).toBe(id);
  });

  it.each([
    'trailer_400p.ogg',
    'https://example.com/video.mp4',
    'https://www.dailymotion.com/video/x5slpa7',
    'https://www.youtube.com/watch?v=too-short',
    'https://www.youtube.com/channel/UCAuUUnT6oDeKwE6v1NGQxug',
    'https://evil-youtube.com/watch?v=7EIkSKnCW8E',
    '',
    undefined,
    [{ src: 'video.mp4' }],
  ])('returns undefined for %j', (url) => {
    expect(parseYouTubeVideoId(url)).toBeUndefined();
  });
});

describe('getTimeStringFromSeconds', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [65, '01:05'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(getTimeStringFromSeconds(seconds)).toBe(expected);
  });
});

describe('getFractionFromMouseEvent', () => {
  const element = mockRect({ left: 100, width: 200 });

  it('returns the relative horizontal position', () => {
    expect(getFractionFromMouseEvent(element, { clientX: 199 })).toBe(0.5);
  });

  it('clamps the value between 0 and 1', () => {
    expect(getFractionFromMouseEvent(element, { clientX: 0 })).toBe(0);
    expect(getFractionFromMouseEvent(element, { clientX: 1000 })).toBe(1);
  });

  it('supports touch events', () => {
    expect(getFractionFromMouseEvent(element, { touches: [{ clientX: 299 }] })).toBe(1);
  });
});

describe('isElementInViewport', () => {
  it('detects an element inside the viewport', () => {
    expect(isElementInViewport(mockRect({ top: 10, height: 100, width: 100 }))).toBe(true);
  });

  it('detects an element scrolled above the viewport', () => {
    expect(isElementInViewport(mockRect({ top: -500, height: 100, width: 100 }))).toBe(false);
  });

  it('detects an element below the viewport', () => {
    expect(isElementInViewport(
      mockRect({ top: window.innerHeight + 1, height: 100, width: 100 }),
    )).toBe(false);
  });
});
