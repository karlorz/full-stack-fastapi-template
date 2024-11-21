import { expect, test } from "@playwright/test"
import { createTeam, createUser } from "./utils/privateApi"
import {
  randomAppName,
  randomEmail,
  randomTeamName,
  slugify,
} from "./utils/random"
import { createApp, logInUser } from "./utils/userUtils"

test.describe("404 Not Found when invalid URL", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  const password = "password"
  let email: string
  let user: any

  test.beforeEach(async ({ page }) => {
    email = randomEmail()
    user = await createUser({ email, password })
    await logInUser(page, email, password)
  })

  test("Display 404 for invalid team URL", async ({ page }) => {
    const teamName = randomTeamName()
    const team = await createTeam({ name: teamName, ownerId: user.id })

    await page.goto(`/teams/${team.slug}-not-found`)
    await expect(page.getByTestId("not-found")).toBeVisible()
  })

  test("Display 404 for invalid app URL", async ({ page }) => {
    const teamName = randomTeamName()
    const appName = randomAppName()
    const appSlug = slugify(appName)

    const team = await createTeam({
      name: teamName,
      ownerId: user.id,
      isPersonalTeam: true,
    })
    await createApp(page, team.slug, appName)

    await page.goto(`/${team.slug}/apps/${appSlug}-not-found`)
    await expect(page.getByTestId("not-found")).toBeVisible()
  })
})
