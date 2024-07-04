import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { AccessTokenWithUserMe,Body_login_login_access_token,Message,NewPassword,UserPublic,EmailVerificationToken,UpdatePassword,UserMePublic,UserRegister,UserUpdateMe,TeamCreate,TeamPublic,TeamsPublic,TeamUpdate,TeamUpdateMember,TeamWithUserPublic,UserTeamLinkPublic,InvitationCreate,InvitationPublic,InvitationsPublic,InvitationStatus,InvitationToken } from './models';

export type TDataLoginAccessToken = {
                formData: Body_login_login_access_token
                
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

}

export type TDataReadTeams = {
                limit?: number
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
userId: number
                
            }
export type TDataRemoveMemberFromTeam = {
                teamSlug: string
userId: number
                
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
skip = 0,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/teams/',
			query: {
				skip, limit
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
                invitationId: number
                
            }
export type TDataDeleteInvitation = {
                invId: number
                
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