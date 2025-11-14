import { PartialType } from '@nestjs/swagger';
import { CreatePremioDto } from './create-premio.dto';

export class UpdatePremioDto extends PartialType(CreatePremioDto) {}