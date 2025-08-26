import { expect, test } from "@playwright/test"

test.describe("Route Metadata", () => {
  test("New team route title", async ({ page }) => {
    await page.goto("/teams/new")
    await expect(page).toHaveTitle("New Team - FastAPI Cloud")
  })
})

test("New team is visible", async ({ page }) => {
  await page.goto("/teams/new")
  await expect(page.getByRole("heading", { name: "New Team" })).toBeVisible()
  await expect(page.getByTestId("team-name")).toBeVisible()

  // TODO: Uncomment these lines when billing is implemented
  // await expect(page.getByText("Pricing Plan")).toBeVisible()
  // await expect(page.getByText("Payment")).toBeVisible()
  // await expect(page.getByRole("button", { name: "Add card" })).toBeVisible()
})

// Team creation is disabled for beta users

test("User cannot create a new team when team creation is disabled", async ({
  page,
}) => {
  await page.goto("/teams/new")
  await expect(page.getByRole("button", { name: "Create Team" })).toBeDisabled()
})

// test("User can create a new team with a valid name successfully", async ({
//   page,
// }) => {
//   const teamName = randomTeamName()
//   await page.goto("/teams/new")

//   await page.getByTestId("team-name-input").fill(teamName)
//   await page.getByRole("button", { name: "Create Team" }).click()
//   await expect(
//     page.getByText(`Your team ${teamName} has been created successfully`),
//   ).toBeVisible()
// })

// test("Validation messages are displayed for missing team name", async ({
//   page,
// }) => {
//   await page.goto("/teams/new")

//   await page.getByRole("button", { name: "Create Team" }).click()
//   await expect(page.getByText("Name is required")).toBeVisible()
// })
