import { OpenAPI } from "../../src/client"
import { PrivateService } from "../../src/client/services"

// TODO: from env
OpenAPI.BASE = `${process.env.VITE_API_URL}`

export const createUser = async ({
  email,
  password,
}: { email: string; password: string }) => {
  return PrivateService.createUser({
    requestBody: {
      email,
      password,
      is_verified: true,
      full_name: "Test User",
    },
  })
}

export const createTeam = async ({
  name,
  ownerId,
}: { name: string; ownerId: string }) => {
  return PrivateService.createTeam({
    requestBody: {
      name,
      owner_id: ownerId,
    },
  })
}

export const createApp = async ({
  teamId,
  name,
}: { teamId: string; name: string }) => {
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
}: { appId: string; name: string; value: string }) => {
  return PrivateService.createEnvironmentVariable({
    requestBody: {
      app_id: appId,
      name,
      value,
    },
  })
}
