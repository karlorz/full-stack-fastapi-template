import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  AccessTokenWithUserMe,
  AuthorizeDeviceIn,
  Body_login_device_authorization,
  Body_login_login_access_token,
  Body_login_login_token,
  DeviceAuthorizationInfo,
  DeviceAuthorizationResponse,
  Message,
  NewPassword,
  Token,
  UserPublic,
  EmailVerificationToken,
  UpdatePassword,
  UserMePublic,
  UserRegister,
  UserUpdateEmailMe,
  UserUpdateMe,
  WaitingListUserCreate,
  HealthCheckResponse,
  TeamCreate,
  TeamPublic,
  TeamsPublic,
  TeamUpdate,
  TeamUpdateMember,
  TeamWithUserPublic,
  UserTeamLinkPublic,
  InvitationCreate,
  InvitationPublic,
  InvitationsPublic,
  InvitationStatus,
  InvitationToken,
  AppCreate,
  AppPublic,
  AppsPublic,
  EnvironmentVariableCreate,
  EnvironmentVariablePublic,
  EnvironmentVariablesPublic,
  EnvironmentVariableUpdate,
  DeploymentPublic,
  DeploymentsPublic,
  DeploymentUploadOut,
  CreateApp,
  CreateDeployment,
  CreateEnvironmentVariable,
  CreateTeam,
  CreateUser,
  EnvironmentVariable,
} from "./models"

export type LoginData = {
  LoginAccessToken: {
    formData: Body_login_login_access_token
  }
  DeviceAuthorization: {
    formData: Body_login_device_authorization
  }
  DeviceAuthorizationInfo: {
    userCode: string
  }
  LoginToken: {
    formData: Body_login_login_token
  }
  AuthorizeDevice: {
    requestBody: AuthorizeDeviceIn
  }
  RecoverPassword: {
    email: string
  }
  ResetPassword: {
    requestBody: NewPassword
  }
  RecoverPasswordHtmlContent: {
    email: string
  }
}

export type UsersData = {
  UpdateUserMe: {
    requestBody: UserUpdateMe
  }
  RequestEmailUpdate: {
    requestBody: UserUpdateEmailMe
  }
  VerifyUpdateEmailToken: {
    requestBody: EmailVerificationToken
  }
  UpdatePasswordMe: {
    requestBody: UpdatePassword
  }
  RegisterUser: {
    requestBody: UserRegister
  }
  VerifyEmailToken: {
    requestBody: EmailVerificationToken
  }
  VerifyEmailHtmlContent: {
    email: string
  }
  AddToWaitingList: {
    requestBody: WaitingListUserCreate
  }
}

export type UtilsData = {
  TestEmail: {
    emailTo: string
  }
}

export type TeamsData = {
  ReadTeams: {
    limit?: number
    order?: "asc" | "desc"
    orderBy?: "created_at" | null
    owner?: boolean
    skip?: number
    slug?: string | null
  }
  CreateTeam: {
    requestBody: TeamCreate
  }
  ReadTeam: {
    teamId: string
  }
  UpdateTeam: {
    requestBody: TeamUpdate
    teamId: string
  }
  DeleteTeam: {
    teamId: string
  }
  UpdateMemberInTeam: {
    requestBody: TeamUpdateMember
    teamId: string
    userId: string
  }
  RemoveMemberFromTeam: {
    teamId: string
    userId: string
  }
  ValidateTeamName: {
    teamSlug: string
  }
}

export type InvitationsData = {
  ReadInvitationsMe: {
    limit?: number
    skip?: number
  }
  ReadInvitationsSent: {
    limit?: number
    skip?: number
  }
  ReadInvitationsTeamByAdmin: {
    limit?: number
    skip?: number
    status?: InvitationStatus | null
    teamId: string
  }
  CreateInvitation: {
    requestBody: InvitationCreate
  }
  AcceptInvitation: {
    requestBody: InvitationToken
  }
  VerifyInvitation: {
    requestBody: InvitationToken
  }
  InvitationHtmlContent: {
    invitationId: string
  }
  DeleteInvitation: {
    invId: string
  }
}

export type AppsData = {
  ReadEnvironmentVariables: {
    appId: string
  }
  CreateEnvironmentVariable: {
    appId: string
    requestBody: EnvironmentVariableCreate
  }
  UpdateEnvironmentVariables: {
    appId: string
    requestBody: Record<string, string | null>
  }
  DeleteEnvironmentVariable: {
    appId: string
    environmentVariableName: string
  }
  UpdateEnvironmentVariable: {
    appId: string
    environmentVariableName: string
    requestBody: EnvironmentVariableUpdate
  }
  ReadApps: {
    limit?: number
    order?: "asc" | "desc"
    orderBy?: "created_at" | null
    skip?: number
    slug?: string | null
    teamId: string
  }
  CreateApp: {
    requestBody: AppCreate
  }
  ReadApp: {
    appId: string
  }
  DeleteApp: {
    appId: string
  }
}

export type DeploymentsData = {
  ReadDeployments: {
    appId: string
    limit?: number
    order?: "asc" | "desc"
    orderBy?: "created_at" | null
    skip?: number
  }
  CreateDeployment: {
    appId: string
  }
  ReadDeployment: {
    appId: string
    deploymentId: string
  }
  UploadDeploymentArtifact: {
    deploymentId: string
  }
}

export type PrivateData = {
  CreateUser: {
    requestBody: CreateUser
  }
  CreateTeam: {
    requestBody: CreateTeam
  }
  CreateApp: {
    requestBody: CreateApp
  }
  CreateDeployment: {
    requestBody: CreateDeployment
  }
  CreateEnvironmentVariable: {
    requestBody: CreateEnvironmentVariable
  }
}

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get the access token and the user data
   * @returns AccessTokenWithUserMe Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: LoginData["LoginAccessToken"],
  ): CancelablePromise<AccessTokenWithUserMe> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Device Authorization
   * Device Authorization Grant
   * @returns DeviceAuthorizationResponse Successful Response
   * @throws ApiError
   */
  public static deviceAuthorization(
    data: LoginData["DeviceAuthorization"],
  ): CancelablePromise<DeviceAuthorizationResponse> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/device/authorization",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Device Authorization Info
   * Get device authorization info
   * @returns DeviceAuthorizationInfo Successful Response
   * @throws ApiError
   */
  public static deviceAuthorizationInfo(
    data: LoginData["DeviceAuthorizationInfo"],
  ): CancelablePromise<DeviceAuthorizationInfo> {
    const { userCode } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/login/device/authorization/{user_code}",
      path: {
        user_code: userCode,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Login Token
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginToken(
    data: LoginData["LoginToken"],
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/device/token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Authorize Device
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static authorizeDevice(
    data: LoginData["AuthorizeDevice"],
  ): CancelablePromise<unknown> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/device/authorize",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: LoginData["RecoverPassword"],
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: LoginData["ResetPassword"],
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: LoginData["RecoverPasswordHtmlContent"],
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class UsersService {
  /**
   * Read User Me
   * Get current user.
   * @returns UserMePublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserMePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: UsersData["UpdateUserMe"],
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Request Email Update
   * Request to update own user email.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static requestEmailUpdate(
    data: UsersData["RequestEmailUpdate"],
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/me/email",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Verify Update Email Token
   * Verify email update token.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static verifyUpdateEmailToken(
    data: UsersData["VerifyUpdateEmailToken"],
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/me/verify-update-email",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: UsersData["UpdatePasswordMe"],
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: UsersData["RegisterUser"],
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Verify Email Token
   * Verify email token
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static verifyEmailToken(
    data: UsersData["VerifyEmailToken"],
  ): CancelablePromise<unknown> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/verify-email",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Verify Email Html Content
   * HTML Content for Email verification email
   * @returns string Successful Response
   * @throws ApiError
   */
  public static verifyEmailHtmlContent(
    data: UsersData["VerifyEmailHtmlContent"],
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/verify-email-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Add To Waiting List
   * Add user to waiting list
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static addToWaitingList(
    data: UsersData["AddToWaitingList"],
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/waiting-list",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(
    data: UtilsData["TestEmail"],
  ): CancelablePromise<Message> {
    const { emailTo } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Health Check
   * Health check.
   * @returns HealthCheckResponse Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<HealthCheckResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check/",
    })
  }
}

export class TeamsService {
  /**
   * Read Teams
   * Retrieve a list of teams accessible to the current user.
   * @returns TeamsPublic Successful Response
   * @throws ApiError
   */
  public static readTeams(
    data: TeamsData["ReadTeams"] = {},
  ): CancelablePromise<TeamsPublic> {
    const {
      skip = 0,
      limit = 100,
      orderBy,
      order = "asc",
      owner = false,
      slug,
    } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/teams/",
      query: {
        skip,
        limit,
        order_by: orderBy,
        order,
        owner,
        slug,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Team
   * Create a new team with the provided details.
   * @returns TeamPublic Successful Response
   * @throws ApiError
   */
  public static createTeam(
    data: TeamsData["CreateTeam"],
  ): CancelablePromise<TeamPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/teams/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Team
   * Retrieve a team by its name and returns it along with its associated users.
   * @returns TeamWithUserPublic Successful Response
   * @throws ApiError
   */
  public static readTeam(
    data: TeamsData["ReadTeam"],
  ): CancelablePromise<TeamWithUserPublic> {
    const { teamId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/teams/{team_id}",
      path: {
        team_id: teamId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Team
   * Update an team by its name.
   * @returns TeamPublic Successful Response
   * @throws ApiError
   */
  public static updateTeam(
    data: TeamsData["UpdateTeam"],
  ): CancelablePromise<TeamPublic> {
    const { teamId, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/teams/{team_id}",
      path: {
        team_id: teamId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Team
   * Delete a team from the database by its name.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteTeam(
    data: TeamsData["DeleteTeam"],
  ): CancelablePromise<Message> {
    const { teamId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/teams/{team_id}",
      path: {
        team_id: teamId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Member In Team
   * Update a member in a team.
   * @returns UserTeamLinkPublic Successful Response
   * @throws ApiError
   */
  public static updateMemberInTeam(
    data: TeamsData["UpdateMemberInTeam"],
  ): CancelablePromise<UserTeamLinkPublic> {
    const { teamId, userId, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/teams/{team_id}/users/{user_id}",
      path: {
        team_id: teamId,
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Remove Member From Team
   * Remove a member from a team.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static removeMemberFromTeam(
    data: TeamsData["RemoveMemberFromTeam"],
  ): CancelablePromise<Message> {
    const { teamId, userId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/teams/{team_id}/users/{user_id}",
      path: {
        team_id: teamId,
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Validate Team Name
   * Validate if team name is unique
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static validateTeamName(
    data: TeamsData["ValidateTeamName"],
  ): CancelablePromise<Message> {
    const { teamSlug } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/teams/validate-team-name/{team_slug}",
      path: {
        team_slug: teamSlug,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class InvitationsService {
  /**
   * Read Invitations Me
   * Retrieve a list of invitations accessible to the current user.
   * @returns InvitationsPublic Successful Response
   * @throws ApiError
   */
  public static readInvitationsMe(
    data: InvitationsData["ReadInvitationsMe"] = {},
  ): CancelablePromise<InvitationsPublic> {
    const { skip = 0, limit = 100 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/invitations/me",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Invitations Sent
   * Retrieve a list of invitations sent by the current user.
   * @returns InvitationsPublic Successful Response
   * @throws ApiError
   */
  public static readInvitationsSent(
    data: InvitationsData["ReadInvitationsSent"] = {},
  ): CancelablePromise<InvitationsPublic> {
    const { skip = 0, limit = 100 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/invitations/sent",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Invitations Team By Admin
   * Retrieve a list of invitations sent by the current user.
   * @returns InvitationsPublic Successful Response
   * @throws ApiError
   */
  public static readInvitationsTeamByAdmin(
    data: InvitationsData["ReadInvitationsTeamByAdmin"],
  ): CancelablePromise<InvitationsPublic> {
    const { teamId, skip = 0, limit = 100, status } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/invitations/team/{team_id}",
      path: {
        team_id: teamId,
      },
      query: {
        skip,
        limit,
        status,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Invitation
   * Create new invitation.
   * @returns InvitationPublic Successful Response
   * @throws ApiError
   */
  public static createInvitation(
    data: InvitationsData["CreateInvitation"],
  ): CancelablePromise<InvitationPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/invitations/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Accept Invitation
   * Accept an invitation.
   * @returns InvitationPublic Successful Response
   * @throws ApiError
   */
  public static acceptInvitation(
    data: InvitationsData["AcceptInvitation"],
  ): CancelablePromise<InvitationPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/invitations/accept",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Verify Invitation
   * Verify an invitation token.
   * @returns InvitationPublic Successful Response
   * @throws ApiError
   */
  public static verifyInvitation(
    data: InvitationsData["VerifyInvitation"],
  ): CancelablePromise<InvitationPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/invitations/token/verify",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Invitation Html Content
   * HTML Content for Invitation email
   * @returns string Successful Response
   * @throws ApiError
   */
  public static invitationHtmlContent(
    data: InvitationsData["InvitationHtmlContent"],
  ): CancelablePromise<string> {
    const { invitationId } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/invitations/team-invitation-html-content/{invitation_id}",
      path: {
        invitation_id: invitationId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Invitation
   * Delete an invitation.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteInvitation(
    data: InvitationsData["DeleteInvitation"],
  ): CancelablePromise<Message> {
    const { invId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/invitations/{inv_id}",
      path: {
        inv_id: invId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class AppsService {
  /**
   * Read Environment Variables
   * Retrieve a list of environment variables for the provided app.
   * @returns EnvironmentVariablesPublic Successful Response
   * @throws ApiError
   */
  public static readEnvironmentVariables(
    data: AppsData["ReadEnvironmentVariables"],
  ): CancelablePromise<EnvironmentVariablesPublic> {
    const { appId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/apps/{app_id}/environment-variables/",
      path: {
        app_id: appId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Environment Variable
   * Create a new environment variable for the provided app.
   * @returns EnvironmentVariablePublic Successful Response
   * @throws ApiError
   */
  public static createEnvironmentVariable(
    data: AppsData["CreateEnvironmentVariable"],
  ): CancelablePromise<EnvironmentVariablePublic> {
    const { appId, requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/apps/{app_id}/environment-variables/",
      path: {
        app_id: appId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Environment Variables
   * Update the provided environment variables.
   * @returns EnvironmentVariablesPublic Successful Response
   * @throws ApiError
   */
  public static updateEnvironmentVariables(
    data: AppsData["UpdateEnvironmentVariables"],
  ): CancelablePromise<EnvironmentVariablesPublic> {
    const { appId, requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/apps/{app_id}/environment-variables/",
      path: {
        app_id: appId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Environment Variable
   * Delete the provided environment variable.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteEnvironmentVariable(
    data: AppsData["DeleteEnvironmentVariable"],
  ): CancelablePromise<Message> {
    const { appId, environmentVariableName } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/apps/{app_id}/environment-variables/{environment_variable_name}",
      path: {
        app_id: appId,
        environment_variable_name: environmentVariableName,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Environment Variable
   * Update the provided environment variable.
   * @returns EnvironmentVariablePublic Successful Response
   * @throws ApiError
   */
  public static updateEnvironmentVariable(
    data: AppsData["UpdateEnvironmentVariable"],
  ): CancelablePromise<EnvironmentVariablePublic> {
    const { appId, environmentVariableName, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/apps/{app_id}/environment-variables/{environment_variable_name}",
      path: {
        app_id: appId,
        environment_variable_name: environmentVariableName,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Apps
   * Retrieve a list of apps for the provided team.
   * @returns AppsPublic Successful Response
   * @throws ApiError
   */
  public static readApps(
    data: AppsData["ReadApps"],
  ): CancelablePromise<AppsPublic> {
    const { teamId, skip = 0, limit = 100, slug, orderBy, order = "asc" } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/apps/",
      query: {
        team_id: teamId,
        skip,
        limit,
        slug,
        order_by: orderBy,
        order,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create App
   * Create a new app with the provided details.
   * @returns AppPublic Successful Response
   * @throws ApiError
   */
  public static createApp(
    data: AppsData["CreateApp"],
  ): CancelablePromise<AppPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/apps/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read App
   * Retrieve the details of the provided app.
   * @returns AppPublic Successful Response
   * @throws ApiError
   */
  public static readApp(
    data: AppsData["ReadApp"],
  ): CancelablePromise<AppPublic> {
    const { appId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/apps/{app_id}",
      path: {
        app_id: appId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete App
   * Delete the provided app.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteApp(
    data: AppsData["DeleteApp"],
  ): CancelablePromise<Message> {
    const { appId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/apps/{app_id}",
      path: {
        app_id: appId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class DeploymentsService {
  /**
   * Read Deployments
   * Retrieve a list of deployments for the provided app.
   * @returns DeploymentsPublic Successful Response
   * @throws ApiError
   */
  public static readDeployments(
    data: DeploymentsData["ReadDeployments"],
  ): CancelablePromise<DeploymentsPublic> {
    const { appId, skip = 0, limit = 100, orderBy, order = "asc" } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/apps/{app_id}/deployments/",
      path: {
        app_id: appId,
      },
      query: {
        skip,
        limit,
        order_by: orderBy,
        order,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Deployment
   * Create a new deployment.
   * @returns DeploymentPublic Successful Response
   * @throws ApiError
   */
  public static createDeployment(
    data: DeploymentsData["CreateDeployment"],
  ): CancelablePromise<DeploymentPublic> {
    const { appId } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/apps/{app_id}/deployments/",
      path: {
        app_id: appId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Deployment
   * Retrieve a list of deployments for the provided app.
   * @returns DeploymentPublic Successful Response
   * @throws ApiError
   */
  public static readDeployment(
    data: DeploymentsData["ReadDeployment"],
  ): CancelablePromise<DeploymentPublic> {
    const { appId, deploymentId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/apps/{app_id}/deployments/{deployment_id}",
      path: {
        app_id: appId,
        deployment_id: deploymentId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Upload Deployment Artifact
   * Upload a new deployment artifact.
   * @returns DeploymentUploadOut Successful Response
   * @throws ApiError
   */
  public static uploadDeploymentArtifact(
    data: DeploymentsData["UploadDeploymentArtifact"],
  ): CancelablePromise<DeploymentUploadOut> {
    const { deploymentId } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/deployments/{deployment_id}/upload",
      path: {
        deployment_id: deploymentId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export class PrivateService {
  /**
   * Create User
   * Create a new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: PrivateData["CreateUser"],
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/users/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Team
   * Create a new team.
   * @returns TeamPublic Successful Response
   * @throws ApiError
   */
  public static createTeam(
    data: PrivateData["CreateTeam"],
  ): CancelablePromise<TeamPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/teams/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create App
   * Create a new app.
   * @returns AppPublic Successful Response
   * @throws ApiError
   */
  public static createApp(
    data: PrivateData["CreateApp"],
  ): CancelablePromise<AppPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/apps/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Deployment
   * Create a new deployment.
   * @returns DeploymentPublic Successful Response
   * @throws ApiError
   */
  public static createDeployment(
    data: PrivateData["CreateDeployment"],
  ): CancelablePromise<DeploymentPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/deployments/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Environment Variable
   * Create a new environment variable.
   * @returns EnvironmentVariable Successful Response
   * @throws ApiError
   */
  public static createEnvironmentVariable(
    data: PrivateData["CreateEnvironmentVariable"],
  ): CancelablePromise<EnvironmentVariable> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/private/environment-variables/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }
}
