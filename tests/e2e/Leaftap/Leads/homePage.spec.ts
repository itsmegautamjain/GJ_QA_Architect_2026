import { test, expect } from '@playwright/test';

test.describe('Leaftap Home Page Test Suite - Leads context', async () => {

    // test.beforeEach('Login to Leaftap application', async ({ page }) => {
    //     await page.goto('https://leaftaps.com');
    //     await page.getByLabel('Username').fill('DemoSalesManager');
    //     await page.getByLabel('Password').fill('crmsfa');
    //     await page.getByRole('button', { name: 'Login' }).click();
    //     await expect(page.locator('.crmsfa')).toBeVisible();
    //     await page.locator('.crmsfa').click();
    //     await expect(page.getByRole('link', { name: 'My Home' })).toBeVisible();
    // });

    test.use({ storageState: 'playwright/.auth/LeafTapUser.json' });

    test.beforeEach('Login to Leaftap application', async ({ page }) => {
        await page.goto('https://leaftaps.com/opentaps');
        await expect(page.locator('.crmsfa')).toBeVisible();
        await page.locator('.crmsfa').click();
        await expect(page.getByRole('link', { name: 'My Home' })).toBeVisible();
    });

    test('Verify Home Page title', async ({ page }) => {
        await expect(page).toHaveTitle(/My Home | opentaps CRM/);
    });

    test('Verify Create Lead link is available in Shortcuts on my Home Page', async ({ page }) => {
        await expect(page.locator('#left-content-column').getByRole('link', { name: 'Create Lead' })).toBeVisible();
    });

    test('Create Lead from Home page Shortcuts', async ({ page }) => {
        await expect(page.locator('#quickNewLead')).toBeVisible();
        await page.locator('#quickNewLead').click();
        await page.getByLabel('Company Name:').fill('Syntel');
        await page.getByRole('textbox', { name: 'First Name:' }).fill('Ajay');
        await page.getByRole('textbox', { name: 'Last Name:' }).fill('Mittal');
        // await page.getByLabel('Phone Number:').fill('502-555-5555');
        // await page.getByLabel('E-Mail Address:').fill('testLeafGJ@test.com');
        await page.getByRole('button', { name: 'Create Lead' }).click();
        await expect(page.getByText('One Moment...')).toBeVisible();
    });

    test('Verify the mandatory fields in Create Lead form', async ({ page }) => {
        await expect(page.locator('#quickNewLead')).toBeVisible();
        await page.locator('#quickNewLead').click();
        await page.getByRole('button', { name: 'Create Lead' }).click();
        const companyNameClass = await page.getByLabel('Company Name:').getAttribute('class');
        const firstNameClass = await page.getByRole('textbox', { name: 'First Name:' }).getAttribute('class');
        const lastNameClass = await page.getByRole('textbox', { name: 'Last Name:' }).getAttribute('class');
        console.log('Company Name field class attribute:', companyNameClass);
        console.log('First Name field class attribute:', firstNameClass);
        console.log('Last Name field class attribute:', lastNameClass);
        expect(companyNameClass).toContain('invalid');
        expect(firstNameClass).toContain('invalid');
        expect(lastNameClass).toContain('invalid');
    });

    test('Verify the mandatory fields in Create Lead form - using toHaveClass', async ({ page }) => {
        await expect(page.locator('#quickNewLead')).toBeVisible();
        await page.locator('#quickNewLead').click();
        await page.getByRole('button', { name: 'Create Lead' }).click();
        await expect(page.getByLabel('Company Name:')).toHaveClass(/invalid/);
        await expect(page.getByRole('textbox', { name: 'First Name:' })).toHaveClass(/invalid/);
        await expect(page.getByRole('textbox', { name: 'Last Name:' })).toHaveClass(/invalid/);
    });
});


// Create Lead using Phone and Email fields
// Verify non mandatory fields in Create Lead form i.e. Phone and Email fields are not mandatory
// Verify Lead creation is not allowed when only phone and email is provided and mandatory fields are not provided
// Verify all 3 fields of Phone Number including tooltip