import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { Usuario, UsuarioSchema } from '../entities/usuario.entity';
import { UsuariosService } from '../modules/usuarios/usuarios.service';
import { Rol, RolSchema } from 'src/entities/rol.entity';
import { UsuarioSinPassword, UsuarioSinPasswordSchema } from 'src/entities/usuario-sin-password.entity';
import { AuthSinPasswordService } from './auth-sin-password.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: Usuario.name, 
        schema: UsuarioSchema 
      },
      { 
        name: Rol.name, 
        schema: RolSchema
      },
      { 
        name: UsuarioSinPassword.name, 
        schema: UsuarioSinPasswordSchema 
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    AuthSinPasswordService, // <- AÑADIR AQUÍ
    JwtStrategy, 
    UsuariosService
  ],
  exports: [
    AuthService, 
    AuthSinPasswordService // <- AHORA SÍ PUEDES EXPORTARLO
  ],
})
export class AuthModule {}