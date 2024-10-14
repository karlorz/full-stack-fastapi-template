// TODO: Uncomment tests for team settings when billing is implemented

// import { expect, test } from "@playwright/test"

// const tabs = ["Team", "Billing"]

// test("Team settings correctly displays all tabs", async ({ page }) => {
//   await page.goto("/admin/settings")
//   await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
//   await expect(
//     page.getByText("View and manage settings related to your team."),
//   ).toBeVisible()
//   for (const tab of tabs) {
//     await expect(page.getByRole("tab", { name: tab })).toBeVisible()
//   }
// })

// Team Information

// test("Team tab is active by default", async ({ page }) => {
//   await page.goto("/admin/settings")
//   await expect(page.getByRole("tab", { name: "Team" })).toHaveAttribute(
//     "aria-selected",
//     "true",
//   )
// })

// test("Team tab is visible", async ({ page }) => {
//   await page.goto("/admin/settings")
//   await page.getByRole("tab", { name: "Team" }).click()
//   await expect(page.getByLabel("Team")).toBeVisible()
// })

// Billing

// test("Billing tab is visible", async ({ page }) => {
//   await page.goto("/admin/settings")
//   await page.getByRole("tab", { name: "Billing" }).click()
//   await page.getByLabel("Billing", { exact: true }).click()
// })
