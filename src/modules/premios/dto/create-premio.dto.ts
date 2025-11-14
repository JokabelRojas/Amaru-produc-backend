import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDate, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePremioDto {
  @ApiProperty({
    description: 'Título del premio',
    example: 'Mejor Proyecto de Innovación',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Fecha del premio',
    example: '2024-03-15',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  fecha: Date;

  @ApiPropertyOptional({
    description: 'Descripción del premio',
    example: 'Reconocimiento al mejor proyecto de innovación tecnológica',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen del premio',
    example: 'https://example.com/premio.jpg',
  })
  @IsUrl()
  @IsOptional()
  url_imagen?: string;
}