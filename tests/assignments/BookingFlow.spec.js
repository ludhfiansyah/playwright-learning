const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

// Helper - login function
async function login(url, page) {
  const username = 'pipiiww@gmail.com';
  const password = 'P@ssw0rd';

  //  Navigate to /login
  await page.goto(`${url}/login`);

  // - Fill email field (locate by placeholder you@email.com)
  await page.getByPlaceholder('you@email.com').fill(username);

  // - Fill password field (locate by label Password)
  await page.getByLabel('password').fill(password);

  // - Click the login button (locate by id #login-btn)
  await page.locator('#login-btn').click();

  // - Assert: link with text Browse Events → is visible (confirms login success)
  await expect(page.locator('span:has-text("Browse Events →")')).toBeVisible();
}

test('Full Booking Flow with Event Creation', async ({ page }) => {
  // Step 1 — Login
  await login(BASE_URL, page);

  // Step 2 — Create a new event
  // - Navigate to /admin/events
  await page.goto(`${BASE_URL}/admin/events`);

  // - Generate a unique event title using Test Event ${Date.now()} — store this in a variable, you will need it throughout the test
  const eventTitle = 'Test Event ' + Date.now();

  // - Fill Title field (locate by id #event-title-input)
  await page.locator('#event-title-input').fill(eventTitle);

  // - Fill Description textarea (locate using #admin-event-form textarea)
  await page.locator('#admin-event-form textarea').fill(eventTitle);

  // - Fill City field (locate by label City)
  await page.getByLabel('City').fill('Bukit Tinggi');

  // - Fill Venue field (locate by label Venue)
  await page.getByLabel('Venue').fill('Jam Gadang');

  // - Fill Event Date & Time field (locate by label Event Date & Time) — use your futureDateValue() helper
  await page.getByLabel('Event Date & Time').fill('2027-12-31T10:00');

  // - Fill Price ($) field (locate by label Price ($)) — use any number e.g. 100
  await page.getByLabel('Price ($)').fill('100');

  // - Fill Total Seats field (locate by label Total Seats) — use 50
  await page.getByLabel('Total Seats').fill('50');

  // - Click the submit button (locate by id #add-event-btn)
  await page.locator('#add-event-btn').click();

  // - Assert: toast message Event created! is visible
  await expect(page.getByText('Event created!')).toBeVisible();
  console.log(`Created event: "${eventTitle}"`);

  // Step 3 — Find the event card and capture seats
  // - Navigate to /events
  await page.goto(`${BASE_URL}/events`);

  // - Get all event cards (locate by data-testid="event-card")
  const eventCards = page.getByTestId('event-card');

  // - Assert the first card is visible (confirms page loaded)
  await expect(eventCards.first()).toBeVisible();

  // - From all cards, filter for the one that contains your event title text
  const targetCard = eventCards.filter({ hasText: eventTitle });

  // - Assert the matched card is visible (timeout 5 seconds)
  await expect(targetCard).toBeVisible({ timeout: 5000 });

  // - Read the seat count text from that card (locate element containing text seat, parse integer from its inner text) — store this as seatsBeforeBooking
  const seatsBeforeBooking = parseInt(
    await targetCard.getByText('seat').first().innerText(),
  );
  console.log(`Seats before booking: ${seatsBeforeBooking}`);

  // Step 4 — Start booking
  // - On the matched event card, click the Book Now button (locate by data-testid="book-now-btn" inside the card)
  await targetCard.getByTestId('book-now-btn').click();

  //   Step 5 — Fill booking form
  // - Assert: element with id #ticket-count has text 1 (default quantity)
  const ticketCount = page.locator('#ticket-count');
  await expect(ticketCount).toHaveText('1');

  // - Fill Full Name (locate by label Full Name)
  await page.getByLabel('Full Name').fill('Burhanuddin');

  // - Fill Email (locate by id #customer-email)
  await page.locator('#customer-email').fill('burhanuddin@kocak.com');

  // - Fill Phone (locate by placeholder +91 98765 43210)
  await page.getByPlaceholder('+91 98765 43210').fill('+91 98765 43210');

  // - Click the confirm button (locate by CSS class .confirm-booking-btn)
  await page.locator('.confirm-booking-btn').click();
  //await page.pause();

  //   Step 6 — Verify booking confirmation
  // - Locate the booking reference element (locate by CSS class .booking-ref, take .first())
  const bookingRefEl = page.locator('.booking-ref').first();

  // - Assert it is visible
  await expect(bookingRefEl).toBeVisible();

  // - Read its inner text, trim it — store as bookingRef
  const bookingRef = (await bookingRefEl.innerText()).trim();
  console.log(bookingRef);

  // Step 7 — Verify in My Bookings
  // - Click the link View My Bookings
  await page.getByRole('button', { name: 'View My Bookings' }).click();

  // - Assert: URL is BASE_URL/bookings
  await expect(page).toHaveURL(`${BASE_URL}/bookings`);

  // - Get all booking cards (locate by id #booking-card)
  const bookingCards = page.locator('#booking-card');

  // - Assert the first booking card is visible
  await expect(bookingCards.first()).toBeVisible();

  // - Filter booking cards for the one that contains an element with class .booking-ref matching your bookingRef text
  const matchingCard = bookingCards.filter({
    has: page.locator('.booking-ref', { hasText: bookingRef }),
  });

  // - Assert that matched card is visible
  await expect(matchingCard).toBeVisible();

  // - Assert that matched card contains your eventTitle text
  await expect(matchingCard).toContainText(eventTitle);

  // Step 8 — Verify seat reduction
  // - Navigate back to /events
  await page.goto(`${BASE_URL}/events`);

  // - Assert the first event card is visible
  await expect(eventCards.first()).toBeVisible();

  // - Filter cards again using hasText: eventTitle
  const updatedCard = eventCards.filter({ hasText: eventTitle }).first();

  // - Assert the card is visible
  await expect(updatedCard).toBeVisible();

  // - Read the seat count text again (same as Step 3) — store as seatsAfterBooking
  const seatsAfterBooking = parseInt(
    await updatedCard.getByText('seat').first().innerText(),
  );
  console.log(`Seats after booking: ${seatsAfterBooking}`);

  // - Assert: seatsAfterBooking === seatsBeforeBooking - 1
  expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);
});
