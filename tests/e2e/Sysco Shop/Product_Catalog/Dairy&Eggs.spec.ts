import {test,expect} from '@playwright/test';

test.describe('Product Catalog Verification Suite - Meat & Seafood', async () => {

    test.beforeEach('Open the Dairy & Eggs Catalog URL', async ({page}) => {
        await page.goto('https://shop.sysco.com/app/catalog?BUSINESS_CENTER_ID=syy_cust_tax_dairyeggs&origin=website');
        const zipCodeBox = page.getByRole('textbox',{name:'Delivery Zip Code*'});
        await expect(zipCodeBox).toBeEditable();
        await zipCodeBox.fill('40222');
        await page.getByRole('button',{name:'Start Shopping'}).click();
        await expect(page).toHaveTitle('Sysco Shop | Catalog');
    });

    test('Verify the SUPC on Product card after Filter is applied matches with the SUPC on PDP- Cheese', async ({page}) => {
        await page.locator('.search-filters-container').locator('[value="syy_cust_tax_cheese"]').click();
        const productCardLink = page.locator('a',{hasText:'Cheese Cheddar Jack Fancy Shredded 4/5LB'}).first();
        const supcFromProductCard = await productCardLink.locator('.selectable-supc-label').textContent();
        console.log('SUPC fetched from Product Card -'+supcFromProductCard);
        await productCardLink.first().click();
        const supcFromPDP = await page.locator('[data-id="product_id"]').textContent();
        console.log('SUPC fetched from PDP -'+supcFromPDP);
        expect(supcFromProductCard).toBe(supcFromPDP);
    });

    test('Verify the product count after Filter is applied - Cheese', async ({page}) => {
        await page.locator('.search-filters-container').locator('[value="syy_cust_tax_cheese"]').click();
        const searchResultText = await page.locator('.search-items-results-count').textContent();
        console.log("Search result text ->"+searchResultText?.split('-'));
        const searchResultMatch = searchResultText?.match(/-\s*(\d+)/);
        const searchResultCount = searchResultMatch?.[1];
        console.log('Search Result count is-'+searchResultCount?.[1]);
        const productsCardCount = await page.locator('.catalog-cards-wrapper').locator('.product-card-link').count();
        console.log('Search Result count is-'+productsCardCount);
        expect(searchResultCount).toBe(productsCardCount.toString());
    });

    test('Verify the each Product name contains Cheese after filter is applied', async ({page}) => {
        await page.locator('.search-filters-container').locator('[value="syy_cust_tax_cheese"]').click();
        await page.waitForTimeout(2000);
        const totalProductCards = page.locator('.product-title');
        console.log('Total count of Products on the page after filter is applied '+ await totalProductCards.count());
        const allProductsCards = await totalProductCards.all();
        for(const [index,card] of allProductsCards.entries()){
            console.log(`Product # ${index+1} name is:`+ await card.textContent());
            expect(await card.textContent()).toContain('Cheese');
            await expect(card).toHaveText('Cheese');
        }
    });
})