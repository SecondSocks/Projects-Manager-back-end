import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// Logger
	const logger = new Logger('App')
	logger.log('Сообщение', { context: 'AppModule' })

	// Cors settings
	const corsOptions = {
		origin: (process.env.CORS_ORIGIN ?? '*').split(','),
		methods: (
			process.env.CORS_METHODS ?? 'GET,HEAD,PUT,PATCH,POST,DELETE'
		).split(','),
		credentials: process.env.CORS_CREDENTIALS === 'true'
	}
	app.enableCors(corsOptions)

	app.setGlobalPrefix('api')
	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
