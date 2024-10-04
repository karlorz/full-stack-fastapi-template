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

test.describe("View single deployment", () => {
  test("Shows basic info", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({ email, password })
    const team = await createTeam({ name: "Personal", ownerId: user.id })
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
})
