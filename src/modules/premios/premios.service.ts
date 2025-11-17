import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreatePremioDto } from './dto/create-premio.dto';
import { UpdatePremioDto } from './dto/update-premio.dto';
import { Premio } from 'src/entities/premio.entity';

@Injectable()
export class PremiosService {
  constructor(
    @InjectModel(Premio.name)
    private readonly premioModel: Model<Premio>,
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

  private async validateCreatePremio(dto: CreatePremioDto): Promise<void> {
    // Validar campos requeridos
    if (!dto.titulo || dto.titulo.trim() === '') {
      throw new BadRequestException({
        message: 'El título es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar título único
    const existingPremio = await this.premioModel.findOne({
      titulo: dto.titulo,
    }).exec();

    if (existingPremio) {
      throw new ConflictException({
        message: 'Ya existe un premio con este título',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }
  }

  private async validatePremioExists(id: string): Promise<Premio> {
    this.validateMongoId(id);
    const premio = await this.premioModel.findById(id).exec();
    if (!premio) {
      throw new NotFoundException({
        message: 'Premio no encontrado',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return premio;
  }

  async create(dto: CreatePremioDto): Promise<{ data: Premio; message: string }> {
    try {
      await this.validateCreatePremio(dto);

      const premio = new this.premioModel(dto);
      const savedPremio = await premio.save();

      return {
        data: savedPremio,
        message: 'Premio creado exitosamente'
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear el premio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<{ data: Premio[]; message: string }> {
    try {
      const premios = await this.premioModel.find().sort({ fecha: -1, createdAt: -1 }).exec();
      return {
        data: premios,
        message: premios.length > 0 
          ? 'Premios obtenidos exitosamente' 
          : 'No se encontraron premios'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los premios',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<{ data: Premio; message: string }> {
    try {
      const premio = await this.validatePremioExists(id);
      return {
        data: premio,
        message: 'Premio obtenido exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener el premio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, dto: UpdatePremioDto): Promise<{ data: Premio; message: string }> {
    try {
      // Primero validamos que existe
      await this.validatePremioExists(id);

      // Validar título único si se está actualizando el título
      if (dto.titulo) {
        const existingPremio = await this.premioModel.findOne({
          titulo: dto.titulo,
          _id: { $ne: id },
        }).exec();

        if (existingPremio) {
          throw new ConflictException({
            message: 'Ya existe otro premio con este título',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      const premio = await this.premioModel.findByIdAndUpdate(id, dto, {
        new: true,
      }).exec();

      // Verificar que se encontró y actualizó el premio
      if (!premio) {
        throw new NotFoundException({
          message: 'Premio no encontrado',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: premio,
        message: 'Premio actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el premio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.validatePremioExists(id);

      const premio = await this.premioModel.findByIdAndDelete(id).exec();
      
      if (!premio) {
        throw new NotFoundException({
          message: 'Premio no encontrado',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return { 
        message: 'Premio eliminado correctamente' 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar el premio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}