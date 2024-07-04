import { type Page, expect } from "@playwright/test"
import { findLastEmail } from "./mailcatcher"

export async function signUpNewUser(
  page: Page,
  name: string,
  email: string,
  password: string,
  request: any,
) {
  await page.goto("/signup")

  await page.getByPlaceholder("Full Name").fill(name)
  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByPlaceholder("Repeat Password").fill(password)
  await page.getByRole("button", { name: "Sign Up" }).click()

  const emailData = await findLastEmail({
    request,
    filter: (e) => e.recipients.includes(`<${email}>`),
    timeout: 5000,
  })

  await page.goto(`http://localhost:1080/messages/${emailData.id}.html`)

  const selector = 'a[href*="/verify-email?token="]'

  let url = await page.getAttribute(selector, "href")

  url = url!.replace("http://localhost/", "http://localhost:5173/")

  await page.goto(url)

  await expect(page.getByTestId("result")).toContainText(
    "Successful Email Verification",
    { timeout: 5000 },
  )
}

export async function logInUser(page: Page, email: string, password: string) {
  await page.goto("/login")

  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")
}

export async function createTeam(page: Page, name: string) {
  await page.goto("/teams/new")

  await page.getByPlaceholder("Name").fill(name)
  await page.getByRole("button", { name: "Create Team" }).click()
  await page.waitForURL("/teams/all")
  await page.locator("li").filter({ hasText: name }).click()
}
