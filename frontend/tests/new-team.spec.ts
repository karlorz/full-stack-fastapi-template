import { expect, test } from "@playwright/test"
import { randomTeamName } from "./utils/random"

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

test("User can create a new team with a valid name successfully", async ({
  page,
}) => {
  const teamName = randomTeamName()
  await page.goto("/teams/new")

  await page.getByPlaceholder("Name").fill(teamName)
  await page.getByRole("button", { name: "Create Team" }).click()

  // The new team should be visible in the list of teams
  await page.goto("/teams/all?orderBy=created_at&order=desc")
  await page.locator("a").filter({ hasText: teamName }).click()
})

test("Validation messages are displayed for missing team name", async ({
  page,
}) => {
  await page.goto("/teams/new")

  await page.getByRole("button", { name: "Create Team" }).click()
  await expect(page.getByText("Name is required")).toBeVisible()
})
