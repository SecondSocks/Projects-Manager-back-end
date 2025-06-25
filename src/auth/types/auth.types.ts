import { User } from 'generated/prisma'

export interface IAccessToken {
	accessToken: string
}

export interface IRefreshToken {
	refreshToken: string
}

export type ITokens = IAccessToken & IRefreshToken
export type AuthReturns = {
	user: User
} & ITokens
