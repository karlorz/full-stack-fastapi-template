import { type Page, expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

type OptionsType = {
  exact?: boolean
}

const fillForm = async (
  page: Page,
  data: {
    email: string
    name?: string
    organization?: string
    team_size?: string
    role?: string
    country?: string
    use_case?: string
  },
) => {
  if (data.email) await page.getByPlaceholder("Email").fill(data.email)
  if (data.name) await page.getByPlaceholder("Full Name").fill(data.name)
  if (data.organization)
    await page.getByPlaceholder("Organization").fill(data.organization)
  if (data.team_size) await page.getByTestId("team-size-select").click()
  if (data.role) await page.getByPlaceholder("Your Role").fill(data.role)
  if (data.country) await page.getByPlaceholder("Country").fill(data.country)
  if (data.use_case)
    await page
      .getByPlaceholder("How do you plan to use FastAPI Cloud? (Optional)")
      .fill(data.use_case)
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

test("Title is visible", async ({ page }) => {
  await page.goto("/waitlist")

  await expect(
    page.getByRole("heading", { name: "Join the Waitlist" }),
  ).toBeVisible()
  await expect(page.getByText("Sign up to get early access")).toBeVisible()
})

test("All inputs are visible, empty and editable", async ({ page }) => {
  await page.goto("/waitlist")

  await verifyInput(page, "Email")
  await verifyInput(page, "Full Name")
  await verifyInput(page, "Organization")
  await verifyInput(page, "Your Role")
  await verifyInput(page, "Country")
  await verifyInput(page, "How do you plan to use FastAPI Cloud? (Optional)")
})

test("Join Waitlist button is visible", async ({ page }) => {
  await page.goto("/waitlist")

  await expect(
    page.getByRole("button", { name: "Join Waitlist" }),
  ).toBeVisible()
})

test("Submit waitlist form with only required field (email)", async ({
  page,
}) => {
  await page.goto("/waitlist")

  await fillForm(page, { email: "test@example.com" })
  await page.getByRole("button", { name: "Join Waitlist" }).click()

  // Verify success message
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible()
  await expect(
    page.getByText("You've been added to our waitlist"),
  ).toBeVisible()
  await expect(page.getByText("test@example.com")).toBeVisible()
})

test("Submit waitlist form with all fields", async ({ page }) => {
  await page.goto("/waitlist")

  const testEmail = "test@example.com"
  await fillForm(page, {
    email: testEmail,
    name: "Test User",
    organization: "Test Corp",
    team_size: "6-10",
    role: "Developer",
    country: "United States",
    use_case: "Testing the platform",
  })
  await page.getByRole("button", { name: "Join Waitlist" }).click()

  // Verify success message
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible()
  await expect(
    page.getByText("You've been added to our waitlist"),
  ).toBeVisible()
  await expect(page.getByText(testEmail)).toBeVisible()
})

test("Submit with invalid email shows error", async ({ page }) => {
  await page.goto("/waitlist")

  await fillForm(page, { email: "invalidemail" })
  await page.getByRole("button", { name: "Join Waitlist" }).click()

  await expect(page.getByText("Invalid email address")).toBeVisible()
})

test("Success message replaces form after submission", async ({ page }) => {
  await page.goto("/waitlist")

  await fillForm(page, { email: "test@example.com" })
  await page.getByRole("button", { name: "Join Waitlist" }).click()

  // Verify form is no longer visible
  await expect(page.getByPlaceholder("Email")).not.toBeVisible()
  await expect(
    page.getByRole("button", { name: "Join Waitlist" }),
  ).not.toBeVisible()

  // Verify success message is visible
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible()
})
