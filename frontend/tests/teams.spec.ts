import { expect, test } from "@playwright/test"
import { randomTeamName, slugify } from "./utils/random"
import { createTeam } from "./utils/userUtils"

test("Each user has its own personal team which is the default team", async ({
  page,
}) => {
  await page.goto("/")
  await expect(
    page.getByRole("button", { name: "fastapi admin" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "fastapi admin" }).click()
  await page.getByRole("menuitem", { name: "View all teams" }).click()
  await expect(page.getByRole("link", { name: "fastapi admin" })).toBeVisible()
})

test("User can successfully change the current team from the user menu", async ({
  page,
}) => {
  const teamName = randomTeamName()
  const teamSlug = slugify(teamName)
  await createTeam(page, teamName)

  await page.goto(`/${teamSlug}`)
  await expect(page.getByRole("button", { name: teamName })).toBeVisible()
  await page.getByRole("button", { name: teamName }).click()
  await page.waitForSelector('role=menuitem[name="fastapi admin"]')
  await page.getByRole("menuitem", { name: "fastapi admin" }).click()
  await expect(
    page.getByRole("button", { name: "fastapi admin" }),
  ).toBeVisible()
})

test("User can successfully change the current team from the user's list of teams", async ({
  page,
}) => {
  const teamName = randomTeamName()
  const teamSlug = slugify(teamName)
  await createTeam(page, teamName)

  await page.goto("/teams/all?orderBy=created_at&order=desc")
  await page.waitForSelector(`a:has-text("${teamName}")`)
  await page.locator("a").filter({ hasText: teamName }).first().click()
  await page.waitForSelector(`button:has-text("${teamName}")`)
  await page.goto(`/${teamSlug}`)
  await expect(page.getByRole("button", { name: teamName })).toBeVisible()
})

test("Selected team is reflected in team settings", async ({ page }) => {
  const teamName = randomTeamName()
  const teamSlug = slugify(teamName)
  await createTeam(page, teamName)

  await page.goto(`/${teamSlug}/settings`)
  await page.getByLabel("Team", { exact: true }).getByText(teamName).click()
})

test.describe("User with admin role can update team information", () => {
  test("User can update team name", async ({ page }) => {
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    const newTeamName = randomTeamName()
    await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.locator("#name").click()
    await page.locator("#name").fill(newTeamName)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(
      page.getByLabel("Team", { exact: true }).getByText(newTeamName),
    ).toBeVisible()
  })

  test("Validation messages are displayed for missing team name", async ({
    page,
  }) => {
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.locator("#name").click()
    await page.locator("#name").fill("")
    await expect(page.getByText("This field is required")).toBeVisible()
  })

  test("User can delete a team", async ({ page }) => {
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

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
