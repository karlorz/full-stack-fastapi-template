import { expect, test } from "@playwright/test"
import { createTeam, createUser } from "./utils/privateApi"
import {
  randomAppName,
  randomEmail,
  randomTeamName,
  slugify,
} from "./utils/random"
import { createApp, logInUser } from "./utils/userUtils"

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
      page.getByRole("heading", { name: "You don't have any app yet" }),
    ).toBeVisible()
    await expect(page.getByTestId("fastapi-cli")).toBeVisible()
    await page.getByRole("link", { name: "Create App" }).click()
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
    await page.getByPlaceholder("App Name").fill(appName)
    await page.getByRole("button", { name: "Create App" }).click()
    await expect(page.getByText("App created")).toBeVisible()
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
    await page.getByRole("button", { name: "Confirm" }).click()
    await expect(page.getByText("Success!", { exact: true })).toBeVisible()
  })
})
