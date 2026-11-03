const TIMESTAMP = /^(?:(\d+):)?([0-5]\d):([0-5]\d)\.(\d{3})$/;
const ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': '\u00a0',
  '&lrm;': '\u200e',
  '&rlm;': '\u200f',
};

const parseTimestamp = (value) => {
  const match = TIMESTAMP.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const [, hours = '0', minutes, seconds, milliseconds] = match;
  return (Number(hours) * 3600)
    + (Number(minutes) * 60)
    + Number(seconds)
    + (Number(milliseconds) / 1000);
};

/** Removes cue markup (`<b>`, `<v Speaker>`, `<00:01.000>` …) and decodes entities. */
const toPlainText = (text) => text
  .replace(/<[^>]*>/g, '')
  .replace(/&(?:amp|lt|gt|quot|#39|nbsp|lrm|rlm);/g, (entity) => ENTITIES[entity]);

/**
 * Parses a WebVTT document into cues.
 * Cue settings, regions and styles are ignored; markup is stripped from the text.
 *
 * @param {string} source
 * @returns {Array<{ startTime: number, endTime: number, text: string }>}
 */
export const parseWebVTT = (source) => {
  const blocks = source
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/);

  if (!/^WEBVTT(?:[ \t]|$)/.test(blocks[0] ?? '')) {
    throw new Error('Invalid WebVTT file: missing "WEBVTT" header.');
  }

  return blocks.slice(1).flatMap((block) => {
    const lines = block.split('\n');
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    // NOTE / STYLE / REGION blocks don't have a timing line
    if (timingIndex === -1 || timingIndex > 1) {
      return [];
    }
    const [start, rest = ''] = lines[timingIndex].split('-->');
    const [end] = rest.trim().split(/\s+/);
    const startTime = parseTimestamp(start);
    const endTime = parseTimestamp(end ?? '');
    if (startTime === undefined || endTime === undefined) {
      return [];
    }
    return [{
      startTime,
      endTime,
      text: toPlainText(lines.slice(timingIndex + 1).join('\n')).trim(),
    }];
  });
};

/** Returns the cues that should be visible at `currentTime`. */
export const getActiveCues = (cues = [], currentTime = 0) => cues.filter(
  (cue) => cue.startTime <= currentTime && cue.endTime > currentTime,
);
