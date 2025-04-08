import { expect, test } from "@playwright/test"
import { createTeam } from "./utils/privateApi"
import { randomTeamName } from "./utils/random"

test("All teams is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByRole("heading", { name: "Teams" })).toBeVisible()
})

test("All teams table is visible", async ({ page }) => {
  await page.goto("/teams/all")
  await expect(page.getByTestId("teams-table")).toBeVisible()
})

test("User can see all teams they belong to", async ({ page }) => {
  const teamsName = new Array(4).fill(null).map(() => randomTeamName())

  for (const teamName of teamsName) {
    await createTeam({ name: teamName, ownerId: process.env.USER_ID! })
  }

  await page.goto("/teams/all")

  for (const teamName of teamsName) {
    await expect(
      page.getByRole("link", { name: new RegExp(teamName) }),
    ).toBeVisible()
  }
})
