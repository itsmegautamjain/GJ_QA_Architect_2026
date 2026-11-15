import {test,expect} from '@playwright/test';

test.describe('Product Catalog Verification Suite - Meat & Seafood', async () => {

    test.beforeEach('Open the Meat & Seafood Catalog URL', async ({page}) => {
        await page.goto('https://shop.sysco.com/app/catalog?BUSINESS_CENTER_ID=syy_cust_tax_meatseafood&origin=website');
        const zipCodeBox = page.getByRole('textbox',{name:'Delivery Zip Code*'});
        await expect(zipCodeBox).toBeEditable();
        await zipCodeBox.fill('40222');
        await page.getByRole('button',{name:'Start Shopping'}).click();
        await expect(page).toHaveTitle('Sysco Shop | Catalog');
    });

    test('Verify the total Product count displayed as text', async ({page}) => {
        await expect(page.getByText('Showing')).toBeVisible();
        const totalCountText = await page.locator('.search-items-results-count').textContent();
        console.log('Product Count Displayed text is:-' + totalCountText);
        const totalProductCount = totalCountText?.split(' ')[5];
        console.log("Total Products Count is:-"+totalProductCount);
    });

    test('Verify the total Product count displayed as text - Using Regular Expression', async ({page}) => {
        await expect(page.getByText('Showing')).toBeVisible();
        const totalCountText = await page.locator('.search-items-results-count').textContent();
        console.log('Product Count Displayed text is:-' + totalCountText);
        const totalProductCount = totalCountText?.split(' ').filter((el)=>{
            return el.match(/[0-9]/g);
            });
        console.log('Total Products Count is: - '+totalProductCount?.[2]);
    });

})