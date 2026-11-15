import { expect, test } from '@playwright/test';

test.describe('Humana Insurance Plans - Test Suite', async () => {

    test.beforeEach('Navigate to Humana application', async ({ page }) => {
        await page.goto("https://www.humana.com");
    });

    test('Navigate to Medicare Plans', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
    });

    test('Enter Zip Code', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
        await page.getByTestId('zipcode-input-box').first().fill('40222');
        page.getByRole('button', { name: 'Explore Medicare plans', exact: true }).click();
        await expect(page).toHaveURL('https://plans.humana.com/plans');
    });

    test('Edit Zip Code', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
        await page.getByTestId('zipcode-input-box').first().fill('40222');
        page.getByRole('button', { name: 'Explore Medicare plans', exact: true }).click();
        await page.waitForLoadState();
        await expect(page).toHaveURL('https://plans.humana.com/plans');
        await page.getByRole('link', { name: 'Back to top' }).scrollIntoViewIfNeeded();
        await page.getByRole('link', { name: 'Back to top' }).click();
        await page.locator('.zip-item').getByRole('button').click();
        await expect(page.getByRole('heading', { name: 'Edit your ZIP code' })).toBeVisible();
        await page.locator('.input-container').locator('input').clear();
        await page.locator('.input-container').locator('input').fill('40223');
        await page.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByRole('button', { name: ' Cancel ' })).not.toBeVisible();
        const newZipCode = await page.locator('.zip-item').getByRole('button').textContent();
        console.log('New Zip Code is: ->' + newZipCode);
        expect(newZipCode).toContain('40223');
        const plansCountText = await page.locator('.title-and-sort-container').locator('p').textContent();
        console.log('Number of Plans Showing ' + plansCountText);
    });

    test('Verify number of Plans mentioned in result text', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
        await page.getByTestId('zipcode-input-box').first().fill('40222');
        page.getByRole('button', { name: 'Explore Medicare plans', exact: true }).click();
        await page.waitForLoadState();
        await expect(page).toHaveURL('https://plans.humana.com/plans');
        await page.getByRole('link', { name: 'Back to top' }).scrollIntoViewIfNeeded();
        await page.getByRole('link', { name: 'Back to top' }).click();
        const plansCountText = await page.locator('.title-and-sort-container-mfe').locator('p').textContent();
        console.log('Number of Plans Showing ' + plansCountText);
    });

    test('Apply Filter and verify records- Monthly Premium', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
        await page.getByTestId('zipcode-input-box').first().fill('40222');
        page.getByRole('button', { name: 'Explore Medicare plans', exact: true }).click();
        await page.waitForLoadState();
        await expect(page).toHaveURL('https://plans.humana.com/plans');
        await page.getByRole('link', { name: 'Back to top' }).scrollIntoViewIfNeeded();
        await page.getByRole('link', { name: 'Back to top' }).click();
         await page.locator('.horizontal-filter-label',{hasText:'Monthly premium'}).scrollIntoViewIfNeeded();
        await page.locator('.horizontal-filter-label',{hasText:'Monthly premium'}).click();
        await page.locator('#oneDollarMonthlyPremium').click({force:true});
        await page.getByRole('button', { name: 'Apply' }).click();
        const plansCountTextAfterFilter = await page.locator('.title-and-sort-container-mfe').locator('p').textContent();
        console.log('Number of Plans Showing ' + plansCountTextAfterFilter);
        await expect(page.getByRole('button', { name: 'Enroll' })).toHaveCount(parseInt(plansCountTextAfterFilter?.match(/\d+/g)?.[0] ?? '0', 10));
    });

    test('Verify total number of plans available on the page', async ({ page }) => {
        await page.getByRole('button', { name: 'Insurance Plans', exact: true }).click();
        await page.getByRole('button', { name: /^Medicare Coverage for those/ }).click();
        await page.getByRole('link', { name: 'Shop Medicare', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Explore Medicare plans', exact: true })).toBeVisible();
        await page.getByTestId('zipcode-input-box').first().fill('40222');
        page.getByRole('button', { name: 'Explore Medicare plans', exact: true }).click();
        await page.waitForLoadState();
        await expect(page).toHaveURL('https://plans.humana.com/plans');
        await page.getByRole('link', { name: 'Back to top' }).scrollIntoViewIfNeeded();
        await page.getByRole('link', { name: 'Back to top' }).click();
        const totalPlansCountText = await page.locator('.top-bar1').getByRole('tablist').getByRole('tab').last().textContent();
        console.log('Total number of plans->'+totalPlansCountText);
    });
});