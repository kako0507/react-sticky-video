import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StickyVideo from 'react-sticky-video';
import readmeSource from '../README.md?raw';

const DEMO_SITE_URL = 'https://kako0507.github.io/react-sticky-video/';
const ASPECT_RATIO = 9 / 16;

const DEMO_SOURCES = {
  file: [
    [
      // H.264 first: Chrome no longer plays Ogg Theora
      { src: 'trailer_480p.mov', type: 'video/mp4' },
      { src: 'trailer_400p.ogg', type: 'video/ogg' },
    ],
  ],
  youtube: [
    'https://www.youtube.com/watch?v=7EIkSKnCW8E',
    'https://www.youtube.com/watch?v=TmubVRCj8Ug',
    'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  ],
};

const CAPTIONS_DEMO = {
  url: 'https://youtu.be/Fkd9TWUtFm0',
  captions: [
    { src: 'ted-en.vtt', label: 'English', default: true },
    { src: 'ted-zh-TW.vtt', label: '中文' },
  ],
};

const STICKY_CONFIG_DEMO = {
  width: 480,
  height: 270,
  position: 'top-left',
};

/** Tracks the content width of an element. */
const useElementWidth = (ref) => {
  const [width, setWidth] = useState();
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return width;
};

// The hero already shows the title and description, so start from the first section.
const readme = readmeSource.slice(readmeSource.indexOf('\n## '));

const getText = (node) => (node.type === 'text'
  ? node.value
  : (node.children ?? []).map(getText).join(''));

// GitHub-style heading anchors, so README links like `#video-sources` work here too.
const slugify = (text) => text
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, '')
  .replace(/\s/g, '-');

const createHeading = (Tag) => {
  const Heading = ({ node, children, ...props }) => (
    <Tag id={slugify(getText(node))} {...props}>{children}</Tag>
  );
  Heading.displayName = `Heading(${Tag})`;
  return Heading;
};

const isDemoHash = (hash) => hash.includes('=');

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

/**
 * Reads the demo options from the URL hash, e.g. `#service=youtube` or `#video=captions`.
 */
const parseDemoHash = (hash) => {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const service = params.get('service');
  const sources = DEMO_SOURCES[service] ?? Object.values(DEMO_SOURCES).flat();
  return {
    demo: params.get('video') ?? 'simple',
    url: pickRandom(sources),
  };
};

// README links point at the published demo site; keep them in-page here.
const MarkdownLink = ({ href = '', children, node: _node, ...props }) => {
  if (href.startsWith(DEMO_SITE_URL)) {
    return <a href={href.slice(DEMO_SITE_URL.length) || '#'} {...props}>{children}</a>;
  }
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
};

const MarkdownTable = ({ node: _node, ...props }) => (
  <div className="table-container">
    <table className="table is-fullwidth is-striped" {...props} />
  </div>
);

const markdownComponents = {
  a: MarkdownLink,
  h2: createHeading('h2'),
  h3: createHeading('h3'),
  table: MarkdownTable,
};

const DemoVideo = ({ demo, url, width }) => {
  const size = { width, height: Math.round(width * ASPECT_RATIO) };
  switch (demo) {
    case 'stickyConfig':
      return <StickyVideo {...size} url={url} stickyConfig={STICKY_CONFIG_DEMO} />;
    case 'captions':
      return <StickyVideo {...size} {...CAPTIONS_DEMO} />;
    default:
      return <StickyVideo {...size} url={url} />;
  }
};

const App = () => {
  const [demoOptions, setDemoOptions] = useState(() => parseDemoHash(window.location.hash));
  const refVideoContainer = useRef(null);
  const width = useElementWidth(refVideoContainer);

  const handleHashChange = useCallback(() => {
    // plain anchors (e.g. `#video-sources`) are handled by the browser
    if (!isDemoHash(window.location.hash)) {
      return;
    }
    setDemoOptions(parseDemoHash(window.location.hash));
    refVideoContainer.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);

  return (
    <>
      <section className="hero is-medium is-primary is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title is-1">React Sticky Video</h1>
            <p className="subtitle">
              A React component for creating sticky, floating videos with ease.
            </p>
            <p className="hero-links">
              <a href="https://github.com/kako0507/react-sticky-video">GitHub</a>
              <a href="https://www.npmjs.com/package/react-sticky-video">npm</a>
            </p>
          </div>
        </div>
      </section>
      <main className="section">
        <div className="container is-max-desktop content">
          <h2>Demo</h2>
          <p>Play the video, then scroll down — it will keep playing in a corner.</p>
        </div>
        <div
          ref={refVideoContainer}
          className="container is-max-desktop video-container"
          data-testid="demo-video"
        >
          {width
            ? (
              <DemoVideo
                // remount the player for each demo so its state starts fresh
                key={`${demoOptions.demo}:${JSON.stringify(demoOptions.url)}`}
                demo={demoOptions.demo}
                url={demoOptions.url}
                width={width}
              />
            )
            : <div className="video-placeholder" />}
        </div>
        <br />
        <article className="container is-max-desktop content">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {readme}
          </Markdown>
        </article>
      </main>
    </>
  );
};

export default App;
