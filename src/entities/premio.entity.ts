import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Premio extends Document {

  @ApiProperty({
    description: 'Título del premio',
    example: 'Mejor Proyecto de Innovación',
    required: true,
  })
  @Prop({ required: true, trim: true })
  titulo: string;

  @ApiProperty({
    description: 'Fecha del premio',
    example: '2024-03-15',
    required: true,
  })
  @Prop({ required: true })
  fecha: Date;

  @ApiPropertyOptional({
    description: 'Descripción del premio',
    example: 'Reconocimiento al mejor proyecto de innovación tecnológica del año',
  })
  @Prop({ trim: true })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'URL de imagen del premio',
    example: 'https://example.com/premio-innovacion.jpg',
  })
  @Prop()
  url_imagen: string;

  @ApiProperty({
    description: 'Fecha de creación automática',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización automática',
  })
  updatedAt: Date;
}

export const PremioSchema = SchemaFactory.createForClass(Premio);