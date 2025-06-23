import { createFileRoute, Navigate } from "@tanstack/react-router"

import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/team-invitation")({
  component: () => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (isLoggedIn()) {
      return <Navigate to="/" search={{ invitation_token: token }} />
    }
    return <Navigate to="/login" search={{ invitation_token: token }} />
  },
})
