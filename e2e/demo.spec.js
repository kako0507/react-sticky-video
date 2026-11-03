import { expect, test } from '@playwright/test';

const floatingPlayer = (page) => page.getByRole('region', { name: 'Video player' });
// the clickable video surface (the control bar has its own Play / Pause buttons)
const player = (page) => floatingPlayer(page).getByRole('button', { name: /^(Play|Pause)$/ }).first();
const video = (page) => floatingPlayer(page).locator('video');

const getPosition = (locator) => locator.evaluate((element) => {
  const { position, top, left, right, bottom } = getComputedStyle(element);
  const { width, height } = element.getBoundingClientRect();
  return {
    position,
    top,
    left,
    right,
    bottom,
    width,
    height,
  };
});

// the clickable surface is only shown once the media reports it can play
const waitForVideoReady = async (page) => {
  await expect(player(page)).toBeVisible({ timeout: 20_000 });
};

const scrollTo = (page, y) => page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);

const playAndScrollAway = async (page) => {
  await waitForVideoReady(page);
  await player(page).click();
  await expect.poll(() => video(page).evaluate((element) => element.paused)).toBe(false);
  await scrollTo(page, 2500);
};

test.describe('demo page', () => {
  test('renders the hero and the README', async ({ page }) => {
    await page.goto('./#service=file');
    await expect(page).toHaveTitle('React Sticky Video');
    await expect(page.getByRole('heading', { level: 1, name: 'React Sticky Video' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    // Dailymotion is no longer supported
    await expect(page.locator('iframe[src*="dailymotion"], a[href*="dailymotion.com/video"]')).toHaveCount(0);
  });

  test('README demo links switch the demo in place', async ({ page }) => {
    await page.goto('./#service=file');
    await page.getByRole('link', { name: '▶ Try the demo' }).nth(2).click();
    await expect(page).toHaveURL(/#video=stickyConfig$/);
    await expect(page.getByTestId('demo-video')).toBeInViewport();
  });

  test('README anchors scroll to the heading', async ({ page }) => {
    await page.goto('./#service=file');
    await page.getByRole('link', { name: 'Video sources' }).first().click();
    await expect(page.getByRole('heading', { name: 'Video sources' })).toBeInViewport();
  });
});

const expectToFillPlayer = async (page, media) => {
  const playerBox = await floatingPlayer(page).boundingBox();
  const mediaBox = await media.boundingBox();
  expect(mediaBox.width).toBeCloseTo(playerBox.width, 0);
  expect(mediaBox.height).toBeCloseTo(playerBox.height, 0);
};

test.describe('file source', () => {
  test('the video fills the player', async ({ page }) => {
    await page.goto('./#service=file');
    await waitForVideoReady(page);
    await expectToFillPlayer(page, video(page));
  });

  test('plays and floats to the bottom-right corner when scrolled away', async ({ page }) => {
    await page.goto('./#service=file');
    await playAndScrollAway(page);

    await expect.poll(async () => (await getPosition(floatingPlayer(page))).position).toBe('fixed');
    const position = await getPosition(floatingPlayer(page));
    expect(position).toMatchObject({ right: '20px', bottom: '20px', width: 320, height: 180 });

    // scrolling back docks the player again
    await scrollTo(page, 0);
    await expect.poll(async () => (await getPosition(floatingPlayer(page))).position).not.toBe('fixed');
  });

  test('does not float while paused', async ({ page }) => {
    await page.goto('./#service=file');
    await waitForVideoReady(page);
    await scrollTo(page, 2500);
    await page.waitForTimeout(300);
    expect((await getPosition(floatingPlayer(page))).position).not.toBe('fixed');
  });

  test('respects stickyConfig', async ({ page }) => {
    await page.goto('./#video=stickyConfig&service=file');
    await playAndScrollAway(page);

    await expect.poll(async () => (await getPosition(floatingPlayer(page))).position).toBe('fixed');
    expect(await getPosition(floatingPlayer(page)))
      .toMatchObject({ top: '20px', left: '20px', width: 480, height: 270 });
  });

  test('pauses from the control bar', async ({ page }) => {
    await page.goto('./#service=file');
    await waitForVideoReady(page);
    await player(page).click();
    await expect.poll(() => video(page).evaluate((element) => element.paused)).toBe(false);

    await player(page).hover();
    await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
    await expect.poll(() => video(page).evaluate((element) => element.paused)).toBe(true);
  });
});

test.describe('YouTube', () => {
  test('embeds the YouTube player and fills the player', async ({ page }) => {
    await page.goto('./#service=youtube');
    const iframe = floatingPlayer(page).locator('iframe[src*="youtube.com/embed/"]');
    // the player stays hidden until the YouTube API reports it is ready
    await expect(iframe).toBeVisible({ timeout: 15_000 });
    await expectToFillPlayer(page, iframe);
  });

  test('captions demo shows the caption picker', async ({ page }) => {
    await page.goto('./#video=captions');
    const iframe = page.getByTestId('demo-video').locator('iframe[src*="youtube.com/embed/Fkd9TWUtFm0"]');
    await expect(iframe).toBeAttached({ timeout: 15_000 });
    await expect(floatingPlayer(page).getByRole('button', { name: 'Captions', includeHidden: true }))
      .toBeAttached();
  });
});
