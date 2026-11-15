import { test, expect } from '@playwright/test';

test.describe('Sysco Foodie Page - Sysco Brand List Validations Suite', async () => {

    test('Open the Sysco Foodie URL and fetch the Sysco Brand list', async ({ page }) => {
        await page.goto('https://foodie.sysco.com', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Sounds, Good!' }).click();
        const syscoBrandsList = await page.locator('#mega-menu-always_on_menu').getByRole('listitem').last().locator('.mega-menu-row')
                                    .locator('.mega-menu-link').all();
        console.log('Total number of Sysco Brands available in the list is: ->'+ syscoBrandsList.length);
        console.log('List of brands fetched is: ->');
        let listofBrands = [];
        for(const brand of syscoBrandsList){
            listofBrands.push(await brand.textContent());
        }
        listofBrands = listofBrands.map(brand => brand?.trim());
        console.log(listofBrands);
    });

});