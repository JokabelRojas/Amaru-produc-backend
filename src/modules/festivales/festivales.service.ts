import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateFestivalDto } from './dto/create-festivales.dto';
import { UpdateFestivalDto } from './dto/update-festivales.dto';
import { Festival } from 'src/entities/festival-premio.entity';

@Injectable()
export class FestivalesService {
  constructor(
    @InjectModel(Festival.name) private festivalModel: Model<Festival>,
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

  private async validateCreateFestival(dto: CreateFestivalDto): Promise<void> {
    // Validar campos requeridos
    if (!dto.titulo || dto.titulo.trim() === '') {
      throw new BadRequestException({
        message: 'El título es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (!dto.id_actividad) {
      throw new BadRequestException({
        message: 'La actividad es requerida',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar fechas
    if (dto.fecha_inicio && dto.fecha_fin) {
      if (new Date(dto.fecha_inicio) > new Date(dto.fecha_fin)) {
        throw new BadRequestException({
          message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
    }

    // Validar título único
    const existingFestival = await this.festivalModel.findOne({
      titulo: dto.titulo,
    }).exec();

    if (existingFestival) {
      throw new ConflictException({
        message: 'Ya existe un festival con este título',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }
  }

  private async validateFestivalExists(id: string): Promise<Festival> {
    this.validateMongoId(id);
    const festival = await this.festivalModel.findById(id).exec();
    if (!festival) {
      throw new NotFoundException({
        message: `Festival con ID ${id} no encontrado`,
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return festival;
  }

  async create(createFestivalDto: CreateFestivalDto): Promise<{ data: Festival; message: string }> {
    try {
      await this.validateCreateFestival(createFestivalDto);

      const createdFestival = new this.festivalModel(createFestivalDto);
      const savedFestival = await createdFestival.save();
      const populatedFestival = await savedFestival.populate('id_actividad');

      return {
        data: populatedFestival,
        message: 'Festival creado exitosamente'
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException({
          message: 'Datos del festival inválidos',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear el festival',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<{ data: Festival[]; message: string }> {
    try {
      const festivales = await this.festivalModel.find().populate('id_actividad').exec();
      return {
        data: festivales,
        message: festivales.length > 0 
          ? 'Festivales obtenidos exitosamente' 
          : 'No se encontraron festivales'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los festivales',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<{ data: Festival; message: string }> {
    try {
      const festival = await this.validateFestivalExists(id);
      const populatedFestival = await festival.populate('id_actividad');
      
      return {
        data: populatedFestival,
        message: 'Festival obtenido exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener el festival',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, updateFestivalDto: UpdateFestivalDto): Promise<{ data: Festival; message: string }> {
    try {
      const festival = await this.validateFestivalExists(id);

      // Validar título único si se está actualizando
      if (updateFestivalDto.titulo) {
        const existingFestival = await this.festivalModel.findOne({
          titulo: updateFestivalDto.titulo,
          _id: { $ne: id },
        }).exec();

        if (existingFestival) {
          throw new ConflictException({
            message: 'Ya existe otro festival con este título',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      // Validar fechas si se están actualizando ambas
      if (updateFestivalDto.fecha_inicio && updateFestivalDto.fecha_fin) {
        if (new Date(updateFestivalDto.fecha_inicio) > new Date(updateFestivalDto.fecha_fin)) {
          throw new BadRequestException({
            message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
            error: 'BAD_REQUEST',
            statusCode: 400,
          });
        }
      }

      Object.assign(festival, updateFestivalDto);
      const savedFestival = await festival.save();
      const populatedFestival = await savedFestival.populate('id_actividad');

      return {
        data: populatedFestival,
        message: 'Festival actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el festival',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.validateFestivalExists(id);

      const deletedFestival = await this.festivalModel.findByIdAndDelete(id);
      if (!deletedFestival) {
        throw new NotFoundException({
          message: `Festival con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return { 
        message: 'Festival eliminado correctamente' 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar el festival',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findByActividad(idActividad: string): Promise<{ data: Festival[]; message: string }> {
    try {
      this.validateMongoId(idActividad);
      const festivales = await this.festivalModel.find({ id_actividad: idActividad }).populate('id_actividad').exec();
      
      return {
        data: festivales,
        message: festivales.length > 0 
          ? 'Festivales por actividad obtenidos exitosamente' 
          : 'No se encontraron festivales para esta actividad'
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al buscar festivales por actividad',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async cambiarEstado(id: string, estado: string): Promise<{ data: Festival; message: string }> {
    try {
      await this.validateFestivalExists(id);
      
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const festival = await this.festivalModel.findByIdAndUpdate(
        id, 
        { estado }, 
        { new: true }
      ).populate('id_actividad').exec();

      if (!festival) {
        throw new NotFoundException({
          message: `Festival con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: festival,
        message: `Festival ${estado} exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al cambiar el estado del festival',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findProximos(): Promise<{ data: Festival[]; message: string }> {
    try {
      const hoy = new Date();
      const festivales = await this.festivalModel.find({ 
        fecha_inicio: { $gte: hoy },
        estado: 'activo'
      }).populate('id_actividad').exec();

      return {
        data: festivales,
        message: festivales.length > 0 
          ? 'Próximos festivales obtenidos exitosamente' 
          : 'No se encontraron próximos festivales'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los próximos festivales',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findByTipo(tipo: string): Promise<{ data: Festival[]; message: string }> {
    try {
      const festivales = await this.festivalModel.find({ 
        tipo: new RegExp(tipo, 'i'),
        estado: 'activo'
      }).populate('id_actividad').exec();

      return {
        data: festivales,
        message: festivales.length > 0 
          ? `Festivales de tipo ${tipo} obtenidos exitosamente` 
          : `No se encontraron festivales de tipo ${tipo}`
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al buscar festivales por tipo',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findActivos(): Promise<{ data: Festival[]; message: string }> {
    try {
      const festivales = await this.festivalModel.find({ 
        estado: 'activo'
      }).populate('id_actividad').exec();

      return {
        data: festivales,
        message: festivales.length > 0 
          ? 'Festivales activos obtenidos exitosamente' 
          : 'No se encontraron festivales activos'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los festivales activos',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}