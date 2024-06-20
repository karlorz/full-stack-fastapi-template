import { type Page, expect, test } from "@playwright/test"

const links = ["Dashboard", "Projects", "Resources", "Settings", "Help"]

const navigateAndCheck = async (
  page: Page,
  link: string,
  headingName: string,
) => {
  await page.getByRole("link", { name: link }).click()
  await expect(page.getByRole("heading", { name: headingName })).toBeVisible()
}

test("Sidebar contains all necessary links", async ({ page }) => {
  await page.goto("/")
  for (const link of links) {
    await expect(page.getByRole("link", { name: link })).toBeVisible()
  }
})

test("Sidebar links navigate to correct pages", async ({ page }) => {
  await page.goto("/")
  await navigateAndCheck(page, "Projects", "Projects")
  await navigateAndCheck(page, "Resources", "Resources")
  await navigateAndCheck(page, "Settings", "Settings")
  await navigateAndCheck(page, "Help", "Help")
})

// TODO: Add a test that checks if the active link is highlighted
