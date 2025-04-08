import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { InvitationsService, type UserPublic, UsersService } from "@/client"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { Loader2 } from "lucide-react"
import AcceptInvitation from "./AcceptInvitation"
import NoMatchingAccount from "./NoMatchingAccount"
import TeamInvitationNoAuth from "./TeamInvitationNoAuth"

const TeamInvitation = () => {
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const token = new URLSearchParams(window.location.search).get(
    "invitation_token",
  )

  const { data: currentUser } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: () => (isLoggedIn() ? UsersService.readUserMe() : null),
  })

  const {
    data: invitation,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["invitation"],
    queryFn: async () =>
      await InvitationsService.verifyInvitation({
        requestBody: { token: token || "" },
      }),
    enabled: !!token,
  })

  useEffect(() => {
    if (invitation?.status === "accepted") {
      showSuccessToast("Invitation has already been accepted")
      navigate({ to: "/" })
    }
  }, [invitation, showSuccessToast, navigate])

  //TODO: Improve handling of loading and error states

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    showErrorToast("Invalid invitation token")
  }

  if (!token || error || invitation?.status === "accepted") {
    return null
  }

  return (
    <>
      {isLoggedIn() ? (
        (currentUser?.email === invitation?.email && (
          <AcceptInvitation invitation={invitation} token={token} />
        )) || (
          <NoMatchingAccount
            invitation={invitation}
            currentUser={currentUser}
          />
        )
      ) : (
        <TeamInvitationNoAuth invitation={invitation} invitationToken={token} />
      )}
    </>
  )
}

export default TeamInvitation
