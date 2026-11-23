import { test, expect } from '@playwright/test';

test.describe('Report Items - Modal behavior Test Suite', async () => {

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

    test('Should open modal when Report Items button is clicked', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByTestId('report-items-x-close-btn').click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

    test('Should close modal when clicking outside overlay', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        // Clicks near the top-left corner of the overlay instead of the center
        await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 10, y: 10 } });
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

    test('Should close modal when pressing Escape key', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

    test('Should reset modal state when closed and reopened', async ({ page }) => {
        await page.getByRole('link', { name: 'My Orders' }).click();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await page.getByRole('button', { name: 'Report New Items' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).toBeVisible();
        await page.getByRole('button', { name: 'Close modal' }).click();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).not.toBeVisible();
        await page.getByRole('button', { name: 'Report Items' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Report Items' }).click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'SPICE CINNAMON STICK' })).not.toBeVisible();
        await page.getByTestId('report-items-x-close-btn').click();
        await expect(page.getByRole('button', { name: 'Report New Items' })).not.toBeVisible();
    });

});