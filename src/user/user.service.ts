import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from 'generated/prisma'
import { RegisterDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { email }
		})

		if (!user) throw new NotFoundException('User not found')

		return user
	}

	async getById(userId: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})

		if (!user) throw new NotFoundException('User not found')

		return user
	}

	async create(data: RegisterDto): Promise<User> {
		const user = await this.prisma.user.create({
			data
		})

		return user
	}
}
