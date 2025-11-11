import { PartialType } from '@nestjs/swagger';
import { CreateProfesorDto } from './create-profesores.dto';

export class UpdateProfesorDto extends PartialType(CreateProfesorDto) {}
