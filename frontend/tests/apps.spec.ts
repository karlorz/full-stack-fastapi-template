import { expect, test } from "@playwright/test"
import {
  randomAppName,
  randomEmail,
  randomTeamName,
  slugify,
} from "./utils/random"
import {
  createApp,
  createTeam,
  logInUser,
  signUpNewUser,
} from "./utils/userUtils"

test.describe("Apps empty states", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const fullName = "Test User"
  const password = "password"

  test("Empty state is visible when there are no apps", async ({
    page,
    request,
  }) => {
    const email = randomEmail()
    const team = randomTeamName()

    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    const teamSlug = await createTeam(page, team)

    await page.goto(`/${teamSlug}/apps/`)
    await expect(
      page.getByRole("heading", { name: "You don't have any app yet" }),
    ).toBeVisible()
    await expect(page.getByTestId("fastapi-cli")).toBeVisible()
    await page.getByRole("link", { name: "Create App" }).click()
  })
})

test.describe("User can manage apps succesfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const fullName = "Test User"
  const password = "password"

  test("User can create a new app", async ({ page, request }) => {
    const email = randomEmail()
    const team = randomTeamName()

    const appName = randomAppName()
    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    const teamSlug = await createTeam(page, team)

    await page.goto(`/${teamSlug}/apps/new`)
    await page.getByPlaceholder("App Name").fill(appName)
    await page.getByRole("button", { name: "Create App" }).click()
    await expect(page.getByText("App created")).toBeVisible()
  })

  test("User can read all apps", async ({ page, request }) => {
    const email = randomEmail()
    const team = randomTeamName()

    const appNames = [randomAppName(), randomAppName(), randomAppName()]
    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    const teamSlug = await createTeam(page, team)

    for (const appName of appNames) {
      await createApp(page, teamSlug, appName)
    }

    await page.goto(`/${teamSlug}/apps`)

    for (const appName of appNames) {
      await expect(page.getByRole("cell", { name: appName })).toBeVisible()
    }
  })

  test("User can delete an app", async ({ page, request }) => {
    const email = randomEmail()
    const team = randomTeamName()

    const appName = randomAppName()
    const appSlug = slugify(appName)

    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    const teamSlug = await createTeam(page, team)
    await createApp(page, teamSlug, appName)

    await page.goto(`/${teamSlug}/apps`)
    await expect(page.getByRole("cell", { name: appName })).toBeVisible()

    await page.getByRole("link", { name: appName }).click()
    await page.goto(`/${teamSlug}/apps/${appSlug}`)

    await page.getByRole("button", { name: "Delete App" }).click()
    await expect(page.getByTestId("delete-confirmation-app")).toBeVisible()
    await page.getByLabel("Confirmation").fill(`delete app ${appSlug}`)
    await page.getByRole("button", { name: "Confirm" }).click()
    await expect(page.getByText("Success", { exact: true })).toBeVisible()
  })
})
