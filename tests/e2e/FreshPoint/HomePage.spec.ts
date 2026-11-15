import { test, expect } from '@playwright/test';

const categoryAvailabilityText = 'Choose a Category to See the Products and their Availability';

test.describe('Home Page Suite - FreshPoint', async () => {

    test.beforeEach('Open the FreshPoint URL', async ({ page }) => {
        await page.goto('https://www.freshpoint.com/');
        await page.getByRole('button', { name: 'Sounds, Good!' }).click();
    });

    test('verify the category availability text on Home Page', async ({ page }) => {
        const catAvaText = page.getByRole('heading', { name: `${categoryAvailabilityText}` });
        await catAvaText.scrollIntoViewIfNeeded();
        await expect(catAvaText).toBeVisible();
    });

    test('Verify the number of categories available on Home Page', async ({ page }) => {
        await expect(page.locator('.item.unit')).toHaveCount(4);
    });

    test('Verify the Category names', async ({ page }) => {
        const catAvaText = page.getByRole('heading', { name: `${categoryAvailabilityText}` });
        await catAvaText.scrollIntoViewIfNeeded();
        await expect(catAvaText).toBeVisible();
        const allCategoryLinks = await page.locator('#featuredGuides').locator('a').all();
        for (const [index, categoryLink] of allCategoryLinks.entries()) {
            console.log('Category Number is ' + (index + 1) + ' Category Name is: ', await categoryLink.textContent());
            expect(await categoryLink.getAttribute('href')).toContain('freshpoint');
        }
    });

    test('Verify Each Product Category Text', async ({ page }) => {
        const catAvaText = page.getByRole('heading', { name: `${categoryAvailabilityText}` });
        await catAvaText.scrollIntoViewIfNeeded();
        await expect(catAvaText).toBeVisible();
        const totalCategories = await page.locator('.item.unit').all();
        const totalLinks = await page.locator('#featuredGuides').locator('a').all();
        for (const [index, cat] of totalCategories.entries()) {
            const styleAttr = await cat.locator('.inner').getAttribute('style')
            if (styleAttr?.includes('orange')) {
                expect(await totalLinks[index].textContent()).toBe('Fruit');
            }
            if (styleAttr?.includes('lettuce')) {
                expect(await totalLinks[index].textContent()).toBe('Vegetables');
            }
            if (styleAttr?.includes('baby-veg')) {
                expect(await totalLinks[index].textContent()).toBe('Herbs');
            }
            if (styleAttr?.includes('peppers')) {
                expect(await totalLinks[index].textContent()).toBe('Specialty');
            }
        }
    })

});