import { PartialType } from '@nestjs/swagger';
import { CreateServicioDto } from './create-servicios.dto';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {}