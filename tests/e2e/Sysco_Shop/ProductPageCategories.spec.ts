import {expect, test} from '@playwright/test';

test.describe('Product Page Categories Test Suite - Become a customer flow', async () => {

    test.beforeEach('Navigate to Sysco Shop application', async ({page}) => {
        await page.goto("https://www.sysco.com/products/products/product-categories");
        await page.getByRole('button', {name:'Sounds, Good!'}).click();
        await expect(page.getByText('Our Products')).toBeVisible();
        await page.getByText('Our Product Categories').scrollIntoViewIfNeeded();
        await expect(page.getByText('Our Product Categories')).toBeVisible();
    });

    test('Verify Product Categories count', async ({page})=>{
        await expect(page.locator('.tile-container > div')).toHaveCount(9);
    });

    test('Verify the Product Categories Navigation Links - Meat & Seafood', async ({page}) =>{
        const meatAndSeafoodLink = page.getByRole('link',{name:'Meat and Poultry'});
        const meatAndSeafoodLinkAttr = await meatAndSeafoodLink.getAttribute('href');
        expect(meatAndSeafoodLinkAttr).toContain('syy_cust_tax_meatseafood&origin=website');

        const [popup] = await Promise.all ([
            page.waitForEvent('popup'),
            await meatAndSeafoodLink.click()
        ]);
        await popup.waitForLoadState();
        const zipCodeBox = popup.getByRole('textbox',{name:'Delivery Zip Code*'});
        await expect(zipCodeBox).toBeEditable();
        await zipCodeBox.fill('40222');
        await expect(popup).toHaveTitle('Sysco Shop | Catalog');
        await popup.close();
        await page.bringToFront();
        await expect(page.locator('.tile-container > div')).toHaveCount(9);
    })

    test('verify the product Categories Navigation Links - Dairy & Eggs', async({page}) => {
        const dairyEggsLink = page.getByRole('link',{name:'Seafood'});
        const dairyEggsLinkAttr = await dairyEggsLink.getAttribute('href');
        expect(dairyEggsLinkAttr).toContain('syy_cust_tax_dairyeggs&origin=website');

        const [popup] = await Promise.all ([
            page.waitForEvent('popup'),
            await dairyEggsLink.click()
        ])
        await popup.waitForLoadState();
        const zipCodeBox = popup.getByRole('textbox',{name:'Delivery Zip Code*'});
        await expect(zipCodeBox).toBeEditable();
        await zipCodeBox.fill('40222');
        await expect(popup).toHaveTitle('Sysco Shop | Catalog');
        await popup.close();
        await page.bringToFront();
        await expect(page.locator('.tile-container > div')).toHaveCount(9);
    })

})