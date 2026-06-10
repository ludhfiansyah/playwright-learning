const { test, expect } = require('@playwright/test');



// Setup

// - BASE_URL = https://eventhub.rahulshettyacademy.com

// - Credentials: Use your own credentials

// - Write a reusable loginAndGoToBooking(page) helper that logs in and confirms the Browse Events → link is visible

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const username = 'pipiiww@gmail.com';
const password = 'P@ssw0rd';

async function loginAndGoToBooking(page) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@email.com').fill(username);
    await page.getByLabel('password').fill(password);
    await page.locator('#login-btn').click();
    await expect(page.locator('span:has-text("Browse Events")')).toBeVisible();
}


// Test 1 — Single ticket booking is eligible for refund
test('Refund Eligibility Check', async ({ page }) => {
    // Step 1 — Login
    // - Call your login helper
    await loginAndGoToBooking(page);

    // Step 2 — Book first event with 1 ticket (default)
    // - Navigate to /events
    await page.goto(`${BASE_URL}/events`);
    // - Click Book Now on the very first event card (locate data-testid="event-card" → first → data-testid="book-now-btn")
    await page.getByTestId('event-card').first().getByTestId('book-now-btn').click();
    // - Fill Full Name, Email (your email), Phone
    await page.getByLabel('Full Name').fill('Burhanuddin');
    await page.getByLabel('Email').fill('burhanuddin@kocak.com');
    await page.getByLabel('Phone').fill('+91 98765 43210');
    // - Click confirm button (.confirm-booking-btn)
    await page.locator('.confirm-booking-btn').click();

    //     Step 3 — Navigate to booking detail
    // - Click View My Bookings link
    await page.getByRole('button', { name: 'View My Bookings' }).click();
    // - Assert URL is /bookings
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);
    // - Click the first View Details link
    await page.getByRole('link', { name: 'View Details' }).first().click();
    // - Assert: text Booking Information is visible on the page
    await expect(page.locator('h2:has-text("Booking Information")')).toBeVisible();

    // Step 4 — Validate booking ref
    // - Read booking ref from page
    const bookingRef = await page.locator('nav span').last().innerText();
    console.log(bookingRef);
    // - Read event title from h1
    const eventTitle = await page.locator('h1:visible').innerText();
    console.log(eventTitle);
    // - Assert validation : "first character of booking ref equals first character of event title"
    expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));

    // Step 5 — Check refund eligibility
    // - Click the Check Refund Eligibility button
    await page.locator('#check-refund-btn').click();
    // - Assert: spinner element (#refund-spinner) is immediately visible
    await expect(page.locator('#refund-spinner')).toBeVisible();
    // - Assert: spinner is no longer visible within 6 seconds
    await expect(page.locator('#refund-spinner')).not.toBeVisible({ timeout: 6000 });
    // - Assert: text Eligible for refund is visible on the page
    await expect(page.locator('#refund-result')).toContainText('Eligible for refund');


    // Step 6 — Validate result
    // - Locate result element by id #refund-result
    const refundResult = page.locator('#refund-result');
    // - Assert it is visible
    await expect(refundResult).toBeVisible();   
    // - Assert it contains text Eligible for refund
    await expect(refundResult).toContainText('Eligible for refund');
    // - Assert it contains text Single-ticket bookings qualify for a full refund
    await expect(refundResult).toContainText('Single-ticket bookings qualify for a full refund');
});


// Test 2 — Group ticket booking is NOT eligible for refund
test('Group Ticket Booking is NOT Eligible for Refund', async ({ page }) => {
    // Steps 1–2 — Same as Test 1, except after navigating to the event detail page, click the + button twice to increase quantity to 3 before filling the form
    // - Call your login helper
    await loginAndGoToBooking(page);
    // - Navigate to /events
    await page.goto(`${BASE_URL}/events`);
    // - Click Book Now on the very first event card (locate data-testid="event-card" → first → data-testid="book-now-btn")
    await page.getByTestId('event-card').first().getByTestId('book-now-btn').click();
    // - Locate the increment button with button:has-text("+") and click it twice
    await page.locator('button:has-text("+")').click();
    await page.locator('button:has-text("+")').click();
    // - Fill Full Name, Email (your email), Phone
    await page.getByLabel('Full Name').fill('Burhanuddin');
    await page.getByLabel('Email').fill('burhanuddin@kocak.com');
    await page.getByLabel('Phone').fill('+91 98765 43210');
    // - Click confirm button (.confirm-booking-btn)
    await page.locator('.confirm-booking-btn').click();
    // Steps 3–5 — Identical to Test 1
    // - Click View My Bookings link
    await page.getByRole('button', { name: 'View My Bookings' }).click();
    // - Assert URL is /bookings
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);
    // - Click the first View Details link
    await page.getByRole('link', { name: 'View Details' }).first().click();
    // - Assert: text Booking Information is visible on the page
    await expect(page.locator('h2:has-text("Booking Information")')).toBeVisible();
    // - Read booking ref from page
    const bookingRef = await page.locator('nav span').last().innerText();
    console.log(bookingRef);
    // - Read event title from h1
    const eventTitle = await page.locator('h1:visible').innerText();
    console.log(eventTitle);
    // - Assert validation : "first character of booking ref equals first character of event title"
    expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));
    // - Click the Check Refund Eligibility button
    await page.locator('#check-refund-btn').click();
    // - Assert: spinner element (#refund-spinner) is immediately visible
    await expect(page.locator('#refund-spinner')).toBeVisible();
    // - Assert: spinner is no longer visible within 6 seconds
    await expect(page.locator('#refund-spinner')).not.toBeVisible({ timeout: 6000 });
    // - Assert: text Eligible for refund is visible on the page
    const refundResult = page.locator('#refund-result');
    await expect(refundResult).toContainText('Not eligible for refund.');  
    // - Assert: text Group bookings (3 tickets) are non-refundable is visible on the page
    await expect(refundResult).toContainText('Group bookings (3 tickets) are non-refundable');    

    //     Step 6 — Validate result (different assertions)
    // - Assert result contains Not eligible for refund
    await expect(page.locator('#refund-result')).toContainText('Not eligible for refund');
    // - Assert result contains Group bookings (3 tickets) are non-refundable
    await expect(page.locator('#refund-result')).toContainText('Group bookings (3 tickets) are non-refundable');

    await page.pause();
});