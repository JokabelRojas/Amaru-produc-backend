import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Profesor extends Document {

  @ApiProperty({
    description: 'Nombre completo del profesor',
    example: 'Juan Pérez',
    required: true,
  })
  @Prop({ required: true, trim: true })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción o biografía del profesor',
    example: 'Especialista en desarrollo web con 10 años de experiencia',
  })
  @Prop({ trim: true })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Especialidad principal del profesor',
    example: 'Desarrollo Frontend',
  })
  @Prop({ trim: true })
  especialidad: string;

  @ApiPropertyOptional({
    description: 'URL de imagen del profesor',
    example: 'https://example.com/foto-profesor.jpg',
  })
  @Prop()
  imagen_url: string;

  @ApiProperty({
    description: 'Fecha de creación automática',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización automática',
  })
  updatedAt: Date;
}

export const ProfesorSchema = SchemaFactory.createForClass(Profesor);
