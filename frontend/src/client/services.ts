import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { Body_login_login_access_token,Message,NewPassword,Token,UserPublic,UpdatePassword,UserCreate,UserRegister,UserUpdateMe,TeamCreate,TeamPublic,TeamsPublic,TeamUpdate,TeamUpdateMember,TeamWithUserPublic,UserTeamLinkPublic,InvitationCreate,InvitationPublic,InvitationsPublic,InvitationToken } from './models';

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
	 * OAuth2 compatible token login, get an access token for future requests
	 * @returns Token Successful Response
	 * @throws ApiError
	 */
	public static loginAccessToken(data: TDataLoginAccessToken): CancelablePromise<Token> {
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

export type TDataCreateUser = {
                requestBody: UserCreate
                
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

export class UsersService {

	/**
	 * Create User
	 * Create new user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static createUser(data: TDataCreateUser): CancelablePromise<UserPublic> {
		const {
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/v1/users/',
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Read User Me
	 * Get current user.
	 * @returns UserPublic Successful Response
	 * @throws ApiError
	 */
	public static readUserMe(): CancelablePromise<UserPublic> {
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
                teamId: number
                
            }
export type TDataUpdateTeam = {
                requestBody: TeamUpdate
teamId: number
                
            }
export type TDataDeleteTeam = {
                teamId: number
                
            }
export type TDataUpdateMemberInTeam = {
                requestBody: TeamUpdateMember
teamId: number
userId: number
                
            }
export type TDataRemoveMemberFromTeam = {
                teamId: number
userId: number
                
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
	 * Retrieve an team by its ID and returns it along with its associated users.
	 * @returns TeamWithUserPublic Successful Response
	 * @throws ApiError
	 */
	public static readTeam(data: TDataReadTeam): CancelablePromise<TeamWithUserPublic> {
		const {
teamId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/teams/{team_id}',
			path: {
				team_id: teamId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Team
	 * Update an team by its ID.
	 * @returns TeamPublic Successful Response
	 * @throws ApiError
	 */
	public static updateTeam(data: TDataUpdateTeam): CancelablePromise<TeamPublic> {
		const {
requestBody,
teamId,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/teams/{team_id}',
			path: {
				team_id: teamId
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
	 * Delete an team from the database.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static deleteTeam(data: TDataDeleteTeam): CancelablePromise<Message> {
		const {
teamId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/teams/{team_id}',
			path: {
				team_id: teamId
			},
			errors: {
				422: `Validation Error`,
			},
		});
	}

	/**
	 * Update Member In Team
	 * Update a member in an team.
	 * @returns UserTeamLinkPublic Successful Response
	 * @throws ApiError
	 */
	public static updateMemberInTeam(data: TDataUpdateMemberInTeam): CancelablePromise<UserTeamLinkPublic> {
		const {
requestBody,
teamId,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'PUT',
			url: '/api/v1/teams/{team_id}/users/{user_id}',
			path: {
				team_id: teamId, user_id: userId
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
	 * Remove a member from an team.
	 * @returns Message Successful Response
	 * @throws ApiError
	 */
	public static removeMemberFromTeam(data: TDataRemoveMemberFromTeam): CancelablePromise<Message> {
		const {
teamId,
userId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/api/v1/teams/{team_id}/users/{user_id}',
			path: {
				team_id: teamId, user_id: userId
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
teamId: number
                
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
teamId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/v1/invitations/team/{team_id}',
			path: {
				team_id: teamId
			},
			query: {
				skip, limit
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