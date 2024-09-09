import { expect, test } from "@playwright/test"
import {
  randomAppName,
  randomEmail,
  randomTeamName,
  slugify,
} from "./utils/random"
import { createTeam, logInUser, signUpNewUser } from "./utils/userUtils"

test.describe("Apps empty states", () => {
  test("Empty state is visible when there are no apps", async ({ page }) => {
    await page.goto("/admin/apps/")
    await expect(
      page.getByRole("heading", { name: "You don't have any app yet" }),
    ).toBeVisible()
  })

  test("FastAPI CLI instructions are visible", async ({ page, request }) => {
    await page.goto("/admin/apps/")
    await expect(page.getByTestId("fastapi-cli")).toBeVisible()
  })

  test("Create button is visible and navigates correctly", async ({ page }) => {
    await page.goto("/admin/apps/")
    await page.getByRole("link", { name: "Create App" }).click()
    await expect(page).toHaveURL("/admin/apps/new")
  })
})

test.describe("User can manage apps succesfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const fullName = "Test User"
  const email = randomEmail()
  const password = "password"
  const team = randomTeamName()
  const teamSlug = slugify(team)

  test("User can create a new app", async ({ page, request }) => {
    const appName = randomAppName()
    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    await createTeam(page, team)

    await page.goto(`/${teamSlug}/apps/new`)
    await page.getByPlaceholder("Name").fill(appName)
    await page.getByRole("button", { name: "Create App" }).click()
    await expect(page.getByText("App created successfully")).toBeVisible()
  })

  test("User can read all apps", async ({ page, request }) => {
    const appName = randomAppName()
    await signUpNewUser(page, fullName, email, password, request)
    await logInUser(page, email, password)
    await createTeam(page, team)

    await page.goto(`/${teamSlug}/apps/new`)
    await page.getByPlaceholder("Name").fill(appName)
    await page.getByRole("button", { name: "Create App" }).click()
    await expect(page).toHaveURL(`/${teamSlug}/apps`)
    await expect(page.getByRole("cell", { name: appName })).toBeVisible()
  })
})
