import {
	Body,
	Controller,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Регистрирует нового пользователя.
	 *
	 * Обрабатывает POST-запрос по маршруту `/register`.
	 * Валидирует входящие данные через `ValidationPipe` и передаёт их в сервис аутентификации.
	 *
	 * @route POST /register
	 * @status 200 OK
	 * @param {RegisterDto} dto - DTO с данными пользователя для регистрации (email, пароль и т.п.)
	 * @returns {Promise<AuthReturns>} Объект с пользователем и JWT токенами
	 */
	@Post('register')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	/**
	 * Выполняет вход пользователя в систему.
	 *
	 * Обрабатывает POST-запрос на `/login`, валидирует данные через `ValidationPipe`
	 * и передаёт их в сервис аутентификации для получения токенов.
	 *
	 * @route POST /login
	 * @status 200 OK
	 * @param {LoginDto} dto - DTO с данными для входа (обычно email и пароль)
	 * @returns {Promise<AuthReturns>} Объект с пользователем и JWT токенами
	 */
	@Post('login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto)
	}

	/**
	 * Обновляет JWT-токены по refresh токену.
	 *
	 * Обрабатывает POST-запрос на `/login/access-token`.
	 * Валидирует тело запроса и передаёт `refreshToken` в сервис аутентификации для генерации новых токенов.
	 *
	 * @route POST /login/access-token
	 * @status 200 OK
	 * @param {RefreshTokenDto} dto - DTO, содержащий refresh токен
	 * @returns {Promise<AuthReturns>} Объект с новым access и refresh токенами, а также данными пользователя
	 */
	@Post('login/access-token')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async getNewTokens(@Body() { refreshToken }: RefreshTokenDto) {
		return this.authService.getNewTokens(refreshToken)
	}
}
