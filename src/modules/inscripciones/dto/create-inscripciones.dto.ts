import { IsMongoId, IsNotEmpty, IsOptional, IsIn, IsString, IsEmail } from 'class-validator';
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

  @ApiProperty({
    description: 'Email del usuario para la inscripción',
    example: 'usuario@example.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
}