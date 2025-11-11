import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type CategoriaDocument = Categoria & Document;

@Schema({ timestamps: true })
export class Categoria extends Document {
  @ApiProperty({
    description: 'Nombre único de la categoría',
    example: 'Electrónicos',
    required: true
  })
  @Prop({ required: true, unique: true })
  nombre: string;

  @ApiProperty({
    description: 'Tipo de categoría',
    example: 'servicio',
    enum: ['taller', 'servicio']
  })
  @Prop({ 
    required: true, 
    enum: ['taller', 'servicio'] 
  })
  tipo: 'taller' | 'servicio';

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Categoría de servicios relacionados con mantenimiento'
  })
  @Prop()
  descripcion?: string;

  @ApiProperty({
    description: 'Estado de la categoría',
    example: 'activo',
    enum: ['activo', 'inactivo'],
    default: 'activo'
  })
  @Prop({ default: 'activo' })
  estado: 'activo' | 'inactivo';

  @ApiProperty({
    description: 'Fecha de creación automática',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización automática',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
