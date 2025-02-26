import { OpenAPI, PrivateService, type Role } from "../../src/client"

// TODO: from env
OpenAPI.BASE = `${process.env.VITE_API_URL}`

export const createUser = async ({
  email,
  password,
  createPersonalTeam = true,
}: {
  email: string
  password: string
  createPersonalTeam?: boolean
}) => {
  const user = await PrivateService.createUser({
    requestBody: {
      email,
      password,
      is_verified: true,
      full_name: "Test User",
    },
  })

  if (createPersonalTeam) {
    await createTeam({
      name: user.full_name,
      ownerId: user.id,
      isPersonalTeam: true,
    })
  }

  return user
}

export const createTeam = async ({
  name,
  ownerId,
  isPersonalTeam = false,
}: {
  name: string
  ownerId: string
  isPersonalTeam?: boolean
}) => {
  return PrivateService.createTeam({
    requestBody: {
      name,
      owner_id: ownerId,
      is_personal_team: isPersonalTeam,
    },
  })
}

export const createApp = async ({
  teamId,
  name,
}: {
  teamId: string
  name: string
}) => {
  return await PrivateService.createApp({
    requestBody: {
      team_id: teamId,
      name,
    },
  })
}

export const createDeployment = async ({ appId }: { appId: string }) => {
  return PrivateService.createDeployment({
    requestBody: {
      app_id: appId,
    },
  })
}

export const createEnvironmentVariable = async ({
  appId,
  name,
  value,
}: {
  appId: string
  name: string
  value: string
}) => {
  return PrivateService.createEnvironmentVariable({
    requestBody: {
      app_id: appId,
      name,
      value,
    },
  })
}

export const addUserToTeam = async ({
  teamId,
  userId,
  role,
}: {
  teamId: string
  userId: string
  role: Role
}) => {
  return PrivateService.addUserToTeam({
    teamId: teamId,
    requestBody: {
      user_id: userId,
      role: role,
    },
  })
}
