import { test, expect } from "@playwright/test";

test("home renders with NammaSpot branding and a usable document title", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /nammaspot home/i })).toBeVisible();
  await expect(page).toHaveTitle(/NammaSpot/i);
  await expect(page.locator("body")).not.toBeEmpty();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(360);
});

test("seller registration route renders its required account form", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /create your seller account/i })).toBeVisible();
  await expect(page.getByText(/get approved/i)).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(360);
});

test("seller catalogue route handles an unknown seller without crashing", async ({ page }) => {
  await page.goto("/s/__playwright_missing_seller__");
  await expect(page.getByText(/seller page is unavailable|seller not found|could not load this seller/i)).toBeVisible({ timeout: 15000 });
});

test("admin login route is reachable and not publicly indexed", async ({ page }) => {
  await page.goto("/nammaspot-control-panel/login");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("primary routes can be reached by direct URL and keyboard focus is visible", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByRole("button", { name: /nammaspot home/i })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.goto("/categories");
  await expect(page.getByRole("button", { name: /nammaspot home/i })).toBeVisible();
});
