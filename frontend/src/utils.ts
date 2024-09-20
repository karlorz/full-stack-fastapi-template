import {
  type ApiError,
  type TeamWithUserPublic,
  TeamsService,
  type UserPublic,
} from "./client"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Invalid name",
}

export const nameRules = () => {
  const rules: any = {
    maxLength: {
      value: 255,
      message: "Full Name cannot be more than 255 characters",
    },
    required: "Full Name is required",
  }

  return rules
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
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
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
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
  this("Error", errorMessage, "error")
}

export const fetchTeamBySlug = async (teamSlug: string) => {
  const teams = await TeamsService.readTeams({ slug: teamSlug })

  if (!teams.data.length) {
    throw new Error("Team not found")
  }

  return TeamsService.readTeam({ teamId: teams.data[0].id })
}
