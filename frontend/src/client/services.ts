import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { AccessTokenWithUserMe,AuthorizeDeviceIn,Body_login_device_authorization,Body_login_login_access_token,Body_login_login_token,DeviceAuthorizationInfo,DeviceAuthorizationResponse,Message,NewPassword,Token,UserPublic,EmailVerificationToken,UpdatePassword,UserMePublic,UserRegister,UserUpdateEmailMe,UserUpdateMe,HealthCheckResponse,TeamCreate,TeamPublic,TeamsPublic,TeamUpdate,TeamUpdateMember,TeamWithUserPublic,UserTeamLinkPublic,InvitationCreate,InvitationPublic,InvitationsPublic,InvitationStatus,InvitationToken,AppCreate,AppPublic,AppsPublic,DeploymentPublic,DeploymentsPublic,DeploymentUploadOut } from './models';

export type TDataLoginAccessToken = {
                formData: Body_login_login_access_token
                
            }
export type TDataDeviceAuthorization = {
                formData: Body_login_device_authorization
                
            }
export type TDataDeviceAuthorizationInfo = {
                userCode: string
                
            }
export type TDataLoginToken = {
                formData: Body_login_login_token
                
            }
export type TDataAuthorizeDevice = {
                requestBody: AuthorizeDeviceIn
                
            }
export type TDataRecoverPassword = {
                email: string
                
            }
export type TDataResetPassword = {
                requestBody: NewPassword
                
            }
export type TDataRecoverPasswordHtmlContent = {
                email: string
                
            }

export class LoginService {

	/**
	 * Login Access Token
	 * OAuth2 compatible token login, get the access token and the user data
	 * @returns AccessTokenWithUserMe Successful Response
	 * @throws ApiError
	 */
	public static loginAccessToken(data: TDataLoginAccessToken): CancelablePromise<AccessTokenWithUserMe> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/access-token',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Device Authorization
	 * Device Authorization Grant
	 * @returns DeviceAuthorizationResponse Successful Response
	 * @throws ApiError
	 */
	public static deviceAuthorization(data: TDataDeviceAuthorization): CancelablePromise<DeviceAuthorizationResponse> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/device/authorization',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Device Authorization Info
	 * Get device authorization info
	 * @returns DeviceAuthorizationInfo Successful Response
	 * @throws ApiError
	 */
	public static deviceAuthorizationInfo(data: TDataDeviceAuthorizationInfo): CancelablePromise<DeviceAuthorizationInfo> {
		const {
userCode,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/login/device/authorization/{user_code}',
			path: {
				user_code: userCode
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Login Token
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginToken(data: TDataLoginToken): CancelablePromise<Token> {
		const {
formData,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/device/token',
			formData: formData,
			mediaType: 'application/x-www-form-urlencoded',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Authorize Device
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static authorizeDevice(data: TDataAuthorizeDevice): CancelablePromise<unknown> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/device/authorize',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Test Token
	 * Test access token
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static testToken(): CancelablePromise<UserPublic> {
				return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/login/test-token',
		});
	}

	/**
	 * Recover Password
	 * Password Recovery
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static recoverPassword(data: TDataRecoverPassword): CancelablePromise<Message> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Reset Password
	 * Reset password
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static resetPassword(data: TDataResetPassword): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/reset-password/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Recover Password Html Content
	 * HTML Content for Password Recovery
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static recoverPasswordHtmlContent(data: TDataRecoverPasswordHtmlContent): CancelablePromise<string> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/password-recovery-html-content/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataUpdateUserMe = {
                requestBody: UserUpdateMe
                
            }
export type TDataRequestEmailUpdate = {
                requestBody: UserUpdateEmailMe
                
            }
export type TDataVerifyUpdateEmailToken = {
                requestBody: EmailVerificationToken
                
            }
export type TDataUpdatePasswordMe = {
                requestBody: UpdatePassword
                
            }
export type TDataRegisterUser = {
                requestBody: UserRegister
                
            }
export type TDataVerifyEmailToken = {
                requestBody: EmailVerificationToken
                
            }
export type TDataVerifyEmailHtmlContent = {
                email: string
                
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
			method: 'GET',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Delete User Me
	 * Delete own user.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteUserMe(): CancelablePromise<Message> {
				return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/users/me',
		});
	}

	/**
	 * Update User Me
	 * Update own user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static updateUserMe(data: TDataUpdateUserMe): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Request Email Update
	 * Request to update own user email.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static requestEmailUpdate(data: TDataRequestEmailUpdate): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/me/email',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Verify Update Email Token
	 * Verify email update token.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static verifyUpdateEmailToken(data: TDataVerifyUpdateEmailToken): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/me/verify-update-email',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Password Me
	 * Update own password.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static updatePasswordMe(data: TDataUpdatePasswordMe): CancelablePromise<Message> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'PATCH',
			url: '/api/v1/users/me/password',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Register User
	 * Create new user without the need to be logged in.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static registerUser(data: TDataRegisterUser): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/signup',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Verify Email Token
	 * Verify email token
	 * @returns unknown Successful Response
	 * @throws ApiError
	 */
	public static verifyEmailToken(data: TDataVerifyEmailToken): CancelablePromise<unknown> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/verify-email',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Verify Email Html Content
	 * HTML Content for Email verification email
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static verifyEmailHtmlContent(data: TDataVerifyEmailHtmlContent): CancelablePromise<string> {
		const {
email,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/verify-email-html-content/{email}',
			path: {
				email
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataTestEmail = {
                emailTo: string
                
            }

export class UtilsService {

	/**
	 * Test Email
	 * Test emails.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
		const {
emailTo,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/utils/test-email/',
			query: {
				email_to: emailTo
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Health Check
	 * Health check.
	 * @returns HealthCheckResponse Successful Response
	 * @throws ApiError
	 */
	public static healthCheck(): CancelablePromise<HealthCheckResponse> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/utils/health-check/',
		});
	}

}

export type TDataReadTeams = {
                limit?: number
order?: 'asc' | 'desc'
orderBy?: 'created_at' | null
owner?: boolean
skip?: number
                
            }
export type TDataCreateTeam = {
                requestBody: TeamCreate
                
            }
export type TDataReadTeam = {
                teamSlug: string
                
            }
export type TDataUpdateTeam = {
                requestBody: TeamUpdate
teamSlug: string
                
            }
export type TDataDeleteTeam = {
                teamSlug: string
                
            }
export type TDataUpdateMemberInTeam = {
                requestBody: TeamUpdateMember
teamSlug: string
userId: string
                
            }
export type TDataRemoveMemberFromTeam = {
                teamSlug: string
userId: string
                
            }
export type TDataValidateTeamName = {
                teamSlug: string
                
            }

export class TeamsService {

	/**
	 * Read Teams
	 * Retrieve a list of teams accessible to the current user.
	 * @returns TeamsPublic Successful Response
	 * @throws ApiError
	 */
	public static readTeams(data: TDataReadTeams = {}): CancelablePromise<TeamsPublic> {
		const {
limit = 100,
order = 'asc',
orderBy,
owner = false,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/teams/',
			query: {
				skip, limit, order_by: orderBy, order, owner
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Team
	 * Create a new team with the provided details.
	 * @returns TeamPublic Successful Response
	 * @throws ApiError
	 */
	public static createTeam(data: TDataCreateTeam): CancelablePromise<TeamPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/teams/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Team
	 * Retrieve a team by its name and returns it along with its associated users.
	 * @returns TeamWithUserPublic Successful Response
	 * @throws ApiError
	 */
	public static readTeam(data: TDataReadTeam): CancelablePromise<TeamWithUserPublic> {
		const {
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/teams/{team_slug}',
			path: {
				team_slug: teamSlug
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Team
	 * Update an team by its name.
	 * @returns TeamPublic Successful Response
	 * @throws ApiError
	 */
	public static updateTeam(data: TDataUpdateTeam): CancelablePromise<TeamPublic> {
		const {
requestBody,
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/teams/{team_slug}',
			path: {
				team_slug: teamSlug
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Team
	 * Delete a team from the database by its name.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteTeam(data: TDataDeleteTeam): CancelablePromise<Message> {
		const {
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/teams/{team_slug}',
			path: {
				team_slug: teamSlug
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Member In Team
	 * Update a member in a team.
	 * @returns UserTeamLinkPublic Successful Response
	 * @throws ApiError
	 */
	public static updateMemberInTeam(data: TDataUpdateMemberInTeam): CancelablePromise<UserTeamLinkPublic> {
		const {
requestBody,
teamSlug,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/teams/{team_slug}/users/{user_id}',
			path: {
				team_slug: teamSlug, user_id: userId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Remove Member From Team
	 * Remove a member from a team.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static removeMemberFromTeam(data: TDataRemoveMemberFromTeam): CancelablePromise<Message> {
		const {
teamSlug,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/teams/{team_slug}/users/{user_id}',
			path: {
				team_slug: teamSlug, user_id: userId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Validate Team Name
	 * Validate if team name is unique
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static validateTeamName(data: TDataValidateTeamName): CancelablePromise<Message> {
		const {
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/teams/validate-team-name/{team_slug}',
			path: {
				team_slug: teamSlug
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadInvitationsMe = {
                limit?: number
skip?: number
                
            }
export type TDataReadInvitationsSent = {
                limit?: number
skip?: number
                
            }
export type TDataReadInvitationsTeamByAdmin = {
                limit?: number
skip?: number
status?: InvitationStatus | null
teamSlug: string
                
            }
export type TDataCreateInvitation = {
                requestBody: InvitationCreate
                
            }
export type TDataAcceptInvitation = {
                requestBody: InvitationToken
                
            }
export type TDataVerifyInvitation = {
                requestBody: InvitationToken
                
            }
export type TDataInvitationHtmlContent = {
                invitationId: string
                
            }
export type TDataDeleteInvitation = {
                invId: string
                
            }

export class InvitationsService {

	/**
	 * Read Invitations Me
	 * Retrieve a list of invitations accessible to the current user.
	 * @returns InvitationsPublic Successful Response
	 * @throws ApiError
	 */
	public static readInvitationsMe(data: TDataReadInvitationsMe = {}): CancelablePromise<InvitationsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/invitations/me',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Invitations Sent
	 * Retrieve a list of invitations sent by the current user.
	 * @returns InvitationsPublic Successful Response
	 * @throws ApiError
	 */
	public static readInvitationsSent(data: TDataReadInvitationsSent = {}): CancelablePromise<InvitationsPublic> {
		const {
limit = 100,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/invitations/sent',
			query: {
				skip, limit
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read Invitations Team By Admin
	 * Retrieve a list of invitations sent by the current user.
	 * @returns InvitationsPublic Successful Response
	 * @throws ApiError
	 */
	public static readInvitationsTeamByAdmin(data: TDataReadInvitationsTeamByAdmin): CancelablePromise<InvitationsPublic> {
		const {
limit = 100,
skip = 0,
status,
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/invitations/team/{team_slug}',
			path: {
				team_slug: teamSlug
			},
			query: {
				skip, limit, status
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Invitation
	 * Create new invitation.
	 * @returns InvitationPublic Successful Response
	 * @throws ApiError
	 */
	public static createInvitation(data: TDataCreateInvitation): CancelablePromise<InvitationPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/invitations/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Accept Invitation
	 * Accept an invitation.
	 * @returns InvitationPublic Successful Response
	 * @throws ApiError
	 */
	public static acceptInvitation(data: TDataAcceptInvitation): CancelablePromise<InvitationPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/invitations/accept',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Verify Invitation
	 * Verify an invitation token.
	 * @returns InvitationPublic Successful Response
	 * @throws ApiError
	 */
	public static verifyInvitation(data: TDataVerifyInvitation): CancelablePromise<InvitationPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/invitations/token/verify',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Invitation Html Content
	 * HTML Content for Invitation email
	 * @returns string Successful Response
	 * @throws ApiError
	 */
	public static invitationHtmlContent(data: TDataInvitationHtmlContent): CancelablePromise<string> {
		const {
invitationId,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/invitations/team-invitation-html-content/{invitation_id}',
			path: {
				invitation_id: invitationId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Delete Invitation
	 * Delete an invitation.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteInvitation(data: TDataDeleteInvitation): CancelablePromise<Message> {
		const {
invId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/invitations/{inv_id}',
			path: {
				inv_id: invId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadApps = {
                limit?: number
order?: 'asc' | 'desc'
orderBy?: 'created_at' | null
skip?: number
teamSlug: string
                
            }
export type TDataCreateApp = {
                requestBody: AppCreate
                
            }

export class AppsService {

	/**
	 * Read Apps
	 * Retrieve a list of apps for the provided team.
	 * @returns AppsPublic Successful Response
	 * @throws ApiError
	 */
	public static readApps(data: TDataReadApps): CancelablePromise<AppsPublic> {
		const {
limit = 100,
order = 'asc',
orderBy,
skip = 0,
teamSlug,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/apps/',
			query: {
				team_slug: teamSlug, skip, limit, order_by: orderBy, order
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create App
	 * Create a new app with the provided details.
	 * @returns AppPublic Successful Response
	 * @throws ApiError
	 */
	public static createApp(data: TDataCreateApp): CancelablePromise<AppPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/apps/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

}

export type TDataReadDeployments = {
                appId: string
limit?: number
order?: 'asc' | 'desc'
orderBy?: 'created_at' | null
skip?: number
                
            }
export type TDataCreateDeployment = {
                appId: string
                
            }
export type TDataUploadDeploymentArtifact = {
                deploymentId: string
                
            }

export class DeploymentsService {

	/**
	 * Read Deployments
	 * Retrieve a list of deployments for the provided app.
	 * @returns DeploymentsPublic Successful Response
	 * @throws ApiError
	 */
	public static readDeployments(data: TDataReadDeployments): CancelablePromise<DeploymentsPublic> {
		const {
appId,
limit = 100,
order = 'asc',
orderBy,
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/apps/{app_id}/deployments/',
			path: {
				app_id: appId
			},
			query: {
				skip, limit, order_by: orderBy, order
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Create Deployment
	 * Create a new deployment.
	 * @returns DeploymentPublic Successful Response
	 * @throws ApiError
	 */
	public static createDeployment(data: TDataCreateDeployment): CancelablePromise<DeploymentPublic> {
		const {
appId,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/apps/{app_id}/deployments/',
			path: {
				app_id: appId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Upload Deployment Artifact
	 * Upload a new deployment artifact.
	 * @returns DeploymentUploadOut Successful Response
	 * @throws ApiError
	 */
	public static uploadDeploymentArtifact(data: TDataUploadDeploymentArtifact): CancelablePromise<DeploymentUploadOut> {
		const {
deploymentId,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/deployments/{deployment_id}/upload',
			path: {
				deployment_id: deploymentId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

}