import { PartialType } from '@nestjs/swagger';
import { CreateFestivalDto } from './create-festivales.dto';

export class UpdateFestivalDto extends PartialType(CreateFestivalDto) {}