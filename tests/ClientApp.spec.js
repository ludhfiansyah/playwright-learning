const { test, expect } = require('@playwright/test');

test('Assignment Test 1 - Client App', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  console.log(await page.title());

  const email = page.getByPlaceholder('email@example.com');
  const password = page.getByPlaceholder('enter your passsword');
  const logInClick = page.getByRole('button', { name: 'Login' });
  const cardTitle = page.locator('.card-body b');

  const productName = 'ZARA COAT 3';
  const product = page.locator('.card-body');

  await email.fill('pipiiww@gmail.com');
  await password.fill('P@ssw0rd');
  await logInClick.click();

  // await page.waitForLoadState('networkidle');
  await cardTitle.first().waitFor();
  await page
    .locator('.card-body')
    .filter({ hasText: 'ZARA COAT 3' })
    .getByRole('button', { name: 'Add to Cart' })
    .click();

  await page
    .getByRole('listitem')
    .getByRole('button', { name: 'Cart' })
    .click();

  await page.locator('div li').first().waitFor();
  await expect(page.getByText('ZARA COAT 3')).toBeVisible();
  await page.getByRole('button', { name: 'Checkout' }).click();

  const textCCNumber = await page
    .locator('.text-validated')
    .first()
    .inputValue();
  console.log(textCCNumber);

  await page.locator('input[class="input txt"]').first().fill('342');
  await page.locator('input[class="input txt"]').last().fill('Burhanuddin');

  await page.getByPlaceholder('Select Country').pressSequentially('indo');

  await page.getByRole('button', { name: 'Indonesia' }).click();
  await page.getByText('PLACE ORDER').click();

  await expect(page.getByText('Thankyou for the order.')).toBeVisible();

  const orderId = await page
    .locator('.em-spacer-1 .ng-star-inserted')
    .textContent();
  console.log(orderId);

  // await page.locator('ul li [routerlink$="/dashboard/myorders"]').click();
  await page.getByRole('button', { name: 'ORDERS' }).click();

  await page.locator('tbody').waitFor();
  const rows = await page.locator('tbody tr');
  const rowsCount = await rows.count();
  for (let i = 0; i < rowsCount; i++) {
    const colOrderId = await rows.nth(i).locator('th').textContent();
    if (orderId.includes(colOrderId)) {
      await rows.nth(i).locator('button').first().click();
      break;
    }
  }

  const orderIdDetails = await page.locator('.col-text').textContent();
  expect(orderId.includes(orderIdDetails)).toBeTruthy();
});
