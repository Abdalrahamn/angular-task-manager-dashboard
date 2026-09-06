import { expect, test } from '@playwright/test';

test('creates, edits, filters, moves, and deletes a task', async ({ page, isMobile }) => {
  test.skip(isMobile, 'CRUD is covered by the desktop browser project.');
  // A unique title keeps reruns isolated even if an interrupted browser leaves a record behind.
  const createdTitle = `Playwright planning task ${Date.now()}`;
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'New Task' }).first().click();
  await page.locator('input[formcontrolname="title"]').fill(createdTitle);
  await page
    .locator('textarea[formcontrolname="description"]')
    .fill('Created by the browser smoke suite.');
  await page.getByLabel('Due Date *').fill('2099-12-31');
  await page.getByLabel('Assignee *').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create' }).click();

  const card = page.locator('app-task-card', { hasText: createdTitle });
  await expect(card).toBeVisible();

  await card.getByRole('button', { name: 'Task actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.locator('input[formcontrolname="title"]').fill(`${createdTitle} updated`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(`${createdTitle} updated`, { exact: true })).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Search tasks' });
  await search.fill('no matching task');
  await expect(page.getByText('No matching tasks')).toBeVisible();
  await search.fill('Playwright planning');
  const updatedCard = page.locator('app-task-card', { hasText: `${createdTitle} updated` });
  await expect(updatedCard).toBeVisible();

  await updatedCard.getByRole('button', { name: 'Task actions' }).click();
  await page.getByRole('menuitem', { name: 'Move to Done' }).click();
  await expect(
    page.locator('.column', { hasText: 'Done' }).getByText(`${createdTitle} updated`),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.locator('.column', { hasText: 'Done' }).getByText(`${createdTitle} updated`),
  ).toBeVisible();

  const persistedCard = page.locator('app-task-card', { hasText: `${createdTitle} updated` });
  await persistedCard.getByRole('button', { name: 'Task actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Delete task' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(`${createdTitle} updated`, { exact: true })).toHaveCount(0);
});

test('keeps navigation operable at a mobile viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'This flow is covered only by the mobile project.');
  await page.goto('/dashboard');

  const pageWidth = await page.locator('body').evaluate((body) => ({
    viewport: body.clientWidth,
    content: body.scrollWidth,
  }));
  expect(pageWidth.content).toBeLessThanOrEqual(pageWidth.viewport);
  const statusTabs = page.getByRole('group', { name: 'Task status' });
  const allTab = statusTabs.getByRole('button', { name: 'All' });
  const toDoTab = statusTabs.getByRole('button', { name: 'To Do' });
  await expect(allTab).toHaveCSS('background-color', 'rgb(25, 118, 210)');
  await expect(allTab).toHaveCSS('color', 'rgb(255, 255, 255)');
  await toDoTab.click();
  await expect(toDoTab).toHaveCSS('background-color', 'rgb(25, 118, 210)');
  await expect(toDoTab).toHaveCSS('color', 'rgb(255, 255, 255)');

  const menu = page.getByRole('button', { name: 'Open navigation' });
  await menu.click();
  const closeMenu = page.getByRole('banner').getByRole('button', { name: 'Close navigation' });
  await expect(closeMenu).toHaveAttribute('aria-expanded', 'true');
  const sidebar = page.locator('aside[aria-label="Primary"]');
  await expect(sidebar).not.toHaveAttribute('aria-hidden');
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBeGreaterThanOrEqual(0);
  await expect(page.getByRole('button', { name: 'New Task' }).first()).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  );
  await closeMenu.click();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
