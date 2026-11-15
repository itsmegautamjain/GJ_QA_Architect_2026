import { test, expect } from '@playwright/test';

test.describe('Home Page Suite - Dropdown Validations', async () => {

    test.beforeEach('Open the FreshPoint URL', async ({ page }) => {
        await page.goto('https://www.freshpoint.com/');
        await page.getByRole('button', { name: 'Sounds, Good!' }).click();
    });

    test('Verify the Visibility of location dropdown', async ({ page }) => {
        const locationDropdown = page.getByRole('textbox', { name: 'Find Your Location' });
        await expect(locationDropdown).toBeVisible();
        await locationDropdown.click();
        await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
        await locationDropdown.click();
        await expect(page.getByPlaceholder('Type city or ZIP, press Enter…')).not.toBeVisible();
    });

    test('Verify the total number of locations in dropdown', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const allLocationsInComboBox = await page.getByRole('listbox').getByRole('option').all();
        console.log('Total number of Locations are: - ' + allLocationsInComboBox.length);
        expect(allLocationsInComboBox).toHaveLength(31);
    });

    test('Select a location from the dropdown', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const allLocationsInComboBox = await page.getByRole('listbox').getByRole('option').all();
        await allLocationsInComboBox[1].click();
        await expect(page.locator('.modal-dialog')).toBeVisible();
        await page.locator('.btn-close').click();
        await expect(page.getByRole('button', { name: 'Remove all items' }).locator('..')).toHaveText(/FP Dito's, Anchorage, AK/);
    });

    test('Remove the selected value from dropdown', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const allLocationsInComboBox = await page.getByRole('listbox').getByRole('option').all();
        await allLocationsInComboBox[1].click();
        await expect(page.locator('.modal-dialog')).toBeVisible();
        await page.locator('.btn-close').click();
        await page.getByRole('button', { name: 'Remove all items' }).click();
        await locationComboBox.click();
    });

    test('Scroll down and select the last option from dropdown', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const allLocationsInComboBox = await page.getByRole('listbox').getByRole('option').all();
        await allLocationsInComboBox[30].scrollIntoViewIfNeeded();
        await page.waitForTimeout(3000);
        await allLocationsInComboBox[30].click();
        await expect(page.locator('.modal-dialog')).toBeVisible();
        await page.locator('.btn-close').click();
        await page.getByRole('button', { name: 'Remove all items' }).click();
        await locationComboBox.click();
    });

    test('Search a location in dropdown', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const locationSearchBox = page.getByRole('searchbox', { name: 'Search' });
        await expect(locationSearchBox).toBeVisible();
        await locationSearchBox.fill('Alaska');
        await locationSearchBox.press('Enter');
        await expect(page.locator('.modal-dialog')).toBeVisible();
        await page.locator('.btn-close').click();
    });

    test('Verify the number of locations returned after search', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const locationSearchBox = page.getByRole('searchbox', { name: 'Search' });
        await expect(locationSearchBox).toBeVisible();
        await locationSearchBox.fill('Alaska');
        await locationSearchBox.press('Enter');
        await expect(page.locator('.modal-dialog')).toBeVisible();
        const numberOfLocationsReturned = page.locator('.modal-body').locator('li');
        const numberOfLocationsText = await page.locator('.modal-body').locator('p').textContent();
        console.log('Number of locations returned: - ' + numberOfLocationsText?.match(/\d+/));
        expect(await numberOfLocationsReturned.count()).toBe(parseInt(numberOfLocationsText?.match(/\d+/)?.[0] ?? '0', 10));
        await page.locator('.btn-close').click();
    });

    test('Verify the number of locations in dropdown after search modal is closed', async ({ page }) => {
        const locationComboBox = page.getByRole('combobox', { name: 'Find Your Location' });
        await locationComboBox.click();
        const locationSearchBox = page.getByRole('searchbox', { name: 'Search' });
        await expect(locationSearchBox).toBeVisible();
        await locationSearchBox.fill('Alaska');
        await locationSearchBox.press('Enter');
        await expect(page.locator('.modal-dialog')).toBeVisible();
        const numberOfLocationsReturned = page.locator('.modal-body').locator('li');
        const numberOfLocationsText = await page.locator('.modal-body').locator('p').textContent();
        console.log('Number of locations returned: - ' + numberOfLocationsText?.match(/\d+/));
        expect(await numberOfLocationsReturned.count()).toBe(parseInt(numberOfLocationsText?.match(/\d+/)?.[0] ?? '0', 10));
        await page.locator('.btn-close').click();
        await locationComboBox.click();
        const locationsAfterSearchModalClosed = page.getByRole('listbox').getByRole('option');
        const locationsCountAfterSearchModalClosed = await locationsAfterSearchModalClosed.count();
        console.log('Location count in dropdown after search modal is closed '+locationsCountAfterSearchModalClosed);
        for(const location of await locationsAfterSearchModalClosed.all()){
            console.log(await location.textContent());
        }
        await locationComboBox.click();
    });
});