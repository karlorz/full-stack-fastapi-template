import { type APIRequestContext, type Page, expect } from "@playwright/test"
import { findLastEmail } from "./mailcatcher"

export async function logInUser(page: Page, email: string, password: string) {
  await page.goto("/login")

  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")

  await expect(
    page.getByText("Welcome back, nice to see you again!"),
  ).toBeVisible()
}

export async function logOutUser(page: Page) {
  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page.goto("/login")
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
  await page.goto(`/${teamSlug}/apps/new`)
  await page.getByPlaceholder("App Name").fill(appName)
  await page.getByRole("button", { name: "Create App" }).click()
  await expect(page.getByTestId("app-created-success")).toBeVisible()
}
