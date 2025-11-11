import { IsString, IsOptional, IsMongoId, IsIn, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ description: 'Título del servicio', example: 'Reparación de computadoras' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Descripción del servicio', example: 'Reparación de hardware y software' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'ID de la categoría (MongoDB ObjectId)', example: '507f1f77bcf86cd799439010' })
  @IsMongoId({ message: 'ID de categoría inválido' })
  id_categoria: string;

  @ApiProperty({ description: 'ID de la subcategoría (MongoDB ObjectId)', example: '507f1f77bcf86cd799439011' })
  @IsMongoId({ message: 'ID de subcategoría inválido' })
  id_subcategoria: string;

  @ApiPropertyOptional({ description: 'Estado del servicio', enum: ['activo', 'inactivo'], example: 'activo' })
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser "activo" o "inactivo"' })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ description: 'URL de la imagen del servicio', example: 'https://miservicio.com/imagen.jpg' })
  @IsString({ message: 'La URL de la imagen debe ser una cadena' })
  @IsUrl({}, { message: 'La URL de la imagen debe ser válida' })
  @IsOptional()
  imagen_url?: string;
}
