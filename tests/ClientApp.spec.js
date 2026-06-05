const { test, expect } = require('@playwright/test');
const { copyFileSync } = require('node:fs');

test.only('Assignment Test 1 - Client App', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  console.log(await page.title());

  const nameOfUser = page.locator('[type="email"]');
  const passwordOfUser = page.locator('[type="password"]');
  const logInClick = page.locator('[type="submit"]');
  const cardTitle = page.locator('.card-body b');

  const productName = 'ZARA COAT 3';
  const product = page.locator('.card-body');

  await nameOfUser.fill('pipiiww@gmail.com');
  await passwordOfUser.fill('P@ssw0rd');
  await logInClick.click();

  // await page.waitForLoadState('networkidle');
  await cardTitle.first().waitFor();
  const allTitles = await cardTitle.allTextContents();
  console.log(allTitles);
  // ZARA COAT 3
  const count = await product.count();
  console.log(count);
  for (let i = 0; i < count; i++) {
    if ((await product.nth(i).locator('b').textContent()) === productName) {
      // write the logic to add product to cart
      await product.nth(i).locator('text= Add To Cart').click();
      break;
    }
  }

  await page.locator('[routerlink*="cart"]').click();
  await page.locator('div li').first().waitFor();
  const bool = await page.locator('h3:has-text("Zara Coat 3")').isVisible();
  expect(bool).toBeTruthy();

  await page.locator('button[type="button"]').last().click();
  const textCCNumber = await page
    .locator('.text-validated')
    .first()
    .inputValue();
  console.log(textCCNumber);

  await page.locator('input[class="input txt"]').first().fill('342');
  await page.locator('input[class="input txt"]').last().fill('Burhanuddin');

  await page
    .locator('[placeholder*="Country"]')
    .pressSequentially('ind', { delay: 100 });
  const dropdown = page.locator('.ta-results');
  await dropdown.waitFor();
  const optionCount = await dropdown.locator('button').count();
  console.log(optionCount);
  for (let i = 0; i < optionCount; i++) {
    const text = await dropdown.locator('button').nth(i).textContent();
    if (text === ' Indonesia') {
      await dropdown.locator('button').nth(i).click();
      break;
    }
  }

  expect(page.locator('.user__name [type="text"]').first()).toHaveText(
    'pipiiww@gmail.com',
  );
  await page.locator('.action__submit').click();
  await expect(page.locator('.hero-primary')).toHaveText(
    ' Thankyou for the order. ',
  );
  const orderId = await page
    .locator('.em-spacer-1 .ng-star-inserted')
    .textContent();
  console.log(orderId);

  await page.locator('ul li [routerlink$="/dashboard/myorders"]').click();

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

  await page.pause();
});
