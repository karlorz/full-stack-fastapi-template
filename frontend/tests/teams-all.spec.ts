import { expect, test } from "@playwright/test"
import { createTeam } from "./utils/userUtils"

test("All teams is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByRole("heading", { name: "All Teams" })).toBeVisible()
})

test("All teams table is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByRole("list")).toBeVisible()
})

test("User can see all teams they belong to", async ({ page }) => {
  const teamsName = ["Team 1", "Team 2", "Team 3", "Team 4"]

  for (const teamName of teamsName) {
    await createTeam(page, teamName)
  }
})
