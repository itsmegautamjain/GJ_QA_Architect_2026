import { test, expect } from '@playwright/test';

test.describe('Product Catalog Verification Suite - Equipment & Supplies', async () => {

    test.beforeEach('Open the Equipment & Supplies Catalog URL', async ({ page }) => {
        await page.goto('https://shop.sysco.com/app/catalog?BUSINESS_CENTER_ID=syy_cust_tax_equipmentsupplies');
        await page.getByRole('button', { name: 'Continue as Guest' }).click();
        const zipCodeBox = page.getByRole('textbox', { name: 'Delivery Zip Code*' });
        await expect(zipCodeBox).toBeEditable();
        await zipCodeBox.fill('40222');
        await page.getByRole('button', { name: 'Start Shopping' }).click();
        await expect(page).toHaveTitle('Sysco Shop | Catalog');
    });

    test('Verify the total Product count displayed before and after filters are applied', async ({ page }) => {
        const searchResultText = await page.locator('.search-items-results-count').textContent();
        console.log('Total Product count displayed before filter is applied ->' + searchResultText?.match(/\d+/g)?.[2]);
        await page.getByText('Storage Type', { exact: true }).scrollIntoViewIfNeeded();
        await page.getByText('Storage Type', { exact: true }).click();
        await page.locator('.toggle', { hasText: 'Dry' }).locator('input[type="radio"]').check({ force: true });
        await expect(page.locator('.toggle', { hasText: 'Dry' }).locator('input[type="radio"]')).toBeChecked();
        const searchResultTextAfterFilter = await page.locator('.search-items-results-count').textContent();
        console.log('Total Product count displayed before filter is applied ->' + searchResultTextAfterFilter?.match(/\d+/g)?.[2]);
    });

    test('Verify the total Product count after category filters are applied', async ({ page }) => {
        const searchResultText = await page.locator('.search-items-results-count').textContent();
        console.log('Total Product count displayed before filter is applied ->' + searchResultText?.match(/\d+/g)?.[2]);
        await page.getByText('Storage Type', { exact: true }).scrollIntoViewIfNeeded();
        await page.getByText('Storage Type', { exact: true }).click();
        await page.locator('.toggle', { hasText: 'Dry' }).locator('input[type="radio"]').check({ force: true });
        await expect(page.locator('.toggle', { hasText: 'Dry' }).locator('input[type="radio"]')).toBeChecked();
        const searchResultTextAfterFilter = await page.locator('.search-items-results-count').textContent();
        console.log('Total Product count displayed before filter is applied ->' + searchResultTextAfterFilter?.match(/\d+/g)?.[2]);
        await page.locator('button[value="syy_cust_tax_dispensers"]').click();
        const  productCountAfterCategoryFilter = await page.locator('button[value="syy_cust_tax_dispensers"]').textContent();
        await expect(page.locator('.catalog-cards-wrapper').locator('.product-card-container')).toHaveCount(parseInt(productCountAfterCategoryFilter?.match(/\d+/g)?.[0] ?? '0',10));
    });

})