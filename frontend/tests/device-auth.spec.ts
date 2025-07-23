import { expect, test } from "@playwright/test"
import { requestDeviceCode } from "./utils/device"

test("Error when code is wrong", async ({ page }) => {
  await page.goto("/device?code=12-34-56")

  await expect(page.getByText("Invalid Code")).toBeVisible()
})

test("Has IP information", async ({ page, request }) => {
  const code = await requestDeviceCode({ request })

  await page.goto(`/device?code=${code}`)

  await expect(page.getByTestId("request-ip")).toContainText(
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  )
})

test("Success when code is correct", async ({ page, request }) => {
  const code = await requestDeviceCode({ request })

  await page.goto(`/device?code=${code}`)
  await expect(
    page.getByText("Authorize FastAPI CLI", { exact: true }).first(),
  ).toBeVisible()

  await page.getByRole("button", { name: "Authorize" }).click()

  await expect(page.getByText("Device authorized")).toBeVisible()
})
