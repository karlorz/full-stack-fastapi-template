import { expect, test } from "@playwright/test"
import { randomTeamName } from "./utils/random"

test("New team is visible", async ({ page }) => {
  await page.goto("/teams/new")
  await expect(page.getByRole("heading", { name: "New Team" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Name" })).toBeVisible()
  await expect(page.getByPlaceholder("Team Name")).toBeVisible()
  // TODO: Uncomment these lines when billing is implemented
  // await expect(page.getByText("Pricing Plan")).toBeVisible()
  // await expect(page.getByText("Payment")).toBeVisible()
  // await expect(page.getByRole("button", { name: "Add card" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Create Team" })).toBeVisible()
})

test("User can create a new team with a valid name successfully", async ({
  page,
}) => {
  const teamName = randomTeamName()
  await page.goto("/teams/new")

  await page.getByPlaceholder("Team Name").fill(teamName)
  await page.getByRole("button", { name: "Create Team" }).click()
  await expect(
    page.getByText(`Your team ${teamName} has been created successfully`),
  ).toBeVisible()
})

test("Validation messages are displayed for missing team name", async ({
  page,
}) => {
  await page.goto("/teams/new")

  await page.getByRole("button", { name: "Create Team" }).click()
  await expect(page.getByText("Name is required")).toBeVisible()
})
