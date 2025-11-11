import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfesorController } from './profesores.controller';
import { ProfesorService } from './profesores.service';
import { Profesor, ProfesorSchema } from '../../entities/profesor.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profesor.name, schema: ProfesorSchema }
    ])
  ],
  controllers: [ProfesorController],
  providers: [ProfesorService],
  exports: [ProfesorService],
})
export class ProfesorModule {}
