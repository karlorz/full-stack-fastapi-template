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



export type ItemCreate = {
	title: string;
	description?: string | null;
};



export type ItemPublic = {
	title: string;
	description?: string | null;
	id: number;
	owner_id: number;
};



export type ItemUpdate = {
	title?: string | null;
	description?: string | null;
};



export type ItemsPublic = {
	data: Array<ItemPublic>;
	count: number;
};



export type Message = {
	message: string;
};



export type NewPassword = {
	token: string;
	new_password: string;
};



export type OrganizationCreate = {
	name: string;
	description?: string | null;
};



export type OrganizationCreateMember = {
	user_id: number;
	role: Role;
};



export type OrganizationPublic = {
	name: string;
	description?: string | null;
	id: number;
};



export type OrganizationUpdate = {
	name?: string | null;
	description?: string | null;
};



export type OrganizationUpdateMember = {
	role: Role;
};



export type OrganizationWithUserPublic = {
	name: string;
	description?: string | null;
	id: number;
	user_links: Array<UserLinkPublic>;
};



export type OrganizationsPublic = {
	data: Array<OrganizationPublic>;
	count: number;
};



export type Role = 'member' | 'admin';



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
	is_superuser?: boolean;
	full_name?: string | null;
	password: string;
};



export type UserLinkPublic = {
	role: Role;
	user: UserPublic;
};



export type UserOrganizationLinkPublic = {
	user: UserPublic;
	organization: OrganizationPublic;
	role: Role;
};



export type UserPublic = {
	email: string;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	id: number;
};



export type UserRegister = {
	email: string;
	password: string;
	full_name?: string | null;
};



export type UserUpdate = {
	email?: string | null;
	is_active?: boolean;
	is_superuser?: boolean;
	full_name?: string | null;
	password?: string | null;
};



export type UserUpdateMe = {
	full_name?: string | null;
	email?: string | null;
};



export type UsersPublic = {
	data: Array<UserPublic>;
	count: number;
};



export type ValidationError = {
	loc: Array<string | number>;
	msg: string;
	type: string;
};

