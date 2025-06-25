import {
	ArgumentMetadata,
	BadRequestException,
	PipeTransform
} from '@nestjs/common'
import { validate as isUUID } from 'uuid'

export class UUIdValidationPipe implements PipeTransform {
	transform(value: string, meta: ArgumentMetadata) {
		if (meta.type === 'param' && !isUUID(value)) {
			throw new BadRequestException(`Invalid UUID: ${value}`)
		}

		if (!isUUID(value)) throw new BadRequestException(`Invalid UUID: ${value}`)

		return value
	}
}
