import { IsString, IsOptional, IsIn, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ 
    description: 'Título del servicio', 
    example: 'Desarrollo de Aplicaciones Web' 
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ 
    description: 'Descripción del servicio', 
    example: 'Desarrollo de aplicaciones web modernas utilizando React, Node.js y MongoDB' 
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ 
    description: 'Estado del servicio', 
    enum: ['activo', 'inactivo'], 
    example: 'activo' 
  })
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ 
    description: 'URL de la imagen del servicio', 
    example: 'https://ejemplo.com/imagen-servicio.jpg' 
  })
  @IsString({ message: 'La URL de la imagen debe ser una cadena' })
  @IsUrl({}, { message: 'La URL de la imagen debe ser válida' })
  @IsOptional()
  imagen_url?: string;
}