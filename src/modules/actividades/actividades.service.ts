import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { Actividad } from 'src/entities/actividad.entity';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectModel(Actividad.name)
    private readonly actividadModel: Model<Actividad>,
  ) {}

  // Validadores
  private async validateCreateActividad(dto: CreateActividadDto): Promise<void> {
    const existingActividad = await this.actividadModel.findOne({
      nombre: dto.nombre,
    }).exec();

    if (existingActividad) {
      throw new ConflictException({
        message: 'Ya existe una actividad con este nombre',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }

    if (!dto.nombre || dto.nombre.trim() === '') {
      throw new BadRequestException({
        message: 'El nombre es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateActividadExists(id: string): Promise<Actividad> {
    const actividad = await this.actividadModel.findById(id).exec();
    if (!actividad) {
      throw new NotFoundException({
        message: 'Actividad no encontrada',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return actividad;
  }

  async create(dto: CreateActividadDto): Promise<{ data: Actividad; message: string }> {
    try {
      await this.validateCreateActividad(dto);

      const actividad = new this.actividadModel(dto);
      const savedActividad = await actividad.save();

      return {
        data: savedActividad,
        message: 'Actividad creada exitosamente'
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear la actividad',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<{ data: Actividad[]; message: string }> {
    try {
      const actividades = await this.actividadModel.find().sort({ createdAt: -1 }).exec();
      return {
        data: actividades,
        message: actividades.length > 0 
          ? 'Actividades obtenidas exitosamente' 
          : 'No se encontraron actividades'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener las actividades',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<{ data: Actividad; message: string }> {
    try {
      const actividad = await this.validateActividadExists(id);
      return {
        data: actividad,
        message: 'Actividad obtenida exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener la actividad',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, dto: UpdateActividadDto): Promise<{ data: Actividad; message: string }> {
    try {
      // Primero validamos que existe
      await this.validateActividadExists(id);

      // Validar nombre único si se está actualizando el nombre
      if (dto.nombre) {
        const existingActividad = await this.actividadModel.findOne({
          nombre: dto.nombre,
          _id: { $ne: id },
        }).exec();

        if (existingActividad) {
          throw new ConflictException({
            message: 'Ya existe otra actividad con este nombre',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      const actividad = await this.actividadModel.findByIdAndUpdate(id, dto, {
        new: true,
      }).exec();

      // Verificar que se encontró y actualizó la actividad
      if (!actividad) {
        throw new NotFoundException({
          message: 'Actividad no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: actividad,
        message: 'Actividad actualizada exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar la actividad',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.validateActividadExists(id);

      const actividad = await this.actividadModel.findByIdAndDelete(id).exec();
      
      if (!actividad) {
        throw new NotFoundException({
          message: 'Actividad no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return { 
        message: 'Actividad eliminada correctamente' 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar la actividad',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}