import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"

const tabs = ["My profile", "Password", "Appearance", "Danger zone"]

test("User settings correctly displays all tabs", async ({ page }) => {
  await page.goto("/settings")
  await expect(
    page.getByRole("heading", { name: "User Settings" }),
  ).toBeVisible()
  await expect(page.getByText("View and manage settings")).toBeVisible()
  for (const tab of tabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible()
  }
})

// My profile

test("My profile tab is active by default", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.getByRole("tab", { name: "My profile" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})

test("My profile tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "My profile" }).click()
  await expect(page.getByLabel("My profile")).toBeVisible()
})

// Password

test("Password tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Password" }).click()
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
})

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await expect(page.getByLabel("Appearance")).toBeVisible()
})

// Danger zone

test("Danger zone tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Danger zone" }).click()
  await expect(page.getByLabel("Danger zone")).toBeVisible()
})
