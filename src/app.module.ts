import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import databaseConfig from './config/database.config';

// Importa todos los módulos
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoriaModule } from './modules/categorias/categorias.module';
import { SubcategoriasModule } from './modules/subcategorias/subcategorias.module';
import { TalleresModule } from './modules/talleres/talleres.module';
import { BloquesModule } from './modules/bloques/bloques.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { FestivalesModule } from './modules/festivales/festivales.module';
import { InscripcionesModule } from './modules/inscripciones/inscripciones.module';
import { DetalleInscripcionesModule } from './modules/detalle-inscripcion/detalle-inscripciones.module';
import { PagosModule } from './modules/pagos/pagos.module';
import { ProfesorModule } from './modules/profesores/profesores.module';
import { ActividadesModule } from './modules/actividades/actividades.module';
import { PremiosModule } from './modules/premios/premios.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),

    AuthModule,
    UsuariosModule,
    RolesModule,
    CategoriaModule,
    SubcategoriasModule,
    TalleresModule,
    BloquesModule,
    ServiciosModule,
    FestivalesModule,
    InscripcionesModule,
    DetalleInscripcionesModule,
    PagosModule,
    ProfesorModule,
    ActividadesModule,
    PremiosModule,
    EmailModule
  ],
})
export class AppModule {}