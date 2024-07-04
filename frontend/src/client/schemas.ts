export const $AccessTokenWithUserMe = {
	properties: {
		access_token: {
	type: 'string',
	isRequired: true,
},
		token_type: {
	type: 'string',
	default: 'bearer',
},
		user: {
	type: 'UserMePublic',
	isRequired: true,
},
	},
} as const;

export const $Body_login_login_access_token = {
	properties: {
		grant_type: {
	type: 'any-of',
	contains: [{
	type: 'string',
	pattern: 'password',
}, {
	type: 'null',
}],
},
		username: {
	type: 'string',
	isRequired: true,
},
		password: {
	type: 'string',
	isRequired: true,
},
		scope: {
	type: 'string',
	default: '',
},
		client_id: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
		client_secret: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'null',
}],
},
	},
} as const;

export const $EmailVerificationToken = {
	properties: {
		token: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $HTTPValidationError = {
	properties: {
		detail: {
	type: 'array',
	contains: {
		type: 'ValidationError',
	},
},
	},
} as const;

export const $InvitationCreate = {
	properties: {
		role: {
	type: 'all-of',
	contains: [{
	type: 'app__models__Role__1',
}],
	isRequired: true,
},
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		team_slug: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $InvitationPublic = {
	properties: {
		role: {
	type: 'all-of',
	contains: [{
	type: 'app__models__Role__1',
}],
	isRequired: true,
},
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		id: {
	type: 'number',
	isRequired: true,
},
		team_id: {
	type: 'number',
	isRequired: true,
},
		invited_by_id: {
	type: 'number',
	isRequired: true,
},
		status: {
	type: 'InvitationStatus',
	isRequired: true,
},
		created_at: {
	type: 'string',
	isRequired: true,
	format: 'date-time',
},
		sender: {
	type: 'UserPublic',
	isRequired: true,
},
		team: {
	type: 'TeamPublic',
	isRequired: true,
},
	},
} as const;

export const $InvitationStatus = {
	type: 'Enum',
	enum: ['pending','accepted',],
} as const;

export const $InvitationToken = {
	properties: {
		token: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $InvitationsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'InvitationPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $Message = {
	properties: {
		message: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $NewPassword = {
	properties: {
		token: {
	type: 'string',
	isRequired: true,
},
		new_password: {
	type: 'string',
	isRequired: true,
	maxLength: 40,
	minLength: 8,
},
	},
} as const;

export const $TeamCreate = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
	},
} as const;

export const $TeamPublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		slug: {
	type: 'string',
	maxLength: 255,
},
	},
} as const;

export const $TeamUpdate = {
	properties: {
		name: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
	},
} as const;

export const $TeamUpdateMember = {
	properties: {
		role: {
	type: 'app__models__Role__1',
	isRequired: true,
},
	},
} as const;

export const $TeamWithUserPublic = {
	properties: {
		name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
		description: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
}, {
	type: 'null',
}],
},
		id: {
	type: 'number',
	isRequired: true,
},
		slug: {
	type: 'string',
	maxLength: 255,
},
		user_links: {
	type: 'array',
	contains: {
		type: 'UserLinkPublic',
	},
	isRequired: true,
},
	},
} as const;

export const $TeamsPublic = {
	properties: {
		data: {
	type: 'array',
	contains: {
		type: 'TeamPublic',
	},
	isRequired: true,
},
		count: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $UpdatePassword = {
	properties: {
		current_password: {
	type: 'string',
	isRequired: true,
	maxLength: 40,
	minLength: 8,
},
		new_password: {
	type: 'string',
	isRequired: true,
	maxLength: 40,
	minLength: 8,
},
	},
} as const;

export const $UserLinkPublic = {
	properties: {
		role: {
	type: 'app__models__Role__1',
	isRequired: true,
},
		user: {
	type: 'UserPublic',
	isRequired: true,
},
	},
} as const;

export const $UserMePublic = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		full_name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
		id: {
	type: 'number',
	isRequired: true,
},
		personal_team_slug: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $UserPublic = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		is_active: {
	type: 'boolean',
	default: true,
},
		full_name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
		id: {
	type: 'number',
	isRequired: true,
},
	},
} as const;

export const $UserRegister = {
	properties: {
		email: {
	type: 'string',
	isRequired: true,
	format: 'email',
	maxLength: 255,
},
		password: {
	type: 'string',
	isRequired: true,
	maxLength: 40,
	minLength: 8,
},
		full_name: {
	type: 'string',
	isRequired: true,
	maxLength: 255,
	minLength: 3,
},
	},
} as const;

export const $UserTeamLinkPublic = {
	properties: {
		user: {
	type: 'UserPublic',
	isRequired: true,
},
		team: {
	type: 'TeamPublic',
	isRequired: true,
},
		role: {
	type: 'app__models__Role__1',
	isRequired: true,
},
	},
} as const;

export const $UserUpdateMe = {
	properties: {
		full_name: {
	type: 'any-of',
	contains: [{
	type: 'string',
	maxLength: 255,
	minLength: 3,
}, {
	type: 'null',
}],
},
		email: {
	type: 'any-of',
	contains: [{
	type: 'string',
	format: 'email',
	maxLength: 255,
}, {
	type: 'null',
}],
},
	},
} as const;

export const $ValidationError = {
	properties: {
		loc: {
	type: 'array',
	contains: {
	type: 'any-of',
	contains: [{
	type: 'string',
}, {
	type: 'number',
}],
},
	isRequired: true,
},
		msg: {
	type: 'string',
	isRequired: true,
},
		type: {
	type: 'string',
	isRequired: true,
},
	},
} as const;

export const $app__models__Role__1 = {
	type: 'Enum',
	enum: ['member','admin',],
} as const;

export const $app__models__Role__2 = {
	type: 'app__models__Role__1',
	maxLength: 255,
} as const;