import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProfesorDto {
  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción o biografía del profesor',
    example: 'Especialista en desarrollo web',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Especialidad principal del profesor',
    example: 'Frontend',
  })
  @IsString()
  @IsOptional()
  especialidad?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen del profesor',
    example: 'https://example.com/profesor.jpg',
  })
  @IsUrl()
  @IsOptional()
  imagen_url?: string;
}
