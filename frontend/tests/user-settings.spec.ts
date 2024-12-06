import { expect, test } from "@playwright/test"
import { findLastEmail } from "./utils/mailcatcher"
import { createUser } from "./utils/privateApi"
import { randomEmail } from "./utils/random"
import { logInUser, logOutUser } from "./utils/userUtils"

// User Information

test.describe("Edit user full name and email successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user name with a valid name", async ({ page }) => {
    const email = randomEmail()
    const updatedName = "Test User 2"
    const password = "password"

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(0).click()
    await page.getByLabel("editable input").nth(0).fill(updatedName)
    await page.getByRole("button", { name: "submit" }).nth(0).click()
    await expect(page.getByText("Full name updated successfully")).toBeVisible()

    // Check if the new name is displayed on the page
    await expect(
      page.locator("div").filter({ hasText: new RegExp(`^${updatedName}$`) }),
    ).toBeVisible()
  })

  test("Edit user email with a valid email after verification", async ({
    page,
    request,
  }) => {
    const email = randomEmail()
    const updatedEmail = randomEmail()
    const password = "password"

    await createUser({ email, password })
    await logInUser(page, email, password)

    // Request email update
    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(1).click()
    await page.getByLabel("editable input").nth(1).fill(updatedEmail)
    await page.getByRole("button", { name: "submit" }).click()
    await expect(page.getByTestId("verification-email-modal")).toBeVisible()

    // Verify email
    const emailData = await findLastEmail({
      request,
      filter: (e) => e.recipients.includes(`<${updatedEmail}>`),
      timeout: 5000,
    })

    await page.goto(
      `${process.env.MAILCATCHER_HOST}/messages/${emailData.id}.html`,
    )

    const selector = 'a[href*="/verify-update-email?token="]'

    let url = await page.getAttribute(selector, "href")

    // TODO: update var instead of doing a replace
    url = url!.replace("http://localhost/", "http://localhost:5173/")

    // Check if the user is redirected to the email verification success page
    await page.goto(url)

    await expect(page.getByTestId("result")).toContainText(
      "Your email address has been updated successfully.",
      { timeout: 5000 },
    )
  })
})

test.describe("Edit user full name and email with invalid data", () => {
  test("Edit user name with a invalid name", async ({ page }) => {
    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(0).click()
    await page.getByLabel("editable input").nth(0).fill("")
    await expect(page.getByText("Name is required")).toBeVisible()
  })

  test("Edit user email with an invalid email", async ({ page }) => {
    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(1).click()
    await page.getByLabel("editable input").nth(1).fill("")
    await expect(page.getByText("Email is required")).toBeVisible()
  })

  test("Cancel edit action restores original name", async ({ page }) => {
    const updatedName = "Test User"
    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(0).click()
    await page.getByLabel("editable input").nth(0).fill(updatedName)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(
      page.locator("div").filter({ hasText: /^Test User$/ }),
    ).toBeVisible()
  })

  test("Cancel edit action restores original email", async ({ page }) => {
    const updatedEmail = randomEmail()
    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByRole("button", { name: "edit" }).nth(1).click()
    await page.getByLabel("editable input").nth(1).fill(updatedEmail)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(
      page
        .locator("div")
        .filter({ hasText: new RegExp(`^${process.env.USER_EMAIL!}$`) }),
    ).toBeVisible()
  })
})

// Change Password

test.describe("Change password successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password successfully", async ({ page }) => {
    const email = randomEmail()
    const password = "password"
    const NewPassword = "newPassword"

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "User Settings" }).click()
    await page.getByPlaceholder("Current password").fill(password)
    await page.getByPlaceholder("New Password").fill(NewPassword)
    await page.getByPlaceholder("Confirm Password").fill(NewPassword)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Password updated successfully")).toBeVisible()

    await logOutUser(page)

    // Check if the user can log in with the new password
    await logInUser(page, email, NewPassword)
  })
})

test.describe("Change password with invalid data", () => {
  test("Update password with weak passwords", async ({ page }) => {
    const weakPassword = "weak"
    await page.goto("/settings")
    await page.getByPlaceholder("Current password").fill("changethis")
    await page.getByPlaceholder("New Password").fill(weakPassword)
    await page.getByPlaceholder("Confirm Password").fill(weakPassword)
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible()
  })

  test("New password and confirmation password do not match", async ({
    page,
  }) => {
    const currentPassword = "changethis"
    const newPassword = "newPassword"
    const confirmPassword = "confirmPassword"
    await page.goto("/settings")
    await page.getByPlaceholder("Current password").fill(currentPassword)
    await page.getByPlaceholder("New Password").fill(newPassword)
    await page.getByPlaceholder("Confirm Password").fill(confirmPassword)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Passwords do not match")).toBeVisible()
  })

  test("Current password and new password are the same", async ({ page }) => {
    const currentPassword = "changethis"
    await page.goto("/settings")
    await page.getByPlaceholder("Current password").fill(currentPassword)
    await page.getByPlaceholder("New Password").fill(currentPassword)
    await page.getByPlaceholder("Confirm Password").fill(currentPassword)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(
      page.getByText("New password cannot be the same as the current one"),
    ).toBeVisible()
  })
})

// Delete Account

test.describe("Delete account successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Delete account successfully", async ({ page }) => {
    const email = randomEmail()
    const password = "password"

    await createUser({ email, password })
    await logInUser(page, email, password)

    await page.getByTestId("user-menu").click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByText("Delete Account").click()
    await expect(page.getByTestId("delete-confirmation-user")).toBeVisible()
    await page
      .getByPlaceholder('Type "delete my account" to confirm')
      .fill("delete my account")
    await page.getByRole("button", { name: "Confirm" }).click()

    await page.waitForURL("/login")
  })
})

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByLabel("Toggle dark mode")).toBeVisible()
})

test("User can switch from light mode to dark mode and vice versa", async ({
  page,
}) => {
  await page.goto("/")

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    )
  ) {
    await page.getByLabel("Toggle dark mode").click()
  }

  let isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)

  await page.getByLabel("Toggle dark mode").click()
  const isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)

  await page.getByLabel("Toggle dark mode").click()
  isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)
})

test("Selected mode is preserved across sessions", async ({ page }) => {
  await page.goto("/")

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    )
  ) {
    await page.getByLabel("Toggle dark mode").click()
  }

  const isLightMode = await page.evaluate(() =>
    document.documentElement.classList.contains("light"),
  )
  expect(isLightMode).toBe(true)

  await page.getByLabel("Toggle dark mode").click()
  let isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)

  await logOutUser(page)
  await logInUser(page, "sebastian@fastapilabs.com", "secretsecret")

  isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  )
  expect(isDarkMode).toBe(true)
})
