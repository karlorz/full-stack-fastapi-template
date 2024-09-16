import { createFileRoute } from "@tanstack/react-router"

import BackgroundPanel from "../components/Auth/BackgroundPanel"
import EmailVerification from "../components/Auth/EmailVerification"

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
})

function VerifyEmail() {
  return (
    <>
      <BackgroundPanel>
        <EmailVerification />
      </BackgroundPanel>
    </>
  )
}
