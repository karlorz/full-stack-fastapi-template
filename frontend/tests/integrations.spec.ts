import { expect, test } from "@playwright/test"
import { createTeam, createUser } from "./utils/privateApi"
import { randomEmail } from "./utils/random"
import { logInUser } from "./utils/userUtils"

test.describe("Route Metadata", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Integrations route title", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    const user = await createUser({ email, password })
    await logInUser(page, email, password)

    const teamName = "My Team"
    const team = await createTeam({ name: teamName, ownerId: user.id })

    await page.goto(`/${team.slug}/integrations`)
    await expect(page).toHaveTitle("Integrations - My Team - FastAPI Cloud")
  })
})
