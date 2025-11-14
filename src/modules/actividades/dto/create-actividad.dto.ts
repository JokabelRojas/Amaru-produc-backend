import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateActividadDto {
  @ApiProperty({
    description: 'Nombre de la actividad',
    example: 'Taller de Programación',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la actividad',
    example: 'Taller práctico de introducción a la programación',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}