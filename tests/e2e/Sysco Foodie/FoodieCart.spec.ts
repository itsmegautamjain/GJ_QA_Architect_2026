import { test, expect } from '@playwright/test';

test.describe('Recipe Page Suite - Filters Validation', async () => {

    test.beforeEach('Open the Sysco Foodie URL', async ({ page }) => {
        const text = `Professional Chef Recipes & Dishes`;
        await page.goto('https://foodie.sysco.com/recipes/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Sounds, Good!' }).click();
        await expect(page.getByRole('heading', { name: `${text}` })).toBeVisible();
    });

    test('Verify and Navigate to Recipe Page', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await expect(page.locator('section', { has: page.getByRole('button', { name: 'Add to Basket' }) }).getByText('Ingredients')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeDisabled();
    });

    test('Add Products to Cart from Recipe Page', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await page.getByRole('checkbox', { name: `¾ oz. Juice Lime Lightly Pasteurized` }).check();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeEnabled();
        await page.getByRole('checkbox', { name: `½ oz. Juice Cranberry Cocktail` }).check();
        await page.getByRole('checkbox', { name: `4 oz. Drink Ginger Beer` }).check();
        await page.getByRole('button', { name: 'Add to Basket' }).click();
    });

    test('Verify the number of products added to cart', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await page.getByRole('checkbox', { name: `¾ oz. Juice Lime Lightly Pasteurized` }).check();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeEnabled();
        await page.getByRole('checkbox', { name: `½ oz. Juice Cranberry Cocktail` }).check();
        await page.getByRole('checkbox', { name: `4 oz. Drink Ginger Beer` }).check();
        await page.getByRole('button', { name: 'Add to Basket' }).click();
        const totalCheckboxes = page.locator('.pacecore-recipe-ingredients-ingredient').getByRole('checkbox');
        console.log('Total number of checkboxes are: -' + await totalCheckboxes.count());
        await expect(totalCheckboxes.first()).toBeChecked();
        let count = 0;
        for (const checkbox of await totalCheckboxes.all()) {
            if (await checkbox.isChecked()) {
                count++;
            }
        }
        console.log('Total number of checkboxes checked are: -' + count);
        const cartIconText = await page.getByRole('link', { name: 'My Basket' }).locator('.js-product-count').last().textContent();
        expect(count).toBe(parseInt(cartIconText ?? '0'));
    })

    test('Verify the Products count on cart flyer', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await page.getByRole('checkbox', { name: `¾ oz. Juice Lime Lightly Pasteurized` }).check();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeEnabled();
        await page.getByRole('checkbox', { name: `½ oz. Juice Cranberry Cocktail` }).check();
        await page.getByRole('checkbox', { name: `4 oz. Drink Ginger Beer` }).check();
        await page.getByRole('button', { name: 'Add to Basket' }).click();
        await page.getByRole('link', { name: 'My Basket' }).last().click();
        await expect(page.getByRole('link', { name: 'Review Shopping List' })).toBeVisible();
        const productCount = await page.locator('.cart-off-canvas-inner').locator('.js-product-count').textContent();
        console.log('Total Products count from header is ->' + productCount);
        expect(page.locator('.js-product-container').locator('img')).toHaveCount(parseInt(productCount ?? '0'));
    })

    test('Verify the navigation to Sysco Shop', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await page.getByRole('checkbox', { name: `¾ oz. Juice Lime Lightly Pasteurized` }).check();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeEnabled();
        await page.getByRole('checkbox', { name: `½ oz. Juice Cranberry Cocktail` }).check();
        await page.getByRole('checkbox', { name: `4 oz. Drink Ginger Beer` }).check();
        await page.getByRole('button', { name: 'Add to Basket' }).click();
        await page.getByRole('link', { name: 'My Basket' }).last().click();
        await expect(page.getByRole('link', { name: 'Review Shopping List' })).toBeVisible();
        const shopPagePromise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'Proceed to Sysco Shop' }).click();
        const shopPage = await shopPagePromise;
        await shopPage.waitForLoadState();
        await expect(shopPage).toHaveTitle('Sysco Shop | Login');
        await shopPage.close();
        await expect(page.getByRole('link', { name: 'Review Shopping List' })).toBeVisible();
    })

    test('Verify the products count on Sysco Shop after navigation', async ({ page }) => {
        await page.getByRole('button', { name: 'Meal' }).click();
        await expect(page.getByRole('link', { name: `Apply Filters` })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Beverage' }).click({ force: true });
        await page.getByRole('link', { name: `Apply Filters` }).click();
        await expect(page.getByRole('link', { name: 'Beverage' })).toBeVisible();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).scrollIntoViewIfNeeded();
        await page.getByRole('heading', { name: 'Holiday Mule Mocktail' }).click();
        await page.getByRole('checkbox', { name: `¾ oz. Juice Lime Lightly Pasteurized` }).check();
        await expect(page.getByRole('button', { name: 'Add to Basket' })).toBeEnabled();
        await page.getByRole('checkbox', { name: `½ oz. Juice Cranberry Cocktail` }).check();
        await page.getByRole('checkbox', { name: `4 oz. Drink Ginger Beer` }).check();
        await page.getByRole('button', { name: 'Add to Basket' }).click();
        await page.getByRole('link', { name: 'My Basket' }).last().click();
        await expect(page.getByRole('link', { name: 'Review Shopping List' })).toBeVisible();
        const shopPagePromise = page.waitForEvent('popup');
        await page.getByRole('link', { name: 'Proceed to Sysco Shop' }).click();
        const shopPage = await shopPagePromise;
        await shopPage.waitForLoadState();
        await expect(shopPage).toHaveTitle('Sysco Shop | Login');
        await shopPage.getByRole('button', {name: 'Continue as Guest'}).click();
        await shopPage.getByRole('textbox', {name:'Delivery Zip Code*'}).fill('40222');
        await shopPage.getByRole('button', {name: 'Start Shopping'}).click();
        await expect(shopPage.getByText('Results for ')).toBeVisible();
        const searchResultText = await shopPage.locator('.search-items-results-count').textContent();
        const productCountFromText = parseInt(searchResultText?.match(/\d+/g)?.[2] ?? '0',10);
        await expect(shopPage.locator('.catalog-cards-wrapper').locator('.product-card-link')).toHaveCount(productCountFromText);
        await shopPage.close();
        await expect(page.getByRole('link', { name: 'Review Shopping List' })).toBeVisible();
    })

});