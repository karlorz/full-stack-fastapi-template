import { expect, test } from "@playwright/test"

test("Redirects to /login when token is wrong", async ({ page }) => {
  // we currently store the token in localStorage, so in order to change it
  // we need to navigate to a page first and then change it
  await page.goto("/settings")

  await page.evaluate(() => {
    localStorage.setItem("access_token", "invalid_token")
  })

  await page.goto("/settings")
  await page.waitForURL("/login")
  await expect(page).toHaveURL("/login")
})
