export type Body_login_login_access_token = {
	grant_type?: string | null;
	username: string;
	password: string;
	scope?: string;
	client_id?: string | null;
	client_secret?: string | null;
};



export type HTTPValidationError = {
	detail?: Array<ValidationError>;
};



export type Message = {
	message: string;
};



export type NewPassword = {
	token: string;
	new_password: string;
};



export type Role = 'member' | 'admin';



export type TeamCreate = {
	name: string;
	description?: string | null;
};



export type TeamCreateMember = {
	user_id: number;
	role: Role;
};



export type TeamPublic = {
	name: string;
	description?: string | null;
	id: number;
};



export type TeamUpdate = {
	name?: string | null;
	description?: string | null;
};



export type TeamUpdateMember = {
	role: Role;
};



export type TeamWithUserPublic = {
	name: string;
	description?: string | null;
	id: number;
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



export type UserCreate = {
	email: string;
	is_active?: boolean;
	full_name?: string | null;
	password: string;
};



export type UserLinkPublic = {
	role: Role;
	user: UserPublic;
};



export type UserPublic = {
	email: string;
	is_active?: boolean;
	full_name?: string | null;
	id: number;
};



export type UserRegister = {
	email: string;
	password: string;
	full_name?: string | null;
};



export type UserTeamLinkPublic = {
	user: UserPublic;
	team: TeamPublic;
	role: Role;
};



export type UserUpdateMe = {
	full_name?: string | null;
	email?: string | null;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};

