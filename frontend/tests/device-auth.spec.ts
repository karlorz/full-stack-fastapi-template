import { expect, test } from "@playwright/test"
import { requestDeviceCode } from "./utils/device"

test("Title is visible", async ({ page }) => {
  await page.goto("/device?code=12-34-56")

  await expect(
    page.getByRole("heading", { name: "Authorize FastAPI CLI" }),
  ).toBeVisible()
})

test("Error when code is wrong", async ({ page }) => {
  await page.goto("/device?code=12-34-56")

  await page.getByRole("button", { name: "Authorize" }).click()

  await expect(page.getByText("Code not found")).toBeVisible()
})

test("Success when code is correct", async ({ page, request }) => {
  const code = await requestDeviceCode({ request })

  await page.goto(`/device?code=${code}`)

  await page.getByRole("button", { name: "Authorize" }).click()

  await expect(page.getByText("Device authorized")).toBeVisible()
})
