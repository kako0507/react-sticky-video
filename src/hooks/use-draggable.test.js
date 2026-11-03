import { describe, expect, it } from 'vitest';
import { clampOffset, DRAG_EDGE_MARGIN, STICKY_PADDING } from './use-draggable';

const viewport = { width: 1000, height: 800 };
const layout = (position) => ({ position, width: 320, height: 180 });

describe('clampOffset', () => {
  it('keeps an offset that stays inside the viewport', () => {
    expect(clampOffset({ x: -100, y: -50 }, layout('bottom-right'), viewport))
      .toEqual({ x: -100, y: -50 });
  });

  it('stops at the edges of the viewport', () => {
    // bottom-right corner sits at left = 1000 - 20 - 320 = 660, top = 800 - 20 - 180 = 600
    expect(clampOffset({ x: -5000, y: -5000 }, layout('bottom-right'), viewport))
      .toEqual({ x: DRAG_EDGE_MARGIN - 660, y: DRAG_EDGE_MARGIN - 600 });
    expect(clampOffset({ x: 5000, y: 5000 }, layout('bottom-right'), viewport))
      .toEqual({ x: STICKY_PADDING - DRAG_EDGE_MARGIN, y: STICKY_PADDING - DRAG_EDGE_MARGIN });
  });

  it('measures from the pinned corner', () => {
    expect(clampOffset({ x: -5000, y: -5000 }, layout('top-left'), viewport))
      .toEqual({ x: DRAG_EDGE_MARGIN - STICKY_PADDING, y: DRAG_EDGE_MARGIN - STICKY_PADDING });
    expect(clampOffset({ x: 5000, y: 0 }, layout('top-left'), viewport))
      .toEqual({ x: 1000 - 320 - DRAG_EDGE_MARGIN - STICKY_PADDING, y: 0 });
  });

  it('pins to the top-left edge when the player is bigger than the viewport', () => {
    expect(clampOffset({ x: 0, y: 0 }, layout('bottom-right'), { width: 300, height: 150 }))
      .toEqual({
        x: DRAG_EDGE_MARGIN - (300 - STICKY_PADDING - 320),
        y: DRAG_EDGE_MARGIN - (150 - STICKY_PADDING - 180),
      });
  });
});
