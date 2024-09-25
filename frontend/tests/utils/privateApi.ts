import { OpenAPI } from "../../src/client"
import { PrivateService } from "../../src/client/services"

// TODO: from env
OpenAPI.BASE = "http://127.0.0.1:8000"

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
