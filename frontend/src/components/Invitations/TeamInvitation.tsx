import { Spinner, useDisclosure } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { InvitationsService, type UserPublic, UsersService } from "../../client"
import { isLoggedIn } from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import AcceptInvitation from "./AcceptInvitation"
import NoMatchingAccount from "./NoMatchingAccount"
import TeamInvitationNoAuth from "./TeamInvitationNoAuth"

const TeamInvitation = () => {
  const navigate = useNavigate()
  const showToast = useCustomToast()
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true })
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
      showToast(
        "Invitation Status",
        "Invitation has already been accepted.",
        "warning",
      )
      navigate({ to: "/" })
    }
  }, [invitation, showToast, navigate])

  //TODO: Improve handling of loading and error states

  if (isLoading) {
    return <Spinner />
  }

  if (error) {
    showToast("Error", "Invalid invitation token.", "error")
  }

  if (!token || error || invitation?.status === "accepted") {
    return null
  }

  return (
    <>
      {isLoggedIn() ? (
        (currentUser?.email === invitation?.email && (
          <AcceptInvitation
            isOpen={isOpen}
            onClose={onClose}
            invitation={invitation}
            token={token}
          />
        )) || (
          <NoMatchingAccount
            isOpen={isOpen}
            onClose={onClose}
            invitation={invitation}
            currentUser={currentUser}
          />
        )
      ) : (
        <TeamInvitationNoAuth
          isOpen={isOpen}
          onClose={onClose}
          invitation={invitation}
          invitationToken={token}
        />
      )}
    </>
  )
}

export default TeamInvitation
