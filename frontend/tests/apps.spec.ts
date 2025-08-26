import { expect, test } from "@playwright/test"
import type { AppPublic, TeamPublic } from "@/client"
import {
  createApp as createAppViaApi,
  createTeam,
  createUser,
} from "./utils/privateApi"
import {
  randomAppName,
  randomEmail,
  randomTeamName,
  slugify,
} from "./utils/random"
import { createApp, logInUser } from "./utils/userUtils"

test.describe("Route Metadata", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  let team: TeamPublic
  let app: AppPublic

  test.beforeEach(async ({ page }) => {
    const email = randomEmail()
    const password = "password"
    const teamName = "My Team"

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })
    app = await createAppViaApi({ teamId: team.id, name: "Test App" })

    await logInUser(page, email, password)
  })

  test("App details general tab route title", async ({ page }) => {
    await page.goto(`/${team.slug}/apps/${app.slug}/general`)
    await expect(page).toHaveTitle(
      "General - Test App - My Team - FastAPI Cloud",
    )
  })

  test("App details configuration tab route title", async ({ page }) => {
    await page.goto(`/${team.slug}/apps/${app.slug}/configuration`)
    await expect(page).toHaveTitle(
      "Configuration - Test App - My Team - FastAPI Cloud",
    )
  })

  test("App details logs tab route title", async ({ page }) => {
    await page.goto(`/${team.slug}/apps/${app.slug}/logs`)
    await expect(page).toHaveTitle("Logs - Test App - My Team - FastAPI Cloud")
  })

  test("New app route title", async ({ page }) => {
    await page.goto(`/${team.slug}/new-app`)
    await expect(page).toHaveTitle("New App - My Team - FastAPI Cloud")
  })

  test("App list route title", async ({ page }) => {
    await page.goto(`/${team.slug}/apps`)
    await expect(page).toHaveTitle("Apps - My Team - FastAPI Cloud")
  })
})

test.describe("Apps empty states", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const password = "password"

  test("Empty state is visible when there are no apps", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })

    await logInUser(page, email, password)

    await page.goto(`/${team.slug}/apps/`)
    await expect(
      page.getByRole("heading", { name: "No applications yet" }),
    ).toBeVisible()
    await page.getByRole("link", { name: "Create Your First App" }).click()
  })
})

test.describe("User can manage apps succesfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const password = "password"

  test("User can create a new app", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const appName = randomAppName()
    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })
    await logInUser(page, email, password)

    await page.goto(`/${team.slug}/new-app`)
    await page.getByTestId("app-name-input").fill(appName)
    await page.getByRole("button", { name: "Create App" }).click()
    await page
      .getByText(`App "${appName}" created successfully`)
      .waitFor({ state: "visible" })
    await page.waitForURL(`**/${team.slug}/apps/**`, { timeout: 5000 })
  })

  test("User can read all apps", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const appNames = [randomAppName(), randomAppName(), randomAppName()]
    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })
    await logInUser(page, email, password)

    for (const appName of appNames) {
      await createApp(page, team.slug, appName)
    }

    await page.goto(`/${team.slug}/apps`)

    for (const appName of appNames) {
      await expect(page.getByRole("link", { name: appName })).toBeVisible()
    }
  })

  test("User can delete an app", async ({ page }) => {
    const email = randomEmail()
    const teamName = randomTeamName()

    const appName = randomAppName()
    const appSlug = slugify(appName)

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })
    await logInUser(page, email, password)
    await createApp(page, team.slug, appName)

    await page.goto(`/${team.slug}/apps`)
    await expect(page.getByRole("link", { name: appName })).toBeVisible()

    await page.getByRole("link", { name: appName }).click()
    await page.goto(`/${team.slug}/apps/${appSlug}`)

    await page.getByRole("button", { name: "Delete App" }).click()
    await expect(page.getByTestId("delete-confirmation-app")).toBeVisible()
    await page
      .getByPlaceholder(`Type "delete app ${appSlug}" to confirm`)
      .fill(`delete app ${appSlug}`)
    await page.getByRole("button", { name: "Delete App" }).click()
    await expect(page.getByText("Success!", { exact: true })).toBeVisible()
  })
})
