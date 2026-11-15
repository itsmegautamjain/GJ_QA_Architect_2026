import { expect, test } from '@playwright/test';

test.describe('Europeon Imports - Texas Division - Test Suite', async () => {

    test('Handle Dialog and select Division', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
    });

    test('Fetch all the categories from Home Page', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        const allCategories = await page.locator('#homeCategoryCardRow').allTextContents();
        console.log('Following categories are available on Home Page' + allCategories);
    });

    test('Groom the fetched categories names', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        const allCategories = await page.locator('#homeCategoryCardRow').getByRole('heading').allTextContents();
        console.log('Following categories are available on Home Page');
        console.log('Total Number of Categories fetched->' + allCategories.length);
        for (const [index, category] of allCategories.entries()) {
            console.log('Category Index is -> ' + index);
            console.log('Category Name is -> ' + category.trim());
        }
    });

    test('Sort the fetched categories names', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        const allCategories = await page.locator('#homeCategoryCardRow').getByRole('heading').allTextContents();
        console.log('Following categories are available on Home Page');
        console.log('Total Number of Categories fetched->' + allCategories.length);
        for (const [index, category] of allCategories.entries()) {
            console.log('Category Index is -> ' + index);
            console.log('Category Name is -> ' + category.trim());
        }
        console.log("Sorted Category Names are -> " + allCategories.sort());
    });

    test('Fetch and Sort the Product IDs', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('.newest-arrivals-card-title').getByRole('link').first().scrollIntoViewIfNeeded();
        const featuredProducts = await page.locator('.newest-arrivals-card-title').getByRole('link').allTextContents();
        console.log('Featured Product details are: ->' + featuredProducts);
        console.log('Total Featured Products count is: ->' + featuredProducts.length);
        const featuredProductIDs = [];
        for (const product of featuredProducts) {
            featuredProductIDs.push(parseInt(product.match(/\d+/g)?.[0] ?? '0', 10));
        }
        console.log('Featured Product IDs are: ->' + featuredProductIDs);
        console.log('Featured Product IDs after reverse sorting are: ->' + featuredProductIDs.sort((a, b) => b - a));
    });

    test('Fetch Products IDs containing water from all the fetched Product IDs', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('.newest-arrivals-card-title').getByRole('link').first().scrollIntoViewIfNeeded();
        const featuredProducts = await page.locator('.newest-arrivals-card-title').getByRole('link').allTextContents();
        console.log('Featured Product details are: ->' + featuredProducts);
        console.log('Total Featured Products count is: ->' + featuredProducts.length);
        const waterBasedProducts = featuredProducts.filter(product => product.includes('Water'));
        console.log('Products which contain Water are: ->' + waterBasedProducts);
        const waterBasedProductIDs = [];
        for (const product of waterBasedProducts) {
            waterBasedProductIDs.push(product.match(/\d+/g)?.[0]);
        }
        console.log('Product IDs for water based products are: ->' + waterBasedProductIDs);
    });

    test('Fetch the maximum ID from all the fetched Product IDs', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('.newest-arrivals-card-title').getByRole('link').first().scrollIntoViewIfNeeded();
        const featuredProducts = await page.locator('.newest-arrivals-card-title').getByRole('link').allTextContents();
        console.log('Featured Product details are: ->' + featuredProducts);
        console.log('Total Featured Products count is: ->' + featuredProducts.length);
        const featuredProductsIDs = [];
        for (const product of featuredProducts) {
            featuredProductsIDs.push(parseInt(product.match(/\d+/g)?.[0] ?? '0', 10));
        }
        console.log('Product IDs are: ->' + featuredProductsIDs);
        const maxProductId = featuredProductsIDs.reduce((acc, curr) => {
            if (curr > acc) {
                acc = curr;
            }
            return acc;
        }, 0)
        console.log("Maximum Number among Product IDs is: ->" + maxProductId);
    });

    test('Fetch the minimum ID from all the fetched Product IDs', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('.newest-arrivals-card-title').getByRole('link').first().scrollIntoViewIfNeeded();
        const featuredProducts = await page.locator('.newest-arrivals-card-title').getByRole('link').allTextContents();
        console.log('Featured Product details are: ->' + featuredProducts);
        console.log('Total Featured Products count is: ->' + featuredProducts.length);
        const featuredProductsIDs = [];
        for (const product of featuredProducts) {
            featuredProductsIDs.push(parseInt(product.match(/\d+/g)?.[0] ?? '0', 10));
        }
        console.log('Product IDs are: ->' + featuredProductsIDs);
        const minProductId = featuredProductsIDs.reduce((acc, curr) => Math.min(acc, curr));
        console.log("Minimum Number among Product IDs is: ->" + minProductId);
    });

    test('Calculate the volume of each water based Product', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('.newest-arrivals-card-title').getByRole('link').first().scrollIntoViewIfNeeded();
        const featuredProducts = await page.locator('.newest-arrivals-card-title').getByRole('link').allTextContents();
        console.log('Featured Product details are: ->' + featuredProducts);
        console.log('Total Featured Products count is: ->' + featuredProducts.length);
        const waterBasedProducts = featuredProducts.filter(product => product.includes('Water'));
        console.log('Products which contain Water are: ->' + waterBasedProducts);
        const waterBasedProductIDs = [];
        for (const product of waterBasedProducts) {
            waterBasedProductIDs.push(product.match(/\d+/g)?.[0]);
        }
        console.log('Product IDs for water based products are: ->' + waterBasedProductIDs);
        const waterBasedProductsVolume = waterBasedProducts.map(product => {
            return parseFloat(product.split(/Sparkling Water/)[1].trim().split("/")[1].match(/\d+/g)?.[0] ?? '0') * 29.5735;
        })
        console.log('Fetched Volumes of Water based Products are: ->' + waterBasedProductsVolume.map(product => product + " ml"));
    });

    test('Add Products to Cart', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('#homeCategoryCardRow').getByRole('link', { name: 'Specialty' }).click();
        await page.getByRole('button', { name: 'Add one to cart' }).first().click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(1).click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(2).click();
        await page.locator('.cart-button').first().click();
        await page.getByRole('link', { name: 'View Cart' }).click();
        await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    });

    test('Add Products to Cart and match the SKUs', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('#homeCategoryCardRow').getByRole('link', { name: 'Specialty' }).click();
        await page.getByRole('button', { name: 'Add one to cart' }).first().click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(1).click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(2).click();
        await page.locator('.cart-button').first().click();
        await page.getByRole('link', { name: 'View Cart' }).click();
        await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
        const tableRows = await page.locator('#guest-cart-tbody').getByRole('row').all();
        const rowProductTexts = [];
        let productSkus = [];
        for (const row of tableRows) {
            rowProductTexts.push(await row.locator('td').first().textContent());
            productSkus.push(await row.locator('td').nth(1).textContent());
        }
        console.log('All Added Product Details are: ->' + rowProductTexts);
        productSkus = productSkus.map(productSku => productSku?.toString().trim());
        console.log('All Added Product SKUs are: ->' + productSkus);
        const productTexts = rowProductTexts.map(product => product?.split(/,/)[0].trim());
        console.log('All Added product IDs are: ->' + productTexts);
        if (JSON.stringify(productTexts) === JSON.stringify(productSkus)) {
            console.log('Both fetched IDs matches');
        } else {
            console.log('Both fetched IDs do not match');
        }
    });

    test('Add Products to Cart and match the SKUs using EVERY method', async ({ page }) => {
        page.on('dialog', async (dialog) => {
            console.log("Initial Dialog Type is: -> " + dialog.type());
            console.log("Initial Dialog Text is: -> " + dialog.message());
            dialog.accept();
        })
        await page.goto("https://www.eiltd.com/");
        await page.locator('path[data-region="Texas"]').click({ force: true });
        await page.locator('#homeCategoryCardRow').getByRole('link', { name: 'Specialty' }).click();
        await page.getByRole('button', { name: 'Add one to cart' }).first().click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(1).click();
        await page.getByRole('button', { name: 'Add one to cart' }).nth(2).click();
        await page.locator('.cart-button').first().click();
        await page.getByRole('link', { name: 'View Cart' }).click();
        await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
        const tableRows = await page.locator('#guest-cart-tbody').getByRole('row').all();
        const rowProductTexts = [];
        let productSkus = [];
        for (const row of tableRows) {
            rowProductTexts.push(await row.locator('td').first().textContent());
            productSkus.push(await row.locator('td').nth(1).textContent());
        }
        const productTexts = rowProductTexts.map(product => product?.split(/,/)[0].trim());
        productSkus = productSkus.map(sku => sku?.toString());
        console.log('All Added product IDs are: ->' + productTexts);
        console.log('All Added Product SKUs are: ->' + productSkus);
        const isMatched = productTexts.every(sku => productSkus.includes(sku));
        console.log('Do they match -> '+isMatched);
        expect(isMatched).toBeTruthy();
    });
});