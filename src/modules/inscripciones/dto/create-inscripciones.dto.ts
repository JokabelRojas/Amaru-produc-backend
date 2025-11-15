import { IsMongoId, IsNotEmpty, IsOptional, IsIn, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInscripcionDto {
  @ApiProperty({
    description: 'ID del usuario que realiza la inscripción',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @IsMongoId()
  @IsNotEmpty()
  id_usuario: string;

  @ApiPropertyOptional({
    description: 'Estado de la inscripción',
    example: 'pendiente',
    enum: ['pendiente','aprobado','rechazado'],
    default: 'pendiente'
  })
  @IsString()
  @IsIn(['pendiente','aprobado','rechazado'])
  @IsOptional()
  estado?: string;

  // Removemos los campos total y moneda del DTO ya que se calcularán automáticamente
}