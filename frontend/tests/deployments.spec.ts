import { expect, test } from "@playwright/test"
import {
  createApp,
  createDeployment,
  createTeam,
  createUser,
} from "./utils/privateApi"
import { randomEmail } from "./utils/random"
import { logInUser } from "./utils/userUtils"

test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Route Metadata", () => {
  test("Deployment details route title", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: "My Team",
      ownerId: user.id,
      isPersonalTeam: true,
    })
    const app = await createApp({ teamId: team.id, name: "Test App" })
    const deployment = await createDeployment({ appId: app.id })

    await logInUser(page, email, password)

    await page.goto(
      `/${team.slug}/apps/${app.slug}/deployments/${deployment.id}`,
    )
    await expect(page).toHaveTitle(
      "Deployments - Test App - My Team - FastAPI Cloud",
    )
  })
})

test.describe("View single deployment", () => {
  test("Shows basic info", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: "Personal",
      ownerId: user.id,
      isPersonalTeam: true,
    })
    const app = await createApp({ teamId: team.id, name: "Test App" })
    const deployment = await createDeployment({ appId: app.id })

    await logInUser(page, email, password)

    await page.goto(
      `/${team.slug}/apps/${app.slug}/deployments/${deployment.id}`,
    )

    await expect(
      page.getByRole("heading", { name: "Deployment Details" }),
    ).toBeVisible()
    await expect(page.getByText("Waiting Upload")).toBeVisible()
  })

  test("Navigate to deployment details from logs tab", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({
      email,
      password,
      createPersonalTeam: false,
    })
    const team = await createTeam({
      name: "Personal",
      ownerId: user.id,
      isPersonalTeam: true,
    })
    const app = await createApp({ teamId: team.id, name: "Test App" })
    const deployment = await createDeployment({ appId: app.id })

    await logInUser(page, email, password)

    await page.goto(`/${team.slug}/apps/${app.slug}/logs`)

    await expect(
      page.getByRole("tab", { name: "Logs", selected: true }),
    ).toBeVisible()

    await expect(
      page.getByRole("heading", { name: "Deployments Logs" }),
    ).toBeVisible()

    await page.getByRole("button", { name: "View Details" }).first().click()

    await expect(page).toHaveURL(
      `/${team.slug}/apps/${app.slug}/deployments/${deployment.id}`,
    )
    await expect(
      page.getByRole("heading", { name: "Deployment Details" }),
    ).toBeVisible()
  })
})
