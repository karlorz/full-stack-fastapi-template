import { createFileRoute } from "@tanstack/react-router"

import VerifyEmailUpdate from "@/components/UserSettings/VerifyEmailUpdate"

export const Route = createFileRoute("/verify-update-email")({
  component: VerifyUpdateEmail,
  head: () => ({
    meta: [
      {
        title: "Verifying Email Update - FastAPI Cloud",
      },
    ],
  }),
})

function VerifyUpdateEmail() {
  return (
    <div className="flex flex-col md:flex-row justify-center min-h-screen">
      <VerifyEmailUpdate />
    </div>
  )
}
