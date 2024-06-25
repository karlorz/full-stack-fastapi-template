import { expect, test } from "@playwright/test"
import { findLastEmail } from "./utils/mailcatcher"
import { randomEmail } from "./utils/random"

test.use({ storageState: { cookies: [], origins: [] } })

test("Signup", async ({ page, request }) => {
  const email = randomEmail()

  await page.goto("/signup")
  await page.getByPlaceholder("Full Name").fill("Playwright Test")
  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill("changethis")
  await page.getByPlaceholder("Repeat Password").fill("changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  const emailData = await findLastEmail({
    request,
    filter: (e) => e.recipients.includes(`<${email}>`),
    timeout: 5000,
  })

  await page.goto(`http://localhost:1080/messages/${emailData.id}.html`)

  const selector = 'a[href*="/verify-email?token="]'

  let url = await page.getAttribute(selector, "href")

  // TODO: update var instead of doing a replace
  url = url!.replace("http://localhost/", "http://localhost:5173/")

  await page.goto(url)

  await expect(page.getByTestId("result")).toContainText(
    "Successful Email Verification",
    { timeout: 5000 },
  )
})
