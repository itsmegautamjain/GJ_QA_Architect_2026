import {expect, test} from '@playwright/test';

test.describe('Product Page Test Suite - Become a customer flow', async () => {
    // let page:Page;
    // let context:BrowserContext;

// test.beforeAll('Initialize page', async ({browser}) => {
//     context = await browser.newContext();
//     page = await context.newPage();
// })

// test.afterAll('close the page and browser context',async() => {
//     await page.close();
//     await context.close();
// })

    test.beforeEach('Navigate to Sysco Shop application', async ({page}) => {
        await page.goto("https://shop.sysco.com");
    });

    test('Verify page with title', async ({page}) => {
        const welcomeLogo = page.locator('.styles__SyscoShoppingLogo-cLCvpX');
        await page.waitForLoadState();
        await page.waitForSelector('.styles__SyscoShoppingLogo-cLCvpX');
        expect(welcomeLogo).toBeVisible();
        expect(page).toHaveTitle('Sysco Shop | Login');
    });

    test('Verify Product Categories count', async ({page})=>{
        await page.getByRole('button',{name:'Become a Customer'}).click();
        expect(page.getByRole('heading',{name:'End-to-end operator success starts with Sysco'})).toBeVisible();
        expect(page.getByRole('textbox',{name:'Business Name'})).toBeEditable();
        await page.getByRole('button', {name:'Sounds, Good!'}).click();
        await page.getByRole('link',{name:'Products'}).hover({force:true});
        await page.getByRole('link',{name:'Product Categories',exact:true}).click();
        expect(page.getByText('Our Products')).toBeVisible();
        await page.getByText('Our Product Categories').scrollIntoViewIfNeeded();
        expect(page.getByText('Our Product Categories')).toBeVisible();
        expect(page.locator('.tile-container > div')).toHaveCount(9);
    });

    test('Verify the Navigation to Shop site after clicking on Product Categories', async ({page}) =>{
        await page.getByRole('button',{name:'Become a Customer'}).click();
        expect(page.getByRole('heading',{name:'End-to-end operator success starts with Sysco'})).toBeVisible();
        await page.getByRole('button', {name:'Sounds, Good!'}).click();
        await page.getByRole('link',{name:'Products'}).hover({force:true});
        await page.getByRole('link',{name:'Product Categories',exact:true}).click();
        expect(page.getByText('Our Products')).toBeVisible();
        await page.getByText('Our Product Categories').scrollIntoViewIfNeeded();
        expect(page.getByText('Our Product Categories')).toBeVisible();
        const meatAndSeafoodLink = await page.getByRole('link',{name:'Meat and Poultry'}).getAttribute('href');
        expect(meatAndSeafoodLink).toContain('syy_cust_tax_meatseafood&origin=website');
    })

})