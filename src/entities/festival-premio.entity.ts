import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Actividad } from './actividad.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Festival extends Document {
  @ApiProperty({
    description: 'Título del festival',
    example: 'Festival de Música Electrónica 2024',
    required: true
  })
  @Prop({ required: true, trim: true })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del festival',
    example: 'El evento más esperado del año con los mejores DJs internacionales y producciones audiovisuales de vanguardia'
  })
  @Prop({ trim: true })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de inicio del festival',
    example: '2024-07-15T20:00:00.000Z',
    required: true
  })
  @Prop({ required: true })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin del festival',
    example: '2024-07-20T23:00:00.000Z',
    required: true
  })
  @Prop({ required: true })
  fecha_fin: Date;

  @ApiProperty({
    description: 'Lugar donde se realizará el festival',
    example: 'Estadio Nacional, Lima',
    required: true
  })
  @Prop({ required: true, trim: true })
  lugar: string;

  @ApiProperty({
    description: 'Organizador del festival',
    example: 'Empresa de Eventos S.A.',
    required: true
  })
  @Prop({ required: true, trim: true })
  organizador: string;

  @ApiProperty({
    description: 'Tipo de festival',
    example: 'musical',
    required: true
  })
  @Prop({ required: true, trim: true })
  tipo: string;

  @ApiProperty({
    description: 'ID de la actividad a la que pertenece el festival',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Actividad', 
    required: true 
  })
  id_actividad: Actividad;

  @ApiProperty({
    description: 'Estado del festival',
    example: 'activo',
    enum: ['activo', 'inactivo'],
    default: 'activo'
  })
  @Prop({ 
    default: 'activo', 
    enum: ['activo', 'inactivo'] 
  })
  estado: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del festival',
    example: 'https://ejemplo.com/imagen-festival.jpg'
  })
  @Prop()
  imagen_url: string;

  // Campos automáticos de timestamps
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

export const FestivalSchema = SchemaFactory.createForClass(Festival);

// Índices
FestivalSchema.index({ id_actividad: 1 });
FestivalSchema.index({ estado: 1 });
FestivalSchema.index({ fecha_inicio: 1 });
FestivalSchema.index({ tipo: 1 });