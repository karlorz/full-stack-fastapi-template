import { expect, test } from "@playwright/test"

test("All teams is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByRole("heading", { name: "All Teams" })).toBeVisible()
})

test("All teams table is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByRole("table")).toBeVisible()
})
