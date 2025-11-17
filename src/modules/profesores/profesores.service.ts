import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Profesor } from '../../entities/profesor.entity';
import { CreateProfesorDto } from './dto/create-profesores.dto';
import { UpdateProfesorDto } from './dto/update-profesores.dto';

@Injectable()
export class ProfesorService {
  constructor(
    @InjectModel(Profesor.name)
    private readonly profesorModel: Model<Profesor>,
  ) {}

  private validateMongoId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: `ID ${id} no es válido`,
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateCreateProfesor(dto: CreateProfesorDto): Promise<void> {
    // Validar campos requeridos
    if (!dto.nombre || dto.nombre.trim() === '') {
      throw new BadRequestException({
        message: 'El nombre es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar nombre único
    const existingProfesor = await this.profesorModel.findOne({
      nombre: dto.nombre,
    }).exec();

    if (existingProfesor) {
      throw new ConflictException({
        message: 'Ya existe un profesor con este nombre',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }
  }

  private async validateProfesorExists(id: string): Promise<Profesor> {
    this.validateMongoId(id);
    const profesor = await this.profesorModel.findById(id).exec();
    if (!profesor) {
      throw new NotFoundException({
        message: 'Profesor no encontrado',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return profesor;
  }

  async create(dto: CreateProfesorDto): Promise<{ data: Profesor; message: string }> {
    try {
      await this.validateCreateProfesor(dto);

      const profesor = new this.profesorModel(dto);
      const savedProfesor = await profesor.save();

      return {
        data: savedProfesor,
        message: 'Profesor creado exitosamente'
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear el profesor',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<{ data: Profesor[]; message: string }> {
    try {
      const profesores = await this.profesorModel.find().sort({ createdAt: -1 }).exec();
      return {
        data: profesores,
        message: profesores.length > 0 
          ? 'Profesores obtenidos exitosamente' 
          : 'No se encontraron profesores'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los profesores',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<{ data: Profesor; message: string }> {
    try {
      const profesor = await this.validateProfesorExists(id);
      return {
        data: profesor,
        message: 'Profesor obtenido exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener el profesor',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, dto: UpdateProfesorDto): Promise<{ data: Profesor; message: string }> {
    try {
      // Primero validamos que existe
      await this.validateProfesorExists(id);

      // Validar nombre único si se está actualizando el nombre
      if (dto.nombre) {
        const existingProfesor = await this.profesorModel.findOne({
          nombre: dto.nombre,
          _id: { $ne: id },
        }).exec();

        if (existingProfesor) {
          throw new ConflictException({
            message: 'Ya existe otro profesor con este nombre',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      const profesor = await this.profesorModel.findByIdAndUpdate(id, dto, {
        new: true,
      }).exec();

      // Verificar que se encontró y actualizó el profesor
      if (!profesor) {
        throw new NotFoundException({
          message: 'Profesor no encontrado',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: profesor,
        message: 'Profesor actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el profesor',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.validateProfesorExists(id);

      const profesor = await this.profesorModel.findByIdAndDelete(id).exec();
      
      if (!profesor) {
        throw new NotFoundException({
          message: 'Profesor no encontrado',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return { 
        message: 'Profesor eliminado correctamente' 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar el profesor',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}