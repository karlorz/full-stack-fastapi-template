export type AccessTokenWithUserMe = {
	access_token: string;
	token_type?: string;
	user: UserMePublic;
};



export type AuthorizeDeviceIn = {
	user_code: string;
};



export type Body_login_device_authorization = {
	client_id: string;
};



export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type Body_login_login_token = {
	client_id: string;
	device_code: string;
	grant_type: 'urn:ietf:params:oauth:grant-type:device_code';
};




export type DeviceAuthorizationInfo = {
	device_code: string;
	created_at: string;
	request_ip: string | null;
};



export type DeviceAuthorizationResponse = {
	device_code: string;
	user_code: string;
	verification_uri: string;
	verification_uri_complete: string;
	expires_in: number;
	interval: number;
};



export type EmailVerificationToken = {
	token: string;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type HealthCheckResponse = {
	redis: boolean;
};



export type InvitationCreate = {
	role: 'member' | 'admin';
	email: string;
	team_slug: string;
};




export type InvitationPublic = {
	role: 'member' | 'admin';
	email: string;
	id: string;
	team_id: string;
	invited_by_id: string;
	status: InvitationStatus;
	created_at: string;
	sender: UserPublic;
	team: TeamPublic;
};




export type InvitationStatus = 'pending' | 'accepted';



export type InvitationToken = {
	token: string;
};



export type InvitationsPublic = {
	data: Array<InvitationPublic>;
	count: number;
};



export type Message = {
	message: string;
};



export type NewPassword = {
	token: string;
	new_password: string;
};



export type TeamCreate = {
	name: string;
	description?: string | null;
};



export type TeamPublic = {
	name: string;
	description?: string | null;
	id: string;
	slug?: string;
};



export type TeamUpdate = {
	name?: string | null;
	description?: string | null;
};



export type TeamUpdateMember = {
	role: app__models__Role__1;
};



export type TeamWithUserPublic = {
	name: string;
	description?: string | null;
	id: string;
	slug?: string;
	user_links: Array<UserLinkPublic>;
};



export type TeamsPublic = {
	data: Array<TeamPublic>;
	count: number;
};



export type Token = {
	access_token: string;
	token_type?: string;
};



export type UpdatePassword = {
	current_password: string;
	new_password: string;
};



export type UserLinkPublic = {
	role: app__models__Role__1;
	user: UserPublic;
};



export type UserMePublic = {
	email: string;
	is_active?: boolean;
	full_name: string;
	id: string;
	personal_team_slug: string;
};



export type UserPublic = {
	email: string;
	is_active?: boolean;
	full_name: string;
	id: string;
};



export type UserRegister = {
	email: string;
	password: string;
	full_name: string;
};



export type UserTeamLinkPublic = {
	user: UserPublic;
	team: TeamPublic;
	role: app__models__Role__1;
};



export type UserUpdateEmailMe = {
	email: string;
};



export type UserUpdateMe = {
	full_name: string;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};



export type app__models__Role__1 = 'member' | 'admin';



export type app__models__Role__2 = 'member' | 'admin';

