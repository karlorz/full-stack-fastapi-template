import { type Page, expect, test } from "@playwright/test"
import type { AppPublic, TeamPublic } from "../src/client"
import {
  createApp,
  createEnvironmentVariable,
  createTeam,
  createUser,
} from "./utils/privateApi"
import { randomEmail } from "./utils/random"
import { logInUser } from "./utils/userUtils"

async function navigateToConfiguration(
  page: Page,
  teamSlug: string,
  appSlug: string,
) {
  await page.goto(`/${teamSlug}/apps/${appSlug}`)
  await expect(page.getByTestId("tabs")).toBeVisible()
  await page.getByRole("tab", { name: "Configuration" }).click()
}

test.use({ storageState: { cookies: [], origins: [] } })

test.describe("App environment variables", () => {
  let team: TeamPublic
  let app: AppPublic

  test.beforeEach(async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    team = await createTeam({
      name: "Personal",
      ownerId: user.id,
      isPersonalTeam: true,
    })
    app = await createApp({ teamId: team.id, name: "Test App" })

    await logInUser(page, email, password)
  })

  test("Empty state is visible when there are no environment variables", async ({
    page,
  }) => {
    await navigateToConfiguration(page, team.slug, app.slug)
    await expect(page.getByTestId("empty-state")).toBeVisible()
  })

  test("User can add a new environment variable", async ({ page }) => {
    await navigateToConfiguration(page, team.slug, app.slug)
    await page.getByRole("button", { name: "Add Environment Variable" }).click()
    await expect(page.getByRole("button", { name: "Edit" })).not.toBeVisible()

    const nameInput = page.getByPlaceholder("MY_COOL_ENV_VAR")
    const valueInput = page.getByPlaceholder("My secret value")

    await nameInput.fill("API_KEY")
    await valueInput.fill("123456")

    await page.getByRole("button", { name: "Save" }).click()

    await expect(nameInput).toBeDisabled()
    await expect(valueInput).toBeDisabled()
    await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible()
  })

  test("User can edit a existing environment variable", async ({ page }) => {
    await createEnvironmentVariable({
      appId: app.id,
      name: "API_KEY",
      value: "123456",
    })

    await navigateToConfiguration(page, team.slug, app.slug)

    const nameInput = page.getByPlaceholder("MY_COOL_ENV_VAR")
    const valueInput = page.getByPlaceholder("My secret value")

    await expect(nameInput).toHaveValue("API_KEY")
    await expect(valueInput).toHaveValue("123456")
    await expect(nameInput).toBeDisabled()
    await expect(valueInput).toBeDisabled()

    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible()

    await page.getByRole("button", { name: "Edit" }).click()

    await expect(nameInput).toBeEnabled()
    await expect(valueInput).toBeEnabled()

    await nameInput.fill("API_SECRET")
    await valueInput.fill("abcdef")

    await page.getByRole("button", { name: "Save" }).click()

    await expect(nameInput).toBeDisabled()
    await expect(valueInput).toBeDisabled()

    await expect(nameInput).toHaveValue("API_SECRET")
    await expect(valueInput).toHaveValue("abcdef")
    await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible()
  })

  test("User can add a new environment variable when one already exists", async ({
    page,
  }) => {
    await createEnvironmentVariable({
      appId: app.id,
      name: "API_KEY",
      value: "123456",
    })

    await navigateToConfiguration(page, team.slug, app.slug)
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByRole("button", { name: "Add Environment Variable" }).click()

    const environmentVariables = await page
      .getByTestId("environment-variable")
      .all()
    const lastEnvironmentVariable =
      environmentVariables[environmentVariables.length - 1]

    const nameInput =
      lastEnvironmentVariable.getByPlaceholder("MY_COOL_ENV_VAR")
    const valueInput =
      lastEnvironmentVariable.getByPlaceholder("My secret value")

    await nameInput.fill("NEW_KEY")
    await valueInput.fill("abcdef")
    await page.getByRole("button", { name: "Save" }).click()

    await expect(nameInput).toBeDisabled()
    await expect(valueInput).toBeDisabled()

    await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible()
  })

  test("User can delete a environment variable", async ({ page }) => {
    await createEnvironmentVariable({
      appId: app.id,
      name: "API_KEY",
      value: "123456",
    })

    await navigateToConfiguration(page, team.slug, app.slug)
    await page.getByRole("button", { name: "Edit" }).click()

    await page
      .getByTestId("environment-variable")
      .getByLabel("Mark for deletion")
      .click()
    await expect(page.getByLabel("Restore")).toBeVisible()

    await page.getByRole("button", { name: "Save" }).click()

    await expect(page.getByTestId("empty-state")).toBeVisible()
  })
})
