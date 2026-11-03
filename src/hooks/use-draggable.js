import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

/** Distance (px) between the floating player and the viewport edge it is pinned to. */
export const STICKY_PADDING = 20;
/** How close (px) to the viewport edges the player may be dragged. */
export const DRAG_EDGE_MARGIN = 8;
/** Movement (px) needed before a press turns into a drag instead of a click. */
export const DRAG_THRESHOLD = 4;

const ZERO = Object.freeze({ x: 0, y: 0 });

const getViewport = () => (typeof document === 'undefined'
  ? { width: Infinity, height: Infinity }
  : {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });

// useSyncExternalStore needs a primitive snapshot, so the size is encoded as a string
const getViewportSnapshot = () => {
  const { width, height } = getViewport();
  return `${width}x${height}`;
};
const getServerViewportSnapshot = () => 'InfinityxInfinity';
const subscribeToResize = (onChange) => {
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('resize', onChange);
  };
};
const parseViewport = (snapshot) => {
  const [width, height] = snapshot.split('x').map(Number);
  return { width, height };
};

const clamp = (value, min, max) => (max < min ? min : Math.min(Math.max(value, min), max));

/**
 * Keeps a drag offset (relative to the pinned corner) inside the viewport.
 *
 * @param {{ x: number, y: number }} offset
 * @param {{ position: string, width: number, height: number }} layout
 * @param {{ width: number, height: number }} viewport
 */
export const clampOffset = (offset, { position, width, height }, viewport) => {
  const baseLeft = position.endsWith('left')
    ? STICKY_PADDING
    : viewport.width - STICKY_PADDING - width;
  const baseTop = position.startsWith('top')
    ? STICKY_PADDING
    : viewport.height - STICKY_PADDING - height;
  const left = clamp(
    baseLeft + offset.x,
    DRAG_EDGE_MARGIN,
    viewport.width - width - DRAG_EDGE_MARGIN,
  );
  const top = clamp(
    baseTop + offset.y,
    DRAG_EDGE_MARGIN,
    viewport.height - height - DRAG_EDGE_MARGIN,
  );
  return { x: left - baseLeft, y: top - baseTop };
};

/**
 * Lets the floating player be moved with a mouse, pen or finger.
 * Returns the offset to apply (as a CSS `translate`) and the handlers for the
 * drag surface. A press that turns into a drag doesn't trigger a click.
 */
export default function useDraggable({ enabled, layout }) {
  const { position, width, height } = layout;
  // the offset is relative to the pinned corner, so it's dropped when the corner changes
  const [drag, setDrag] = useState({ position, offset: ZERO });
  const [isDragging, setIsDragging] = useState(false);
  // re-renders on window resize, which keeps the player on screen
  const viewport = parseViewport(useSyncExternalStore(
    subscribeToResize,
    getViewportSnapshot,
    getServerViewportSnapshot,
  ));
  const refPointer = useRef(null);
  const refSuppressClick = useRef(false);

  const storedOffset = drag.position === position ? drag.offset : ZERO;
  const offset = enabled
    ? clampOffset(storedOffset, { position, width, height }, viewport)
    : ZERO;

  const stopTracking = useCallback(() => {
    refPointer.current?.removeListeners();
    refPointer.current = null;
  }, []);

  // stop listening if the component unmounts mid-drag
  useEffect(() => stopTracking, [stopTracking]);

  const onPointerDown = useCallback((event) => {
    refSuppressClick.current = false;
    stopTracking();
    if (!enabled || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    const { pointerId, clientX: startX, clientY: startY } = event;
    const origin = offset;
    const dragLayout = { position, width, height };
    let moved = false;

    // Track the pointer on the window: it leaves the player as soon as it moves.
    const handleMove = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          return;
        }
        moved = true;
        setIsDragging(true);
      }
      setDrag({
        position,
        offset: clampOffset(
          { x: origin.x + dx, y: origin.y + dy },
          dragLayout,
          getViewport(),
        ),
      });
    };
    const handleEnd = (endEvent) => {
      if (endEvent.pointerId !== pointerId) {
        return;
      }
      stopTracking();
      if (moved) {
        refSuppressClick.current = true;
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    refPointer.current = {
      removeListeners: () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleEnd);
        window.removeEventListener('pointercancel', handleEnd);
      },
    };
  }, [enabled, offset, position, width, height, stopTracking]);

  // a drag shouldn't also count as a click (which would toggle playback)
  const onClickCapture = useCallback((event) => {
    if (refSuppressClick.current) {
      refSuppressClick.current = false;
      event.stopPropagation();
      event.preventDefault();
    }
  }, []);

  return {
    offset,
    isDragging: enabled && isDragging,
    dragHandlers: {
      onPointerDown,
      onClickCapture,
    },
  };
}
