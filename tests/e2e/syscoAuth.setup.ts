import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/SyscoUser.json';

setup('Authenticate Sysco application', async ({ page }) => {
    await page.goto('https://shop.sysco.com');
    await page.getByRole('textbox',{ name:'Email or Username*'}).fill('cxweb026.SyscoLabtestid@sysco.com');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Email, phone, or Skype').fill('cxweb026.SyscoLabtestid@sysco.com');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByPlaceholder('Password').fill('L1xo6m7ZybVSnQ');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Everything you need to keep your kitchen moving.'})).toBeVisible();
    await page.context().storageState({ path: authFile });
});