import { expect, test } from '@playwright/test';

test.describe('Intercom Test Suite', async () => {

    test.beforeEach('Navigate to Sysco Shop application', async ({ page }) => {
        await page.goto("https://shop.sysco.com");
    });

    test('Click on shop CA link from Login Page', async ({ page }) => {
        await page.frameLocator(`[title="Intercom live chat banner"]`).getByRole('link', { name: 'shop.sysco.ca opens in new tab' }).click();
    });

    test('Open Intercom', async ({ page }) => {
        const intercomBannerFrame = page.locator('[title="Intercom live chat banner"]');
        const shopCaPromise = page.waitForEvent('popup');
        await intercomBannerFrame.contentFrame().getByRole('link', { name: 'shop.sysco.ca' }).click();
        const shopCA = await shopCaPromise;
        await shopCA.getByRole('button', { name: 'Sounds Good!' }).click();
        await expect(shopCA).toHaveURL('http://shop.sysco.ca/auth/login');
        await shopCA.close();
        await page.frameLocator(`[title="Open Intercom Messenger"]`).locator('.intercom-launcher').click();
    });

    test('Change Language in newly opened window', async ({ page }) => {
        const intercomBannerFrame = page.locator('[title="Intercom live chat banner"]');
        const shopCaPromise = page.waitForEvent('popup');
        await intercomBannerFrame.contentFrame().getByRole('link', { name: 'shop.sysco.ca' }).click();
        const shopCA = await shopCaPromise;
        await shopCA.getByRole('button', { name: 'Sounds Good!' }).click();
        await expect(shopCA).toHaveURL('http://shop.sysco.ca/auth/login');
        await shopCA.getByRole('textbox', { name: 'Email or Username*' }).fill('gautam.jain@sysco.com');
        await expect(shopCA.getByRole('button', { name: 'Next' })).toBeEnabled();
        await shopCA.getByRole('textbox', { name: 'Email or Username*' }).clear();
        await expect(shopCA.getByRole('button', { name: 'Next' })).toBeDisabled();
        await shopCA.locator('#selectBox').selectOption('Français');
        await expect(shopCA.getByText(`Pour continuer, veuillez fournir votre courriel ou votre nom d’utilisateur.`)).toBeVisible();
        await shopCA.close();
        await page.frameLocator(`[title="Open Intercom Messenger"]`).locator('.intercom-launcher').click();
    });

    test('Open Intercom and then close it', async ({ page }) => {
        await page.frameLocator(`[title="Open Intercom Messenger"]`).locator('.intercom-launcher').click();
        await page.frameLocator(`[title="Intercom live chat"]`).getByRole('button', { name: 'Close' }).click();
    });

    test('Open Intercom and then close it using minimize icon', async ({ page }) => {
        await page.frameLocator(`[title="Open Intercom Messenger"]`).locator('.intercom-launcher').click();
        await page.frameLocator(`[title="Close Intercom Messenger"]`).getByTestId('launcher-minimize-icon').click();
    });

    test('Open Intercom and verify live chat', async ({ page }) => {
        await page.frameLocator(`[title="Open Intercom Messenger"]`).locator('.intercom-launcher').click();
        const liveChatFrame = page.frameLocator(`[title="Intercom live chat"]`);
        await liveChatFrame.getByRole('tab', {name:'Messages'}).click();
        await liveChatFrame.getByRole('button', {name: 'Ask a question'}).click();
        await liveChatFrame.getByRole('button', {name: 'Dismiss'}).click();
        await liveChatFrame.getByRole('button', {name: 'Go back, Messages'}).click();
        await liveChatFrame.getByRole('tab', {name:'Home'}).first().click();
        await liveChatFrame.getByRole('button', { name: 'Close' }).first().click();
    });

});