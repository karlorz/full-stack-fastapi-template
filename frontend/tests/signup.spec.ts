import { type Page, expect, test } from "@playwright/test"
import { findLastEmail } from "./utils/mailcatcher"
import { randomEmail } from "./utils/random"

test.use({ storageState: { cookies: [], origins: [] } })

type OptionsType = {
  exact?: boolean
}

const fillForm = async (
  page: Page,
  full_name: string,
  email: string,
  password: string,
  confirm_password: string,
) => {
  await page.getByPlaceholder("Full Name").fill(full_name)
  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password", { exact: true }).fill(password)
  await page.getByPlaceholder("Confirm Password").fill(confirm_password)
}

const verifyInput = async (
  page: Page,
  placeholder: string,
  options?: OptionsType,
) => {
  const input = page.getByPlaceholder(placeholder, options)
  await expect(input).toBeVisible()
  await expect(input).toHaveText("")
  await expect(input).toBeEditable()
}

test("Sign Up title is visible", async ({ page }) => {
  await page.goto("/signup")

  await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible()
})

test("Inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/signup")

  await verifyInput(page, "Full Name")
  await verifyInput(page, "Email")
  await verifyInput(page, "Password", { exact: true })
  await verifyInput(page, "Confirm Password")
})

test("Sign Up button is visible", async ({ page }) => {
  await page.goto("/signup")

  await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible()
})

// test("Log In link is visible", async ({ page }) => {
//   await page.goto("/signup")

//   await expect(page.getByRole("link", { name: "Log In" })).toBeVisible()
// })

test("Terms and Privacy Policy links are visible", async ({ page }) => {
  await page.goto("/signup")

  await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Terms" })).toBeVisible()
})

// This also includes the successful email verification flow
test("Sign up with valid name, email, and password", async ({
  page,
  request,
}) => {
  const email = randomEmail()

  await page.goto("/signup")
  await fillForm(page, "Playwright Test", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  // Check if the user is redirected to the one more step page
  await expect(page.getByTestId("email-sent")).toContainText("One More Step", {
    timeout: 1000,
  })

  const emailData = await findLastEmail({
    request,
    filter: (e) => e.recipients.includes(`<${email}>`),
    timeout: 5000,
  })

  await page.goto(
    `${process.env.MAILCATCHER_HOST}/messages/${emailData.id}.html`,
  )

  const selector = 'a[href*="/verify-email?token="]'

  let url = await page.getAttribute(selector, "href")

  // TODO: update var instead of doing a replace
  url = url!.replace("http://localhost/", "http://localhost:5173/")

  // Check if the user is redirected to the email verification success page
  await page.goto(url)

  await expect(page.getByTestId("result")).toContainText(
    "Successful Email Verification",
    { timeout: 5000 },
  )
})

test("Sign up with invalid email", async ({ page }) => {
  await page.goto("/signup")

  await fillForm(
    page,
    "Playwright Test",
    "invalid-email",
    "changethis",
    "changethis",
  )
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(page.getByText("Invalid email address")).toBeVisible()
})

test("Sign up with existing email", async ({ page }) => {
  const email = randomEmail()

  // Sign up with an email
  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  // Sign up again with the same email
  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await page
    .getByText("The user with this email already exists in the system")
    .click()
})

test("Sign up with weak password", async ({ page }) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "weak", "weak")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible()
})

test("Sign up with mismatched passwords", async ({ page }) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "changethis", "changethat")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(page.getByText("Passwords do not match")).toBeVisible()
})

test("Sign up with missing full name", async ({ page }) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(page.getByText("Name is required")).toBeVisible()
})

test("Sign up with missing email", async ({ page }) => {
  await page.goto("/signup")

  await fillForm(page, "Playwright Test", "", "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(page.getByText("Email is required")).toBeVisible()
})

test("Sign up with missing password", async ({ page }) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "", "")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await expect(page.getByText("Password is required")).toBeVisible()
})

// Email verification

test("User cannot login without verifying email", async ({ page }) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  await page.goto("/login")
  await page.getByPlaceholder("Email").fill(email)
  await page.getByPlaceholder("Password").fill("changethis")
  await page.getByRole("button", { name: "Log In" }).click()

  await expect(page.getByText("Email not verified")).toBeVisible()
})

test("Error message is displayed if an invalid token is used", async ({
  page,
}) => {
  const email = randomEmail()

  await page.goto("/signup")

  await fillForm(page, "Playwright Test", email, "changethis", "changethis")
  await page.getByRole("button", { name: "Sign Up" }).click()

  // Check if the user is redirected to the one more step page
  await expect(page.getByTestId("email-sent")).toContainText("One More Step", {
    timeout: 1000,
  })

  await page.goto("/verify-email?token=invalid-token")
  await expect(page.getByTestId("error")).toContainText(
    "Email Verification Failed",
    { timeout: 1000 },
  )
})
