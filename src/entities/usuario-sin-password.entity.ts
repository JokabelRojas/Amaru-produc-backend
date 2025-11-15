// src/entities/usuario-sin-password.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ 
  timestamps: true, // Esto asegura que se creen createdAt y updatedAt
  toJSON: { virtuals: true } // Para incluir virtuals en las respuestas
})
export class UsuarioSinPassword extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  dni: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  telefono?: string;

  @Prop()
  direccion?: string;

  @Prop({ type: Types.ObjectId, ref: 'Rol', required: true })
  id_rol: Types.ObjectId;

  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSinPasswordSchema = SchemaFactory.createForClass(UsuarioSinPassword);