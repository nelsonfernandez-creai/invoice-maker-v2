/**
 * Login credentials
 */
export type LoginCredentials = {
	username: string;
	password: string;
};

/**
 * Authentication result
 */
export type AuthResult = {
	accessToken: string;
	expiresIn: number;
};

/**
 * Authentication service port
 */
export interface IAuthenticationService {
	login: (credentials: LoginCredentials) => Promise<AuthResult>;
}
