import { type Page, expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

const fillForm = async (page: Page, email: string, password: string) => {
  await page.getByTestId("email-input").fill(email)
  await page.getByTestId("password-input").fill(password)
}

const verifyInput = async (page: Page, placeholder: string) => {
  const input = page.getByTestId(placeholder)
  await expect(input).toBeVisible()
  await expect(input).toHaveText("")
  await expect(input).toBeEditable()
}

test("Title is visible", async ({ page }) => {
  await page.goto("/login")

  await expect(page.getByText("Welcome!")).toBeVisible()
})

test("Inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/login")

  await verifyInput(page, "email-input")
  await verifyInput(page, "password-input")
})

test("Log In button is visible", async ({ page }) => {
  await page.goto("/login")

  await expect(page.getByRole("button", { name: "Log In" })).toBeVisible()
})

test("Forgot Password link is visible", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("link", { name: "Forgot password?" }),
  ).toBeVisible()
})

// test("Sign Up link is visible", async ({ page }) => {
//   await page.goto("/login")

//   await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible()
// })

test("Log in with valid email and password ", async ({ page }) => {
  await page.goto("/login")

  await fillForm(page, "sebastian@fastapilabs.com", "secretsecret")
  await page.getByRole("button", { name: "Log In" }).click()

  await page.waitForURL("/")

  await expect(page.getByTestId("result")).toContainText("Hi, Sebastian")
})

test("Log in with invalid email", async ({ page }) => {
  await page.goto("/login")

  await fillForm(page, "invalidemail", "secretsecret")
  await page.getByRole("button", { name: "Log In" }).click()

  await expect(page.getByText("Invalid email address")).toBeVisible()
})

test("Log in with invalid password", async ({ page }) => {
  await page.goto("/login")

  await fillForm(page, "sebastian@fastapilabs.com", "changethat")
  await page.getByRole("button", { name: "Log In" }).click()

  await expect(page.getByText("Invalid credentials")).toBeVisible()
})

// Log out

test("Successful log out", async ({ page }) => {
  await page.goto("/login")

  await fillForm(page, "sebastian@fastapilabs.com", "secretsecret")
  await page.getByRole("button", { name: "Log In" }).click()

  await page.waitForURL("/")

  await expect(page.getByTestId("result")).toContainText("Hi, Sebastian")

  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log Out" }).click()
  await page.reload()
  await page.waitForURL("/login")
})

test("Logged-out user cannot access protected routes", async ({ page }) => {
  await page.goto("/login")

  await fillForm(page, "sebastian@fastapilabs.com", "secretsecret")
  await page.getByRole("button", { name: "Log In" }).click()

  await page.waitForURL("/")

  await expect(page.getByTestId("result")).toContainText("Hi, Sebastian")

  await page.getByTestId("user-menu").click()
  await page.getByRole("menuitem", { name: "Log Out" }).click()
  await page.goto("/settings")
  await page.waitForURL("/login?redirect=%2Fsettings")
})
