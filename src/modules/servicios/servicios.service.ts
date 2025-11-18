import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateServicioDto } from './dto/create-servicios.dto';
import { UpdateServicioDto } from './dto/update-servicios.dto';
import { Servicio } from 'src/entities/servicio.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectModel(Servicio.name) private servicioModel: Model<Servicio>,
  ) {}

  // Validar formato de ObjectId de MongoDB
  private validateMongoId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: `ID ${id} no es válido`,
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateCreateServicio(dto: CreateServicioDto): Promise<void> {
    // Validar campos requeridos
    if (!dto.titulo || dto.titulo.trim() === '') {
      throw new BadRequestException({
        message: 'El título es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar título único
    const existingServicio = await this.servicioModel.findOne({
      titulo: dto.titulo,
    }).exec();

    if (existingServicio) {
      throw new ConflictException({
        message: 'Ya existe un servicio con este título',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }
  }

  private async validateServicioExists(id: string): Promise<Servicio> {
    this.validateMongoId(id);
    const servicio = await this.servicioModel.findById(id).exec();
    if (!servicio) {
      throw new NotFoundException({
        message: `Servicio con ID ${id} no encontrado`,
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return servicio;
  }

  // Crear servicio
  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    try {
      await this.validateCreateServicio(createServicioDto);

      const createdServicio = new this.servicioModel({
        titulo: createServicioDto.titulo ?? 'Servicio sin título',
        descripcion: createServicioDto.descripcion ?? '',
        estado: createServicioDto.estado ?? 'activo',
        imagen_url: createServicioDto.imagen_url ?? '',
      });

      const savedServicio = await createdServicio.save();
      
      return savedServicio;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException({
          message: 'Datos del servicio inválidos',
          error: 'BAD_REQUEST',
          statusCode: 400,
          details: error.message,
        });
      }
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear el servicio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Listar todos los servicios
  async findAll(): Promise<Servicio[]> {
    try {
      const servicios = await this.servicioModel.find().exec();
      return servicios;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los servicios',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Listar servicios activos
  async findActivos(): Promise<Servicio[]> {
    try {
      const servicios = await this.servicioModel.find({ estado: 'activo' }).exec();
      return servicios;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los servicios activos',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Buscar por ID
  async findOne(id: string): Promise<Servicio> {
    try {
      const servicio = await this.validateServicioExists(id);
      return servicio;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener el servicio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Actualizar servicio
  async update(id: string, updateServicioDto: UpdateServicioDto): Promise<Servicio> {
    try {
      const servicio = await this.validateServicioExists(id);

      // Validar título único si se está actualizando
      if (updateServicioDto.titulo) {
        const existingServicio = await this.servicioModel.findOne({
          titulo: updateServicioDto.titulo,
          _id: { $ne: id },
        }).exec();

        if (existingServicio) {
          throw new ConflictException({
            message: 'Ya existe otro servicio con este título',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      Object.assign(servicio, updateServicioDto);
      const updatedServicio = await servicio.save();
      
      return updatedServicio;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el servicio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Eliminar servicio
  async remove(id: string): Promise<void> {
    try {
      await this.validateServicioExists(id);

      const deletedServicio = await this.servicioModel.findByIdAndDelete(id);
      if (!deletedServicio) {
        throw new NotFoundException({
          message: `Servicio con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar el servicio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Cambiar estado (activo / inactivo)
  async cambiarEstado(id: string, estado: string): Promise<Servicio> {
    try {
      await this.validateServicioExists(id);
      
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const servicio = await this.servicioModel
        .findByIdAndUpdate(id, { estado }, { new: true }).exec();

      if (!servicio) {
        throw new NotFoundException({
          message: `Servicio con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return servicio;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al cambiar el estado del servicio',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Filtrar servicios (solo por estado ahora)
  async filtrarServicios(filtros: { estado?: string }): Promise<Servicio[]> {
    try {
      const query: any = {};
      if (filtros.estado && ['activo', 'inactivo'].includes(filtros.estado.toLowerCase())) {
        query.estado = filtros.estado.toLowerCase();
      }

      const servicios = await this.servicioModel.find(query).exec();
      
      return servicios;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al filtrar los servicios',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Buscar servicios por título (búsqueda parcial)
  async buscarPorTitulo(titulo: string): Promise<Servicio[]> {
    try {
      const servicios = await this.servicioModel.find({
        titulo: { $regex: titulo, $options: 'i' }
      }).exec();
      
      return servicios;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al buscar servicios por título',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}