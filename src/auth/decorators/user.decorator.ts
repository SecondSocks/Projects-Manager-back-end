/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from 'generated/prisma'

export const CurrentUser = createParamDecorator(
	(data: keyof User, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest()
		const user = request.user

		return data ? user[data] : user
	}
)
