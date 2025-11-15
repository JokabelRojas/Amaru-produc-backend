// src/auth/dto/register-sin-password.dto.ts
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterSinPasswordDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    description: 'Documento Nacional de Identidad',
    example: '12345678'
  })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({
    description: 'Correo electrónico válido',
    example: 'juan.perez@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '+5491112345678'
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Dirección del usuario',
    example: 'Calle Falsa 123'
  })
  @IsString()
  @IsOptional()
  direccion?: string;
}