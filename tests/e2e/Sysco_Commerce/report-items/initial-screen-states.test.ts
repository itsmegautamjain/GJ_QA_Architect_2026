import { test, expect } from '@playwright/test';

test.describe('Report Items Test Suite', async () => {

    test.use({ storageState: 'playwright/.auth/SyscoUser.json' });

    test.beforeEach('Login to Sysco application', async ({ page }) => {
        await page.goto('https://shop.sysco.com');
        await page.getByRole('button', { name: 'Select Customer' }).click();
        await page.getByText('Select a Site').click();
        await page.getByPlaceholder('Search sites...').fill('056');
        await page.getByRole('option', { name: '056 - Sysco Boston' }).click();
        await page.getByPlaceholder('Search accounts...').fill('149561');
        await page.getByRole('button', { name: '056-149561' }).click();
        const popUp = page.getByRole('button', { name: 'Don’t show me this again' });
        const exceptionManagementLink = page.getByRole('link', { name: 'Exception Management' });
        await expect(popUp.or(exceptionManagementLink)).toBeVisible();
        if (await popUp.isVisible()) {
            await popUp.click();
        }
        await expect(exceptionManagementLink).toBeVisible();
    });

    test('Should show modal title and subtitle when Report Items modal opens', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('heading', { name: 'Report Items - Last 14 days' })).toBeVisible();
        await expect(page.getByText('Previously reported - Last 30 days')).toBeVisible();
    });

    test('Should show empty state message when no reported items exist', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByText('Nothing reported in the last 14 days')).toBeVisible();
        await expect(page.getByText('Credit return requests created for this account in the last 14 days will appear here')).toBeVisible();
    });

    test('Should show Report New Items button when eligible Invoices exist', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
    });

    test('Should close Report Items modal when X button is clicked', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByTestId('report-items-x-close-btn').click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

});