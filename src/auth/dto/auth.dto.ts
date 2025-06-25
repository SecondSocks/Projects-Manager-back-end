/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsString()
	name: string

	@IsString()
	surname: string

	@IsNumber()
	age: number

	@IsEmail()
	email: string

	@IsString()
	phoneNumber: string

	@IsString()
	@MinLength(6)
	password: string
}

export class LoginDto {
	@IsEmail()
	email: string

	@IsString()
	password: string
}

export class RefreshTokenDto {
	@IsString()
	refreshToken: string
}
