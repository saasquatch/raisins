import { test, expect } from '@playwright/test';

// test('Canvas selection', async ({ page }) => {
//   await page.goto('/iframe.html?path=/story/canvas-controller--load-test-full');

//   const canvas = page.frameLocator('iframe[srcdoc]');

//   await canvas.getByText('English Worldwide').click();

//   const selectionHover = page.getByText('Selected English Worldwide');

//   expect(selectionHover).toBeInViewport();
// });

test('Load a page, read text', async ({ page }) => {
  await page.goto(
    '/iframe.html?path=/story/attributes-controller--my-kitchen-sink'
  );

  const selection = page.getByText('Attributes for my-ui-component');

  await expect(selection).toBeInViewport();
});
