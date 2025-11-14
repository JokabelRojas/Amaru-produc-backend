import { PartialType } from '@nestjs/swagger';
import { CreateActividadDto } from './create-actividad.dto';

export class UpdateActividadDto extends PartialType(CreateActividadDto) {}