import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Servicio extends Document {
  @ApiProperty({
    description: 'Título del servicio',
    example: 'Desarrollo de Aplicaciones Web',
    required: false
  })
  @Prop({ required: false, trim: true, default: 'Servicio sin título' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Descripción del servicio',
    example: 'Desarrollo de aplicaciones web modernas con React, Node.js y MongoDB'
  })
  @Prop({ trim: true, default: '' })
  descripcion?: string;

  @ApiProperty({
    description: 'Estado del servicio',
    example: 'activo',
    enum: ['activo', 'inactivo'],
    default: 'activo'
  })
  @Prop({ default: 'activo', enum: ['activo', 'inactivo'] })
  estado: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del servicio',
    example: 'https://ejemplo.com/imagen-servicio.jpg'
  })
  @Prop({ default: '' })
  imagen_url?: string;

  @ApiProperty({
    description: 'Fecha de creación automática',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización automática',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export const ServicioSchema = SchemaFactory.createForClass(Servicio);

// Índices
ServicioSchema.index({ estado: 1 });