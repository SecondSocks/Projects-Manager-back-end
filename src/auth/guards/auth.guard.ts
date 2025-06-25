import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	UseGuards,
	applyDecorators
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { User } from 'generated/prisma'
import { TypeRole } from 'src/auth/auth.interface'
import { JwtAuthGuard } from './jwt.guard'

export const UseAuth = (role: TypeRole = undefined) =>
	applyDecorators(
		role === 'admin'
			? UseGuards(JwtAuthGuard, OnlyAdminGuard)
			: UseGuards(JwtAuthGuard)
	)

export class OnlyAdminGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: User }>()
		const user = request.user

		if (!user.isAdmin) throw new ForbiddenException('You are not an admin')

		return user.isAdmin as boolean
	}
}
