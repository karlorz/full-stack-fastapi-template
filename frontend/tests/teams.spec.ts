import { expect, test } from "@playwright/test"
import { addUserToTeam, createTeam, createUser } from "./utils/privateApi"
import { randomEmail, randomTeamName } from "./utils/random"
import { logInUser } from "./utils/userUtils"

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
    const team = await createTeam({ name: teamName, ownerId: user.id })

    await page.goto(`/${team.slug}`)
    await page.getByTestId("team-selector").click()
    await page.getByRole("link", { name: user.full_name }).click()
    await expect(page.getByTestId("team-selector")).toContainText(
      user.full_name,
    )
  })

  test("Change the current team from the user's list of teams", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({ email, password })
    await logInUser(page, email, password)

    const teamName = randomTeamName()
    const team = await createTeam({ name: teamName, ownerId: user.id })

    await page.goto("/teams/all")
    await page.getByRole("link", { name: new RegExp(teamName) }).click()
    await page.goto(`/${team.slug}`)
    await expect(page.getByTestId("team-selector")).toContainText(teamName)
  })
})

test.describe("Admin transfer team successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Admin can transfer team ownership to another user", async ({
    page,
  }) => {
    const ownerEmail = randomEmail()
    const password = "password"
    const teamName = randomTeamName()

    const owner = await createUser({ email: ownerEmail, password })
    const team = await createTeam({ name: teamName, ownerId: owner.id })

    const newOwnerEmail = randomEmail()
    const newOwner = await createUser({ email: newOwnerEmail, password })
    await addUserToTeam({ teamId: team.id, userId: newOwner.id, role: "admin" })

    await logInUser(page, ownerEmail, password)

    await page.goto(`/${team.slug}/settings`)

    await page.getByTestId("user-select").click()
    await page.getByRole("option", { name: newOwnerEmail }).click()

    await page.getByRole("button", { name: "Transfer Team" }).click()

    await expect(
      page.getByText("The team was transferred successfully"),
    ).toBeVisible()
  })
})

test.describe("User with admin role can update team information", () => {
  test("User can update team name", async ({ page }) => {
    const teamName = randomTeamName()
    const newTeamName = randomTeamName()
    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })

    await page.goto(`/${team.slug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByTestId("team-name-input").fill(newTeamName)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Team updated successfully")).toBeVisible()
    await expect(page.getByTestId("team-selector")).toContainText(newTeamName)
  })

  test("Validation messages are displayed for missing team name", async ({
    page,
  }) => {
    const teamName = randomTeamName()
    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })

    await page.goto(`/${team.slug}/settings`)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByTestId("team-name-input").fill("")
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Name is required")).toBeVisible()
  })

  test("User can delete a team", async ({ page }) => {
    const teamName = randomTeamName()
    const team = await createTeam({
      name: teamName,
      ownerId: process.env.USER_ID!,
    })

    await page.goto(`/${team.slug}/settings`)

    await page.getByRole("button", { name: "Delete Team" }).click()
    await expect(page.getByTestId("delete-confirmation-team")).toBeVisible()
    await page
      .getByPlaceholder(`Type "delete team ${team.slug}" to confirm`)
      .fill(`delete team ${team.slug}`)
    await page.getByRole("button", { name: "Confirm" }).click()
    await expect(page.getByText("The team was deleted")).toBeVisible()
  })
})
