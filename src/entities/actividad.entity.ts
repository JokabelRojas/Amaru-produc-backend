import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Actividad extends Document {

  @ApiProperty({
    description: 'Nombre de la actividad',
    example: 'Taller de Programación',
    required: true,
  })
  @Prop({ required: true, trim: true })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la actividad',
    example: 'Taller práctico de introducción a la programación con JavaScript',
  })
  @Prop({ trim: true })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de creación automática',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización automática',
  })
  updatedAt: Date;
}

export const ActividadSchema = SchemaFactory.createForClass(Actividad);