import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import StickyVideo from '.';

const FILE_SOURCES = [
  { src: 'trailer.mp4', type: 'video/mp4' },
  { src: 'trailer.ogg', type: 'video/ogg' },
];

const getPlayer = (container) => container.querySelector('.player');
const getPlayerContainer = (container) => container.querySelector('.player-container');

const mockOutOfViewport = () => vi
  .spyOn(Element.prototype, 'getBoundingClientRect')
  .mockReturnValue({
    top: -1000,
    left: 0,
    width: 640,
    height: 360,
  });

describe('<StickyVideo /> with a file source', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a <video> with every <source>', () => {
    const { container } = render(<StickyVideo url={FILE_SOURCES} />);
    const sources = container.querySelectorAll('video > source');
    expect([...sources].map((source) => source.getAttribute('src')))
      .toEqual(['trailer.mp4', 'trailer.ogg']);
  });

  it('uses a single file URL as the video src', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    expect(container.querySelector('video')).toHaveAttribute('src', 'trailer.mp4');
  });

  it('uses the default and custom sizes', () => {
    const { container, rerender } = render(<StickyVideo url="trailer.mp4" />);
    expect(container.firstChild).toHaveStyle({ width: '640px', height: '360px' });
    rerender(<StickyVideo url="trailer.mp4" width={800} height={450} />);
    expect(container.firstChild).toHaveStyle({ width: '800px', height: '450px' });
  });

  it('applies playerVars to the video element', () => {
    const { container } = render(
      <StickyVideo url="trailer.mp4" playerVars={{ loop: true, muted: true }} />,
    );
    const video = container.querySelector('video');
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
  });

  it('shows the native controls with originalControls', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" originalControls />);
    expect(container.querySelector('video')).toHaveAttribute('controls');
    expect(screen.queryByRole('button', { name: 'Full screen', hidden: true })).not.toBeInTheDocument();
  });

  it('toggles playback when the player is clicked', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    const video = container.querySelector('video');
    fireEvent(video, new Event('canplay'));

    fireEvent.click(getPlayerContainer(container));
    expect(video.play).toHaveBeenCalledOnce();
    expect(getPlayerContainer(container)).toHaveAttribute('aria-label', 'Pause');

    fireEvent.click(getPlayerContainer(container));
    expect(video.pause).toHaveBeenCalledOnce();
    expect(getPlayerContainer(container)).toHaveAttribute('aria-label', 'Play');
  });

  it('toggles playback with the space key', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    const video = container.querySelector('video');
    fireEvent(video, new Event('canplay'));

    fireEvent.keyDown(getPlayerContainer(container), { key: 'Enter' });
    expect(video.play).not.toHaveBeenCalled();
    fireEvent.keyDown(getPlayerContainer(container), { key: ' ' });
    expect(video.play).toHaveBeenCalledOnce();
  });

  it('floats when playing and scrolled out of the viewport', () => {
    const { container } = render(
      <StickyVideo url="trailer.mp4" stickyConfig={{ position: 'top-left', width: 480 }} />,
    );
    const video = container.querySelector('video');
    fireEvent(video, new Event('canplay'));
    fireEvent(video, new Event('play'));

    mockOutOfViewport();
    fireEvent.scroll(document);

    const player = getPlayer(container);
    expect(player).toHaveClass('sticky', 'st-top-left');
    // missing stickyConfig keys fall back to the defaults
    expect(player).toHaveStyle({ width: '480px', height: '180px' });
  });

  it('does not float while paused', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    fireEvent(container.querySelector('video'), new Event('canplay'));

    mockOutOfViewport();
    fireEvent.scroll(document);

    expect(getPlayer(container)).not.toHaveClass('sticky');
  });
});

describe('<StickyVideo /> dragging the floating player', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 });
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 });
  });

  afterEach(() => {
    delete document.documentElement.clientWidth;
    delete document.documentElement.clientHeight;
    vi.restoreAllMocks();
  });

  const renderFloating = (props) => {
    const utils = render(<StickyVideo url="trailer.mp4" {...props} />);
    const video = utils.container.querySelector('video');
    fireEvent(video, new Event('canplay'));
    fireEvent(video, new Event('play'));
    mockOutOfViewport();
    fireEvent.scroll(document);
    return { ...utils, video, surface: getPlayerContainer(utils.container) };
  };

  const drag = (element, { from, to }) => {
    fireEvent.pointerDown(element, { pointerId: 1, button: 0, pointerType: 'mouse', clientX: from[0], clientY: from[1] });
    // the pointer leaves the player as soon as it moves
    fireEvent.pointerMove(document.body, { pointerId: 1, pointerType: 'mouse', clientX: to[0], clientY: to[1] });
    fireEvent.pointerUp(document.body, { pointerId: 1, pointerType: 'mouse', clientX: to[0], clientY: to[1] });
    fireEvent.click(element);
  };

  it('moves the floating player without toggling playback', () => {
    const { container, video, surface } = renderFloating();
    expect(getPlayer(container)).toHaveClass('sticky');
    expect(surface).toHaveClass('draggable');

    drag(surface, { from: [900, 700], to: [700, 500] });

    expect(getPlayer(container).style.translate).toBe('-200px -200px');
    expect(video.pause).not.toHaveBeenCalled();
  });

  it('keeps the player inside the viewport', () => {
    const { container, surface } = renderFloating();
    drag(surface, { from: [900, 700], to: [-5000, -5000] });
    // bottom-right corner: left 660 / top 600, edge margin 8px
    expect(getPlayer(container).style.translate).toBe('-652px -592px');
  });

  it('still toggles playback on a plain click', () => {
    const { video, surface } = renderFloating();
    fireEvent.pointerDown(surface, { pointerId: 1, button: 0, pointerType: 'mouse', clientX: 900, clientY: 700 });
    fireEvent.pointerMove(surface, { pointerId: 1, pointerType: 'mouse', clientX: 901, clientY: 701 });
    fireEvent.pointerUp(surface, { pointerId: 1, pointerType: 'mouse', clientX: 901, clientY: 701 });
    fireEvent.click(surface);
    expect(video.pause).toHaveBeenCalledOnce();
  });

  it('can be turned off with stickyConfig.draggable', () => {
    const { container, video, surface } = renderFloating({ stickyConfig: { draggable: false } });
    expect(surface).not.toHaveClass('draggable');
    drag(surface, { from: [900, 700], to: [700, 500] });
    expect(getPlayer(container).style.translate).toBe('');
    // without dragging, the click goes through as usual
    expect(video.pause).toHaveBeenCalledOnce();
  });

  it('is not draggable while docked in the page', () => {
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    const surface = getPlayerContainer(container);
    expect(surface).not.toHaveClass('draggable');
    drag(surface, { from: [100, 100], to: [300, 300] });
    expect(getPlayer(container).style.translate).toBe('');
  });
});

describe('<StickyVideo /> volume slider', () => {
  const mockPointer = (coarse) => {
    vi.stubGlobal('matchMedia', vi.fn((query) => ({
      matches: coarse && query === '(pointer: coarse)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  };

  const hoverVolume = (container) => {
    fireEvent(container.querySelector('video'), new Event('canplay'));
    fireEvent.mouseOver(screen.getByRole('button', { name: 'Mute', hidden: true }));
    return screen.getByRole('slider', { name: 'Volume', hidden: true });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens on hover with a mouse', () => {
    mockPointer(false);
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    expect(hoverVolume(container)).toHaveClass('active');
  });

  it('stays hidden on touch devices', () => {
    mockPointer(true);
    const { container } = render(<StickyVideo url="trailer.mp4" />);
    expect(hoverVolume(container)).not.toHaveClass('active');
  });

  it('stays hidden in a small player', () => {
    mockPointer(false);
    const { container } = render(<StickyVideo url="trailer.mp4" width={320} height={180} />);
    expect(hoverVolume(container)).not.toHaveClass('active');
  });
});

describe('<StickyVideo /> with captions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('WEBVTT\n\n00:00.000 --> 00:05.000\nHello', {
      status: 200,
      headers: { 'Content-Type': 'text/vtt' },
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('downloads caption files and lists them in the caption menu', async () => {
    render(
      <StickyVideo
        url="trailer.mp4"
        captions={[
          { src: 'en.vtt', label: 'English', default: true },
          { src: 'zh.vtt', label: '中文' },
        ]}
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    expect(fetch).toHaveBeenCalledWith('en.vtt', expect.anything());
    // the controls stay hidden until the video has been played
    const ccButton = screen.getByRole('button', { name: 'Captions', hidden: true });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(ccButton);
    expect(screen.getByRole('menu')).toBeVisible();
    expect(screen.getByRole('menuitemradio', { name: 'English' }))
      .toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('menuitemradio', { name: '中文' }));
    expect(screen.getByRole('menuitemradio', { name: '中文' }))
      .toHaveAttribute('aria-checked', 'true');
  });

  it('renders the active cue of the selected track', async () => {
    const { container } = render(
      <StickyVideo
        url="trailer.mp4"
        captions={[{ src: 'en.vtt', label: 'English', default: true }]}
      />,
    );
    const video = container.querySelector('video');
    fireEvent(video, new Event('canplay'));
    Object.defineProperty(video, 'currentTime', { configurable: true, value: 2 });
    fireEvent(video, new Event('timeupdate'));

    expect(await screen.findByText('Hello')).toBeInTheDocument();

    Object.defineProperty(video, 'currentTime', { configurable: true, value: 6 });
    fireEvent(video, new Event('timeupdate'));
    await waitFor(() => {
      expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });
  });

  it('does not render caption UI without captions', () => {
    render(<StickyVideo url="trailer.mp4" />);
    expect(screen.queryByRole('button', { name: 'Captions', hidden: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();
  });
});

describe('<StickyVideo /> with a YouTube URL', () => {
  let players;

  beforeEach(() => {
    players = [];
    window.YT = {
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
      Player: vi.fn(function Player(target, options) {
        this.target = target;
        this.options = options;
        this.listeners = {};
        this.addEventListener = (name, listener) => {
          this.listeners[name] = listener;
        };
        this.getDuration = () => 120;
        this.getVolume = () => 50;
        this.isMuted = () => false;
        this.getCurrentTime = () => 0;
        this.playVideo = vi.fn();
        this.pauseVideo = vi.fn();
        this.cueVideoById = vi.fn();
        this.loadVideoById = vi.fn();
        this.destroy = vi.fn();
        players.push(this);
      }),
    };
  });

  afterEach(() => {
    delete window.YT;
  });

  it('creates a YouTube player for the video id', async () => {
    render(
      <StickyVideo
        url="https://www.youtube.com/watch?v=7EIkSKnCW8E"
        playerVars={{ autoplay: true, rel: 0 }}
      />,
    );

    await waitFor(() => {
      expect(players).toHaveLength(1);
    });
    expect(players[0].options).toMatchObject({
      videoId: '7EIkSKnCW8E',
      playerVars: {
        autoplay: 1,
        rel: 0,
        controls: 0,
        playsinline: 1,
      },
    });
  });

  it('controls the YouTube player once it is ready', async () => {
    const { container } = render(<StickyVideo url="https://youtu.be/Fkd9TWUtFm0" />);
    await waitFor(() => {
      expect(players).toHaveLength(1);
    });
    const [player] = players;
    act(() => {
      player.listeners.onReady();
    });

    fireEvent.click(getPlayerContainer(container));
    expect(player.playVideo).toHaveBeenCalledOnce();
  });

  it('cues another video without re-creating the player', async () => {
    const { container, rerender } = render(<StickyVideo url="https://youtu.be/Fkd9TWUtFm0" />);
    await waitFor(() => {
      expect(players).toHaveLength(1);
    });
    act(() => {
      players[0].listeners.onReady();
    });

    rerender(<StickyVideo url="https://www.youtube.com/watch?v=7EIkSKnCW8E" />);
    expect(players[0].cueVideoById).toHaveBeenCalledWith('7EIkSKnCW8E');
    expect(players).toHaveLength(1);
    expect(getPlayerContainer(container)).toBeInTheDocument();
  });

  it('destroys the player on unmount', async () => {
    const { unmount } = render(<StickyVideo url="https://youtu.be/Fkd9TWUtFm0" />);
    await waitFor(() => {
      expect(players).toHaveLength(1);
    });
    unmount();
    expect(players[0].destroy).toHaveBeenCalledOnce();
  });
});
