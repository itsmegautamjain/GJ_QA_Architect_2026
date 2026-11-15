import { expect, test } from '@playwright/test';

test.describe('Product Checks - CWK - Test Suite', async () => {

    test.beforeEach('Navigate to CWK application', async ({ page }) => {
        await page.goto("https://www.cleanwithkeystone.com/");
    });

    test('Verify selected Product counts', async ({ page }) => {
        await page.locator('#main-nav > ul > li.has-sub.open > a').click();
        await expect(page.getByText('All Products')).toBeVisible();
        await page.getByRole('link', { name: 'Laundry' }).click();
        await expect(page.locator('.product-item')).toHaveCount(5);
    });

    test('Fetch all Product categories', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').all();
        for (const productCategory of allProductCategories) {
            console.log(await productCategory.getByRole('link').textContent());
        }
        expect(allProductCategories).toHaveLength(13);
    });

    test('Fetch all Product categories - Usage of Splice', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').allTextContents();
        console.log(allProductCategories);
        console.log('total number of products is: - ', allProductCategories.length);
        allProductCategories.push('Lizol');
        console.log(allProductCategories);
        console.log('total number of products after adding 1 product is: - ', allProductCategories.length);
        allProductCategories.splice(13, 1);
        console.log(allProductCategories);
        console.log('total number of products after removal of 1 product is: - ', allProductCategories.length);
        allProductCategories.splice(13, 0, 'Dr. Lizol');
        console.log(allProductCategories);
        console.log('total number of products after addition of 1 new product is: - ', allProductCategories.length);
        allProductCategories[14] = 'Floor Punch';
        console.log(allProductCategories);
        console.log('total number of products after addition of new product is: - ', allProductCategories.length);
    });

    test('Fetch all Product categories - Usage of Slice', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').allTextContents();
        console.log(allProductCategories.slice(4, 7));
        console.log('Initial Array ->' + allProductCategories);
        allProductCategories.pop();
        console.log('After Pop->' + allProductCategories);
        allProductCategories.shift();
        console.log('After Shift ->' + allProductCategories);
        allProductCategories.unshift('Harpic');
        console.log('After UnShift -> ' + allProductCategories + 'New length' + allProductCategories.length);
        allProductCategories.push('Cleanshield');
        console.log('After Push -> ' + allProductCategories + 'New length' + allProductCategories.length);
    });

    test('Fetch all Product categories - Usage of Map', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').allTextContents();
        console.log('Initial Array ->' + allProductCategories);
        const newArray = allProductCategories.map((el) => {
            if (el.includes('Cleaners')) {
                return el.concat(` Sysco`);
            } else {
                return el;
            }
        });
        console.log('Array with elements containing Cleaners ' + newArray);
    });

    test('Fetch all Product categories - Usage of Filter', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').allTextContents();
        console.log('Initial Array ->' + allProductCategories);
        const newArray = allProductCategories.filter(el => el.match(/Cleaners/));
        console.log('New Array is ->' + newArray);
        const newArray2 = newArray.filter(el => el.includes('&'));
        console.log('New second Array is ->' + newArray2);
    });

    test('Fetch all Product categories - Usage of Reduce', async ({ page }) => {
        await page.locator('#main-nav').getByText('Products', { exact: true }).click();
        await expect(page.getByRole('heading', { name: 'All Products' }).getByRole('link')).toBeVisible();
        const allProductCategories = await page.locator('#main-nav').locator('.drop-down').getByRole('listitem').allTextContents();
        console.log('Initial Array ->' + allProductCategories);
        const newArray = allProductCategories.filter(el => el.match(/Cleaners/));
        const newArray2 = newArray.filter(el => el.includes('&'));
        const newArray3 = newArray2.reduce((acc,el) => {
            return acc + el.replace(/Cleaners/g,'');
        },'');
        console.log('New Array is: ->'+ newArray3);
    });
});



// 5CD3194WZP