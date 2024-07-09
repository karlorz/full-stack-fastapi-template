import { expect, test } from "@playwright/test"
import { randomTeamName } from "./utils/random"
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
  const teamsName = new Array(4).fill(null).map(() => randomTeamName())

  for (const teamName of teamsName) {
    await createTeam(page, teamName)
  }
})
