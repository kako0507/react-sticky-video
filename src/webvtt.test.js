import { describe, expect, it } from 'vitest';
import { parseWebVTT, getActiveCues } from './webvtt';

const SAMPLE = `WEBVTT - TED talk

NOTE This is a comment
spanning two lines

STYLE
::cue { color: yellow }

intro
00:00:00.000 --> 00:00:07.000 align:start line:0
Translator: <b>Joseph</b> Geni
Reviewer: Thu-Huong Ha

00:15.260 --> 00:19.606
<v Thomas>I've always had a fascination &amp; love

1:00:00.500 --> 1:00:01.000
<c.yellow>Late</c> cue
`;

describe('parseWebVTT', () => {
  it('parses cues, skipping comments and style blocks', () => {
    expect(parseWebVTT(SAMPLE)).toEqual([
      { startTime: 0, endTime: 7, text: 'Translator: Joseph Geni\nReviewer: Thu-Huong Ha' },
      { startTime: 15.26, endTime: 19.606, text: "I've always had a fascination & love" },
      { startTime: 3600.5, endTime: 3601, text: 'Late cue' },
    ]);
  });

  it('handles CRLF line endings and a BOM', () => {
    const source = '\uFEFFWEBVTT\r\n\r\n00:01.000 --> 00:02.000\r\nHello\r\n';
    expect(parseWebVTT(source)).toEqual([{ startTime: 1, endTime: 2, text: 'Hello' }]);
  });

  it('skips cues with invalid timestamps', () => {
    expect(parseWebVTT('WEBVTT\n\n00:01 --> 00:02\nBroken')).toEqual([]);
  });

  it('rejects files without the WEBVTT header', () => {
    expect(() => parseWebVTT('00:01.000 --> 00:02.000\nHello')).toThrow(/WEBVTT/);
  });
});

describe('getActiveCues', () => {
  const cues = parseWebVTT(SAMPLE);

  it('returns the cues covering the current time', () => {
    expect(getActiveCues(cues, 16).map((cue) => cue.startTime)).toEqual([15.26]);
    expect(getActiveCues(cues, 10)).toEqual([]);
  });

  it('treats the end time as exclusive', () => {
    expect(getActiveCues(cues, 7)).toEqual([]);
  });

  it('handles missing cues', () => {
    expect(getActiveCues(undefined, 1)).toEqual([]);
  });
});
