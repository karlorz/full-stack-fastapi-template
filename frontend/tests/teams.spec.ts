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

  await page.goto("/teams/all")
  await page.locator("li").filter({ hasText: teamName }).first().click()
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
    await page.locator("body").click()
    await expect(page.getByText("This field is required")).toBeVisible()
  })

  test("User can delete a team", async ({ page }) => {
    const teamName = randomTeamName()
    const teamSlug = slugify(teamName)
    await createTeam(page, teamName)

    await page.goto(`/${teamSlug}/settings`)

    // TODO: To complete when merge the delete feature
  })
})
