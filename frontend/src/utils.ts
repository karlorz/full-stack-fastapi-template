import {
  type ApiError,
  AppsService,
  type DeploymentStatus,
  TeamsService,
  type TeamWithUserPublic,
  type UserPublic,
} from "./client"

export function getCurrentUserRole(
  team: TeamWithUserPublic,
  currentUser: UserPublic | null,
) {
  return team.user_links.find(({ user }) => user.id === currentUser?.id)?.role
}

export function extractErrorMessage(err: ApiError): string {
  const errDetail = (err.body as any)?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Something went wrong."
}

export const handleError = function (this: any, err: ApiError) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}

export const fetchTeamBySlug = async (teamSlug: string) => {
  const teams = await TeamsService.readTeams({ slug: teamSlug })

  if (!teams.data.length) {
    throw new Error("Team not found")
  }

  return TeamsService.readTeam({ teamId: teams.data[0].id })
}

export const fetchAppBySlug = async (teamId: string, appSlug: string) => {
  const apps = await AppsService.readApps({ teamId })
  const app = apps.data.find((app) => app.slug === appSlug)

  if (!app) {
    throw new Error("App not found")
  }

  return AppsService.readApp({ appId: app.id })
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export const fetchAppsData = async (teamId: string) => {
  const apps = await AppsService.readApps({
    teamId,
  })

  const lastThirtyDays = new Date()
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30)

  return {
    total: apps.data.length,
    lastApp: apps.data[0],
    recentApps: apps.data.filter(
      (app) => new Date(app.created_at) >= lastThirtyDays,
    ),
  }
}

export const deploymentStatusMessage = (status: DeploymentStatus | null) => {
  switch (status) {
    case "success":
      return "Last deployment was successful. Your app is up and running."
    case "failed":
      // TODO: Update this message when logs are implemented
      return "Last deployment failed. Please try again."
    case "building":
      return "Your app is currently building. Please wait."
    case "deploying":
      return "Your app is currently deploying. Please wait."
    case "waiting_upload":
      return "Your app is waiting for upload. Please wait."
    default:
      return "No recent deployment information available."
  }
}
