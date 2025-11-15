// src/auth/dto/login-sin-password.dto.ts
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSinPasswordDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com'
  })
  @IsEmail()
  email: string;
}