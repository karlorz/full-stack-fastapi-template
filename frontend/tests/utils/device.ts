import type { APIRequestContext } from "@playwright/test"

export async function requestDeviceCode({
  request,
}: { request: APIRequestContext }) {
  const response = await request.post(
    "http://localhost/api/v1/login/device/authorization",
    {
      form: {
        client_id: "fastapi-cloud-cli",
      },
    },
  )

  let data = await response.json()

  return data.user_code
}
