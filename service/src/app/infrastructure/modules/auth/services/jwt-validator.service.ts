// infrastructure/adapters/auth/services/jwt-validator.service.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa-v2';
import { DomainError, NotAuthorizedError } from '@domain/errors';

export class JwtValidatorService {
	private client: jwksClient.JwksClient;

	constructor(jwksUri: string) {
		this.client = jwksClient({ jwksUri });
	}

	async validate(token: string): Promise<{ username: string }> {
		return new Promise((resolve, reject) => {
			jwt.verify(token, this.getKey.bind(this), (err, decoded) => {
				if (err) {
					reject(this.handleJwtError(err));
				} else if (this.isValidPayload(decoded)) {
					resolve(decoded as { username: string });
				} else {
					reject(NotAuthorizedError('Invalid token payload'));
				}
			});
		});
	}

	private getKey(header: any, callback: jwt.SigningKeyCallback): void {
		this.client.getSigningKey(header.kid, (err, key) => {
			if (err) {
				callback(NotAuthorizedError('Invalid token signature'));
			} else {
				callback(null, key.getPublicKey());
			}
		});
	}

	private handleJwtError(err: any): DomainError {
		if (err.name === 'TokenExpiredError') {
			return NotAuthorizedError('Token expired');
		}
		return NotAuthorizedError('Invalid token');
	}

	private isValidPayload(decoded: any): boolean {
		return decoded && typeof decoded === 'object' && 'username' in decoded;
	}
}
