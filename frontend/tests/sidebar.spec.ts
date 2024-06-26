import { type Page, expect, test } from "@playwright/test"

const links = ["Dashboard", "Projects", "Resources", "Settings", "Help"]

const navigateAndCheck = async (page: Page, link: string, text: string) => {
  await page.getByRole("link", { name: link }).click()
  if (link === "Dashboard") {
    await expect(page.getByText(text)).toBeVisible()
  } else {
    await expect(page.getByRole("heading", { name: text })).toBeVisible()
  }
}

test("Sidebar contains all necessary links", async ({ page }) => {
  await page.goto("/")
  for (const link of links) {
    await expect(page.getByRole("link", { name: link })).toBeVisible()
  }
})

test("Sidebar links navigate to correct pages", async ({ page }) => {
  await page.goto("/")
  await navigateAndCheck(page, "Dashboard", "Welcome back, nice to see you")
  await navigateAndCheck(page, "Projects", "Projects")
  await navigateAndCheck(page, "Resources", "Resources")
  await navigateAndCheck(page, "Settings", "Settings")
  await navigateAndCheck(page, "Help", "Help")
})

test("Active link is highlighted", async ({ page }) => {
  await page.goto("/")
  for (const link of links) {
    await page.getByRole("link", { name: link }).click()
    await expect(page.getByRole("link", { name: link })).toHaveAttribute(
      "data-status",
      "active",
    )
  }
})
