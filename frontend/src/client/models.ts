export type AccessTokenWithUserMe = {
	access_token: string;
	token_type?: string;
	user: UserMePublic;
};



export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type EmailVerificationToken = {
	token: string;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
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

