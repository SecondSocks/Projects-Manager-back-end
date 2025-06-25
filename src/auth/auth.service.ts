/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { User } from 'generated/prisma'
import { PrismaService } from 'src/prisma.service'
import { UserService } from 'src/user/user.service'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import { AuthReturns, ITokens } from './types/auth.types'

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	/**
	 * Регистрация пользователя
	 * 1. Проверяет существование пользователя по уникальному email
	 * 2. Если не пользователь не существует, создает его
	 * 3. Получает токены по id пользователя
	 * 4. Проверяет наличие пользователя и токенов. При отсутствии одного из них выбрасывает ошибку
	 * 5. Возвращает созданного пользователя и access с refresh токены
	 * @async
	 * @param {RegisterDto} data - Данные для регистрации
	 * @throws {BadRequestException} - Если пользователь существует
	 * @throws {InternalServerErrorException} - Если произошла какая-то внутрення ошибка сервера
	 *
	 * @returns {Promise<AuthReturns>} - Возвращает данные по типу AuthReturns: пользователь, accessToken и refreshToken
	 */
	async register(data: RegisterDto): Promise<AuthReturns> {
		const oldUser: User = await this.userService.getByEmail(data.email)

		if (oldUser) throw new BadRequestException('User already exists')

		const user: User = await this.userService.create(data)
		const tokens: ITokens = await this.issueTokens(user.id)

		if (!user && !tokens)
			throw new InternalServerErrorException('Internal server error')

		return {
			user,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken
		}
	}

	/**
	 * Вход существующего пользователя в систему
	 *
	 * 1. Валидириует пользователя по email и password. Если true, получает его
	 * 2. Создает токены по id пользователя
	 * 3. Если нет пользователя или токенов, выбрасывает ошибку
	 *
	 * @async
	 * @param {LoginDto} data - Данные для входа
	 * @throws {InternalServerErrorException} - Ошибка, если произойдет внутренняя ошибка сервера
	 * @returns {Promise<AuthReturns>} - Возвращает данные по типу AuthReturns: пользователь, accessToken и refreshToken
	 */
	async login(data: LoginDto): Promise<AuthReturns> {
		const user: User = await this.validateUser(data.email, data.password)
		const tokens: ITokens = await this.issueTokens(user.id)

		if (!user && !tokens)
			throw new InternalServerErrorException('Internal server exception')

		return {
			user,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken
		}
	}

	/**
	 * Получение новых токенов
	 *
	 * 1. Верификация пользователя
	 * 2. Если пользователь не авторизированный, выбрасываем ошибку
	 * 3. Получаем пользователя по id
	 * 4. Получаем токены
	 *
	 * @async
	 * @param {string} refreshToken - Refresh token для подтверждения верификации
	 * @returns {Promise<AuthReturns>} - Возвращает данные по типу AuthReturns: пользователь, accessToken и refreshToken
	 */
	async getNewTokens(refreshToken: string): Promise<AuthReturns> {
		const result: User = await this.jwtService.verifyAsync(refreshToken)

		if (!result) throw new UnauthorizedException('Invalid token')

		const user: User = await this.userService.getById(result.id)
		const tokens: ITokens = await this.issueTokens(user.id)

		return {
			user,
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken
		}
	}

	/**
	 * Создание токенов
	 *
	 * 1. Для удобства преобразуем получаемый userId в объект data с полем id: userId
	 * 2. Асинхронно подписываем accessToken на 1 час с использованием data
	 * 3. Асинхронно подписываем refreshToken на 7 дней с использованием data
	 *
	 * @async
	 * @private
	 * @param {string} userId - Id пользователя
	 * @returns {Promise<ITokens>} - Возвращаем accessToken и refreshToken
	 */
	private async issueTokens(userId: string): Promise<ITokens> {
		const data = {
			id: userId
		}

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1h'
		})

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	/**
	 * Валидация пользователя
	 *
	 * 1. Получаем пользователя по email
	 * 2. Если пользователь отсутствует, выбрасываем ошибку
	 * 3. Верифицируем совпадение введенного пароля и зарегистрированного пароля
	 * 4. Если верификация не прошла, выбрасываем ошибку
	 *
	 * @async
	 * @private
	 * @param {string} email - Введенная почта
	 * @param {string} password - Введенный пароль
	 * @throws {NotFoundException} - Ошибка, если пользователь не будет найден
	 * @throws {BadRequestException} - Ошибка, если введенный пароль не совпадает с зарегистрированным
	 * @returns {User} - Возвращает пользователя
	 */
	private async validateUser(email: string, password: string): Promise<User> {
		const user: User = await this.userService.getByEmail(email)

		if (!user) throw new NotFoundException('User not found')

		const isValid: boolean = await verify(user.password, password)

		if (!isValid) throw new BadRequestException('Invalid password')

		return user
	}
}
