import { expect, test } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import { randomEmail, randomTeamName } from "./utils/random"
import { createTeam, logInUser } from "./utils/userUtils"

test.describe("Select and change team successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Each user has its own personal team which is the default team", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = "password"

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.goto("/")
    await expect(page.getByTestId("team-selector")).toContainText(
      "Personal Team",
    )
  })

  test("Change the current team from the team selector", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({ email, password })
    await logInUser(page, email, password)

    const teamName = randomTeamName()
    const teamSlug = await createTeam(page, teamName)

    await page.goto(`/${teamSlug}`)
    await page.getByTestId("team-selector").click()
    await page.getByRole("menuitem", { name: user.full_name }).click()
    await expect(
      page.getByRole("button", { name: user.full_name }),
    ).toBeVisible()

    // Check if the team is visible in the team settings

    await page.goto(`/${teamSlug}/settings`)
    await expect(
      page.locator("form").filter({ hasText: teamName }).getByRole("paragraph"),
    ).toBeVisible()
  })

  test("Change the current team from the user's list of teams", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = "password"

    await createUser({ email, password })
    await logInUser(page, email, password)

    const teamName = randomTeamName()
    const teamSlug = await createTeam(page, teamName)
    await page.goto("/teams/all?orderBy=created_at&order=desc")
    await page.getByRole("link", { name: teamName }).click()
    await expect(page.getByRole("button", { name: teamName })).toBeVisible()

    // Check if the team is visible in the team settings
    await page.goto(`/${teamSlug}/settings`)
    await expect(
      page.locator("form").filter({ hasText: teamName }).getByRole("paragraph"),
    ).toBeVisible()
  })
})

test.describe("User with admin role can update team information", () => {
  test("User can update team name", async ({ page }) => {
    const teamName = randomTeamName()
    const newTeamName = randomTeamName()
    const teamSlug = await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.locator("#name").click()
    await page.locator("#name").fill(newTeamName)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(
      page
        .locator("form")
        .filter({ hasText: newTeamName })
        .getByRole("paragraph"),
    ).toBeVisible()
  })

  test("Validation messages are displayed for missing team name", async ({
    page,
  }) => {
    const teamName = randomTeamName()
    const teamSlug = await createTeam(page, teamName)
    await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.locator("#name").click()
    await page.locator("#name").fill("")
    await expect(page.getByText("Name is required")).toBeVisible()
  })

  test("User can delete a team", async ({ page }) => {
    const teamName = randomTeamName()
    const teamSlug = await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)

    await page.getByRole("button", { name: "Delete Team" }).click()
    await expect(page.getByTestId("delete-confirmation-team")).toBeVisible()
    await page.getByLabel("Confirmation").fill(`delete team ${teamSlug}`)
    await page.getByRole("button", { name: "Confirm" }).click()
    await expect(page.getByText("The team was deleted")).toBeVisible()

    // Check if the team is not visible in the list of teams
    await page.goto("/teams/all")
    await expect(page.getByRole("link", { name: teamName })).not.toBeVisible()
  })
})
