import { faker } from "@faker-js/faker"
import { expect, test } from "@playwright/test"
import { NewPassword } from "../src/client/models"
import { randomEmail } from "./utils/random"
import { logInUser, logOutUser, signUpNewUser } from "./utils/userUtils"

const tabs = ["My profile", "Appearance"]

// User Information

test("My profile tab is active by default", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.getByRole("tab", { name: "My profile" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})

test("My profile tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "My profile" }).click()
  await expect(page.getByLabel("My profile")).toBeVisible()
})

test.describe("Edit user full name and email successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user name with a valid name", async ({ page, request }) => {
    const fullName = "Test User"
    const email = randomEmail()
    const updatedName = "Test User 2"
    const password = "password"

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password, request)

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("button", { name: fullName }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(0).click()
    await page.locator("#full_name").fill(updatedName)
    await page.getByRole("button", { name: "Save" }).first().click()
    await expect(page.getByText("User updated successfully")).toBeVisible()

    // Check if the new name is displayed on the page
    await expect(
      page.getByLabel("My profile").getByText(updatedName, { exact: true }),
    ).toBeVisible()
  })

  test("Edit user email with a valid email", async ({ page, request }) => {
    const fullName = "Test User"
    const email = randomEmail()
    const updatedEmail = randomEmail()
    const password = "password"

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password, request)

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("button", { name: fullName }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(1).click()
    await page.locator("#email").fill(updatedEmail)
    await page.getByRole("button", { name: "Save" }).first().click()
    await expect(page.getByText("User updated successfully")).toBeVisible()

    // Check if the new email is displayed on the page
    await expect(
      page.getByLabel("My profile").getByText(updatedEmail, { exact: true }),
    ).toBeVisible()
  })
})

test.describe("Edit user full name and email with invalid data", () => {
  test("Edit user name with a invalid name", async ({ page }) => {
    const invalidName = ""
    await page.goto("/settings")
    await page.getByRole("button", { name: "fastapi admin" }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(0).click()
    await page.locator("#full_name").fill(invalidName)
    await page.locator("body").click()
    await expect(page.getByText("This field is required")).toBeVisible()
  })

  test("Edit user email with an invalid email", async ({ page }) => {
    const invalidEmail = ""
    await page.goto("/settings")
    await page.getByRole("button", { name: "fastapi admin" }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(1).click()
    await page.locator("#email").fill(invalidEmail)
    await page.locator("body").click()
    await expect(page.getByText("This field is required")).toBeVisible()
  })

  test("Cancel edit action restores original name", async ({ page }) => {
    const updatedName = "Test User"
    await page.goto("/settings")
    await page.getByRole("button", { name: "fastapi admin" }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(0).click()
    await page.locator("#full_name").fill(updatedName)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(
      page.getByLabel("My profile").getByText("fastapi admin"),
    ).toBeVisible()
  })

  test("Cancel edit action restores original email", async ({ page }) => {
    const updatedEmail = randomEmail()
    await page.goto("/settings")
    await page.getByRole("button", { name: "fastapi admin" }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByRole("button", { name: "Edit" }).nth(1).click()
    await page.locator("#email").fill(updatedEmail)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(
      page.getByLabel("My profile").getByText("admin@example.com"),
    ).toBeVisible()
  })
})

// Change Password

test.describe("Change password successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password successfully", async ({ page, request }) => {
    const fullName = "Test User"
    const email = randomEmail()
    const password = "password"
    const NewPassword = "newPassword"

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password, request)

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("button", { name: fullName }).click()
    await page.getByRole("menuitem", { name: "Settings" }).click()
    await page.getByPlaceholder("Current password").fill(password)
    await page.getByPlaceholder("New Password").fill(NewPassword)
    await page.getByPlaceholder("Confirm Password").fill(NewPassword)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Password updated successfully")).toBeVisible()

    await logOutUser(page, fullName)

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

  test("Delete account successfully", async ({ page, request }) => {
    const fullName = "Test User"
    const email = randomEmail()
    const password = "password"

    // Sign up a new user
    await signUpNewUser(page, fullName, email, password, request)

    // Log in the user
    await logInUser(page, email, password)

    // TODO: Complete this test
  })
})

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await expect(page.getByLabel("Appearance")).toBeVisible()
})

test("User can switch from light mode to dark mode", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await page.getByLabel("Appearance").locator("span").nth(3).click()
  const isDarkMode = await page.evaluate(() =>
    document.body.classList.contains("chakra-ui-dark"),
  )
  expect(isDarkMode).toBe(true)
})

test("User can switch from dark mode to light mode", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await page.getByLabel("Appearance").locator("span").first().click()
  const isLightMode = await page.evaluate(() =>
    document.body.classList.contains("chakra-ui-light"),
  )
  expect(isLightMode).toBe(true)
})

test("Selected mode is preserved across sessions", async ({ page }) => {
  await page.goto("/settings")
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await page.getByLabel("Appearance").locator("span").nth(3).click()

  await logOutUser(page, "fastapi admin")

  await logInUser(page, "admin@example.com", "changethis")
  const isDarkMode = await page.evaluate(() =>
    document.body.classList.contains("chakra-ui-dark"),
  )
  expect(isDarkMode).toBe(true)
})
