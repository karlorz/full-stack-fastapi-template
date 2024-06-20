import { expect, test } from "@playwright/test"

const sections = ["Details", "Plan", "Payment"]

test("New team is visible", async ({ page }) => {
  await page.goto("/teams/new")
  await expect(page.getByRole("heading", { name: "New Team" })).toBeVisible()
  for (const section of sections) {
    await expect(page.getByRole("heading", { name: section })).toBeVisible()
  }
  await expect(page.getByPlaceholder("Name")).toBeVisible()
  await expect(page.getByRole("button", { name: "Add card" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Create Team" })).toBeVisible()
})
