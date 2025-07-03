import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { User } from 'generated/prisma'
import { RegisterDto } from 'src/auth/dto/auth.dto'
import { PrismaService } from 'src/prisma.service'
import { UserCreateDto } from './dto/user.dto'
import { UserProfileSelect } from './user.select'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	// For all users
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

	async getProfile(userId: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: UserProfileSelect
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

	async updateProfile(userId: string, data: Partial<User>): Promise<User> {
		const user = await this.prisma.user.update({
			where: { id: userId },
			data,
			select: UserProfileSelect
		})

		if (!user) throw new NotFoundException('User not found')

		return user
	}

	async delete(userId: string): Promise<boolean> {
		const user = await this.prisma.user.delete({
			where: { id: userId }
		})

		if (!user) throw new NotFoundException('User not found')

		return true
	}

	// For admin
	async getAllUsers(): Promise<User[]> {
		const users = await this.prisma.user.findMany()

		if (!users || users.length === 0)
			throw new NotFoundException('No users found')

		return users
	}

	async updateUser(userId: string, data: Partial<User>): Promise<User> {
		const user = await this.prisma.user.update({
			where: { id: userId },
			data
		})

		if (!user) throw new NotFoundException('User not found')

		return user
	}

	async createUser(data: UserCreateDto): Promise<User['id']> {
		const oldUser: User = await this.getByEmail(data.email)

		if (oldUser)
			throw new BadRequestException('User already exists with this email')

		const user: User = await this.prisma.user.create({
			data
		})

		if (!user) throw new InternalServerErrorException('User creation failed')

		return user.id
	}
}
