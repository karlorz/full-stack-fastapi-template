import { type APIRequestContext, type Page, expect } from "@playwright/test"
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

  await expect(
    page.getByText("Welcome back, nice to see you again!"),
  ).toBeVisible()
}

export async function createTeam(page: Page, name: string) {
  await page.goto("/teams/new")

  await page.getByPlaceholder("Name").fill(name)
  await page.getByRole("button", { name: "Create Team" }).click()
  await expect(page.getByText("Team created")).toBeVisible()
}

export async function logOutUser(page: Page, name: string) {
  await page.getByRole("button", { name: name }).click()
  await page.getByRole("menuitem", { name: "Log out" }).click()
  await page.goto("/login")
}

export async function sendInvitation(
  page: Page,
  teamSlug: string,
  email: string,
) {
  await page.goto(`/${teamSlug}/settings`)
  await page.getByRole("button", { name: "New Invitation" }).click()
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

  await page.goto(`http://localhost:1080/messages/${emailData.id}.html`)

  const selector = 'a[href*="/team-invitation?token="]'
  let url = await page.getAttribute(selector, "href")
  url = url!.replace("http://localhost/", "http://localhost:5173/")
  await page.goto(url)
}
