import { type APIRequestContext, expect, type Page } from "@playwright/test"
import { findLastEmail } from "./mailcatcher"

export async function logInUser(page: Page, email: string, password: string) {
  await page.waitForLoadState("load")

  await page.goto("/login", { waitUntil: "networkidle" })

  await page.waitForSelector('[data-testid="email-input"]')

  await page.getByTestId("email-input").fill(email)
  await page.getByTestId("password-input").fill(password)
  await page.getByRole("button", { name: "Log In", exact: true }).click()

  await page.waitForURL("/", { waitUntil: "networkidle" })

  await expect(page.getByTestId("dashboard-greeting")).toBeVisible()
}

export async function logOutUser(page: Page) {
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log Out" }).click()
}

export async function sendInvitation(
  page: Page,
  teamSlug: string,
  email: string,
) {
  await page.goto(`/${teamSlug}/settings`)
  await page.getByRole("button", { name: "Invite Member" }).click()
  await page.getByTestId("invitation-email").fill(email)
  await page.getByRole("button", { name: "Send invitation" }).click()
}

export async function viewInvitation(
  page: Page,
  email: string,
  request: APIRequestContext,
) {
  const emailData = await findLastEmail({
    request,
    filter: (e) => e.recipients.includes(`<${email}>`),
    timeout: 5000,
  })

  await page.goto(
    `${process.env.MAILCATCHER_HOST}/messages/${emailData.id}.html`,
  )

  const selector = 'a[href*="/team-invitation?token="]'
  let url = await page.getAttribute(selector, "href")
  url = url!.replace("http://localhost/", "http://localhost:5173/")
  await page.goto(url)
}

export async function createApp(page: Page, teamSlug: string, appName: string) {
  await page.goto(`/${teamSlug}/new-app`)
  await page.getByTestId("app-name-input").fill(appName)
  await page.getByRole("button", { name: "Create App" }).click()
  await expect(page.getByTestId("app-created-success")).toBeVisible()
}
