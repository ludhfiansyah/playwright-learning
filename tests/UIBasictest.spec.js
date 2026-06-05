const { test, expect } = require('@playwright/test');

test('Browser Context Playwright test', async ({ browser }) => {
  // chrome - plugin/cookies
  const context = await browser.newContext();
  const page = await context.newPage();
  const userName = page.locator('#username');
  const passWord = page.locator("[type='password']");
  const signIn = page.locator('#signInBtn');
  const cardTitle = page.locator('.card-body a');

  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  console.log(await page.title());

  await userName.fill('rahulshetty');
  await passWord.fill('Learning@830$3mK2');
  await signIn.click();
  // wait until this locator shown up on the page
  console.log(await page.locator("[style*='block']").textContent());
  await expect(page.locator("[style*='block']")).toContainText('Incorrect');

  //type - fill
  await userName.fill('');
  await userName.fill('rahulshettyacademy');
  await signIn.click();
  // console.log(await cardTitle.first().textContent());
  // console.log(await cardTitle.nth(1).textContent());
  const allTitles = await cardTitle.allTextContents();
  console.log(allTitles);
});

test('Page Playwright test', async ({ page }) => {
  // chrome - plugin/cookies
  await page.goto('https://google.com');

  // get title - assertion
  console.log(await page.title());
  await expect(page).toHaveTitle('Google');
});

test('UI Control test', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');

  const userName = page.locator('#username');
  const signIn = page.locator('#signInBtn');
  const dropDown = page.locator('select.form-control');
  const documentLink = page.locator("[href*='documents-request']");

  await dropDown.selectOption('consult');
  await page.locator('.radiotextsty').last().click();
  await page.locator('#okayBtn').click();
  await expect(page.locator('.radiotextsty').last()).toBeChecked();
  await console.log(await page.locator('.radiotextsty').last().isChecked());

  await page.locator('#terms').click();
  await expect(page.locator('#terms')).toBeChecked();
  await page.locator('#terms').uncheck();
  expect(await page.locator('#terms').isChecked()).toBeFalsy();
  await expect(documentLink).toHaveAttribute('class', 'blinkingText');

  // await page.pause();
});

test('@Child windows handle', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const userName = await page.locator('#username');
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');

  const documentLink = page.locator("[href*='documents-request']");

  const [newPage] = await Promise.all([
    context.waitForEvent('page'), //listen for any new page pending,rejected,fulfilled
    documentLink.click(),
  ]); //new page is opened, we can proceed to the next step of tests

  const text = await newPage.locator('.red').textContent();
  console.log(text);

  const arraOfText = text.split('@');
  const domain = arraOfText[1].split(' ')[0];
  console.log(domain);

  await userName.fill(domain);
  console.log(await userName.inputValue());
});
