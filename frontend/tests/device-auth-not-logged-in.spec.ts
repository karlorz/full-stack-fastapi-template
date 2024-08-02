import { expect, test } from "@playwright/test"
import { requestDeviceCode } from "./utils/device"

test.use({ storageState: { cookies: [], origins: [] } })

test("Redirects when not logged in", async ({ page, request }) => {
  const code = await requestDeviceCode({ request })

  const url = `/device?code=${code}`

  await page.goto(url)

  expect(page.url().replace(":5173", "")).toBe(
    `http://localhost/login?redirect=${encodeURIComponent(url)}`,
  )
})
