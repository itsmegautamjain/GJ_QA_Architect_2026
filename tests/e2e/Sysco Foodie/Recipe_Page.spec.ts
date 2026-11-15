import { test, expect } from '@playwright/test';

test.describe('Recipe Page Suite - Filters Validation', async () => {

    test.beforeEach('Open the Sysco Foodie URL', async ({ page }) => {
        const text = `Professional Chef Recipes & Dishes`;
        await page.goto('https://foodie.sysco.com/recipes/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Sounds, Good!' }).click();
        await expect(page.getByRole('heading', { name: `${text}` })).toBeVisible();
    });

    test('Verify the filters Menu count - Meal', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        const filterMenuMeal = page.locator('li', { has: page.getByRole('button', { name: 'Meal' }) });
        await expect(filterMenuMeal.locator('.justify-content-center').getByRole('listitem')).toHaveCount(13);
    });

    test('Apply Filter - Beverage', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
    });

    test('Verify filters are applied correctly - count verification', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        const filteredCount = await page.locator('.filter-controls-title').textContent();
        console.log('Filtered Text is: -' + filteredCount);
        const actualRecordsCount = page.locator('.all-filter-results').getByRole('link');
        await expect(actualRecordsCount).toHaveCount(parseInt(filteredCount?.match(/\d+/)?.[0] ?? '0'));
    });

    test('Count Number of recipes from Sysco Culinery team', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        const allRecipeText = await page.locator('.all-filter-results').getByRole('link').locator('.recipe-attr').all();
        let recipeName = [];
        for(const recipeText of allRecipeText){
           const text = await recipeText.textContent();
           if(text?.includes('Sysco Culinary Team')){
                recipeName.push(await recipeText.locator('..').getByRole('heading').textContent());
           }
        }
        console.log('Total number of Sysco Culinery Recipes are: -'+recipeName.length);
        for(const name of recipeName){
            console.log(name);
        }
    });

});

// iframe -> Intercom