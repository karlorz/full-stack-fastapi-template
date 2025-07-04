import { test as setup } from "@playwright/test"
import { createUser } from "./utils/privateApi"
import { randomEmail } from "./utils/random"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  const email = randomEmail()
  const password = "changethis"

  const user = await createUser({
    email,
    password,
  })

  process.env.USER_ID = user.id
  process.env.USER_EMAIL = email

  await page.goto("/login")
  await page.getByTestId("email-input").fill(email)
  await page.getByTestId("password-input").fill(password)
  await page.getByRole("button", { name: "Log In", exact: true }).click()
  await page.waitForURL("/")
  await page.context().storageState({ path: authFile })
})
