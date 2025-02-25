import type { RegisterOptions } from "react-hook-form"
import {
  type ApiError,
  AppsService,
  type DeploymentStatus,
  DeploymentsService,
  type TeamWithUserPublic,
  TeamsService,
  type UserPublic,
} from "./client"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
}

export const nameRules = () => {
  const rules: RegisterOptions = {
    maxLength: {
      value: 255,
      message: "Name cannot be more than 255 characters",
    },
    minLength: {
      value: 3,
      message: "Name must be at least 3 characters",
    },
    required: "Name is required",
  }

  return rules
}

export const passwordRules = (isRequired = true) => {
  const rules: RegisterOptions = {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    maxLength: {
      value: 255,
      message: "Password cannot be more than 255 characters",
    },
  }

  if (isRequired) {
    rules.required = "Password is required"
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => { password?: string; new_password?: string },
  isRequired = true,
) => {
  const rules: RegisterOptions = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "Passwords do not match"
    },
  }

  if (isRequired) {
    rules.required = "Password confirmation is required"
  }

  return rules
}

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

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export const fetchLastApp = async (teamId: string) => {
  const apps = await AppsService.readApps({ teamId, limit: 1 })

  if (!apps.data.length) {
    return null
  }

  return apps.data[0]
}

export const fetchLastAppsInLast30Days = async (teamId: string) => {
  const lastThirtyDays = new Date()
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30)

  const apps = await AppsService.readApps({
    teamId: teamId,
    skip: 0,
    orderBy: "created_at",
  })

  return apps.data.filter((app) => new Date(app.created_at) >= lastThirtyDays)
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

export const getLastDeploymentStatus = async (appId: string) => {
  const deployments = await DeploymentsService.readDeployments({
    appId: appId,
    orderBy: "created_at",
    limit: 1,
  })

  if (deployments.data.length === 0) {
    return null
  }

  return deployments.data[0].status
}
