import { expect, test } from "@playwright/test"
import { authenticator } from "otplib"

const TEST_GITHUB_USERNAME = "pollolisto"
const TEST_GITHUB_PASSWORD = "cUVwwE3owFrqqqVrnzzv"
const TEST_GITHUB_USER_SECRET = "WNH4RUR66VM3UXM2"

test.use({ storageState: { cookies: [], origins: [] } })

test("Log In with GitHub button is visible", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("button", { name: "Log In with GitHub" }),
  ).toBeVisible()
})

// This test seems to be failing due to GitHub returning 404 when using
// Playwright (it works fine with a standard browser).
test.skip("Log In with GitHub", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "Log In with GitHub" }).click()

  await expect(page).toHaveURL(/^https:\/\/github\.com\/login/)

  await page
    .getByRole("textbox", { name: "Username or email address" })
    .fill(TEST_GITHUB_USERNAME)

  await page
    .getByRole("textbox", { name: "Password" })
    .fill(TEST_GITHUB_PASSWORD)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()

  await expect(page).toHaveURL("https://github.com/sessions/two-factor/app")

  const code = authenticator.generate(TEST_GITHUB_USER_SECRET)

  await page.locator("#app_totp").fill(code)

  // Handle potential reauthorization page
  const authorizeButton = page.getByRole("button", {
    name: "Authorize FastAPI Cloud Local",
  })
  try {
    await authorizeButton.waitFor({ timeout: 5000 })
    await authorizeButton.click()
  } catch (_error) {
    // Authorization button not found, continue with normal flow
  }

  await expect(page.getByTestId("dashboard-greeting")).toContainText(
    "Hi, Pollo Listo",
  )
})
