import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { CreateTallerDto } from './dto/create-talleres.dto';
import { UpdateTallerDto } from './dto/update-talleres.dto';
import { Taller } from 'src/entities/taller.entity';

@Injectable()
export class TalleresService {
  constructor(
    @InjectModel(Taller.name) 
    private tallerModel: Model<Taller>,
  ) {}

  private validateMongoId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: `ID ${id} no es un ID de MongoDB válido`,
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateCreateTaller(dto: CreateTallerDto): Promise<void> {
    // Validar campos requeridos
    if (!dto.nombre || dto.nombre.trim() === '') {
      throw new BadRequestException({
        message: 'El nombre es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (!dto.id_categoria) {
      throw new BadRequestException({
        message: 'La categoría es requerida',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (!dto.id_subcategoria) {
      throw new BadRequestException({
        message: 'La subcategoría es requerida',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    if (!dto.id_profesor) {
      throw new BadRequestException({
        message: 'El profesor es requerido',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar fechas
    if (dto.fecha_inicio && dto.fecha_fin) {
      if (new Date(dto.fecha_fin) <= new Date(dto.fecha_inicio)) {
        throw new BadRequestException({
          message: 'La fecha de fin debe ser posterior a la fecha de inicio',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
    }

    // Validar cupos
    if (dto.cupo_total && dto.cupo_total <= 0) {
      throw new BadRequestException({
        message: 'El cupo total debe ser mayor a 0',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateTallerExists(id: string): Promise<Taller> {
    this.validateMongoId(id);
    const taller = await this.tallerModel.findById(id).exec();
    if (!taller) {
      throw new NotFoundException({
        message: `Taller con ID ${id} no encontrado`,
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return taller;
  }

  async create(createTallerDto: CreateTallerDto): Promise<{ data: Taller; message: string }> {
    try {
      await this.validateCreateTaller(createTallerDto);

      // Validar todos los IDs
      this.validateMongoId(createTallerDto.id_categoria);
      this.validateMongoId(createTallerDto.id_subcategoria);
      this.validateMongoId(createTallerDto.id_profesor);

      const tallerData = {
        ...createTallerDto,
        cupo_disponible: createTallerDto.cupo_total
      };

      const createdTaller = new this.tallerModel(tallerData);
      const savedTaller = await createdTaller.save();

      // Populate completo
      const taller = await this.tallerModel
        .findById(savedTaller._id)
        .populate('id_categoria')
        .populate('id_subcategoria')
        .populate('id_profesor')
        .exec();

      if (!taller) {
        throw new NotFoundException({
          message: `Taller con ID ${savedTaller._id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: taller,
        message: 'Taller creado exitosamente'
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException({
          message: 'Datos del taller inválidos',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      if (error.name === 'CastError') {
        throw new BadRequestException({
          message: 'ID de categoría, subcategoría o profesor inválido',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear el taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<{ data: Taller; message: string }> {
    try {
      this.validateMongoId(id);
      const taller = await this.tallerModel
        .findById(id)
        .populate('id_categoria')
        .populate('id_subcategoria')
        .populate('id_profesor')
        .exec();
      
      if (!taller) {
        throw new NotFoundException({
          message: `Taller con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: taller,
        message: 'Taller obtenido exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener el taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<{ data: Taller[]; message: string }> {
    try {
      const talleres = await this.tallerModel
        .find()
        .populate('id_categoria')
        .populate('id_subcategoria')
        .populate('id_profesor')
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Talleres obtenidos exitosamente' 
          : 'No se encontraron talleres'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los talleres',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, updateTallerDto: UpdateTallerDto): Promise<{ data: Taller; message: string }> {
    try {
      await this.validateTallerExists(id);
      
      const updateData: any = { ...updateTallerDto };

      if (updateTallerDto.fecha_inicio && updateTallerDto.fecha_fin) {
        if (new Date(updateTallerDto.fecha_fin) <= new Date(updateTallerDto.fecha_inicio)) {
          throw new BadRequestException({
            message: 'La fecha de fin debe ser posterior a la fecha de inicio',
            error: 'BAD_REQUEST',
            statusCode: 400,
          });
        }
      }

      if (updateTallerDto.cupo_total) {
        const tallerExistente = await this.tallerModel.findById(id);
        if (tallerExistente) {
          const diferencia = updateTallerDto.cupo_total - tallerExistente.cupo_total;
          updateData.cupo_disponible = Math.max(0, tallerExistente.cupo_disponible + diferencia);
        }
      }

      const existingTaller = await this.tallerModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('id_categoria')
        .populate('id_subcategoria')
        .populate('id_profesor')
        .exec();

      if (!existingTaller) {
        throw new NotFoundException({
          message: `Taller con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: existingTaller,
        message: 'Taller actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      this.validateMongoId(id);
      const deletedTaller = await this.tallerModel
        .findByIdAndDelete(id)
        .populate('id_subcategoria')
        .exec();
      
      if (!deletedTaller) {
        throw new NotFoundException({
          message: `Taller con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return { 
        message: 'Taller eliminado correctamente' 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar el taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findBySubcategoria(idSubcategoria: string): Promise<{ data: Taller[]; message: string }> {
    try {
      this.validateMongoId(idSubcategoria);
      const talleres = await this.tallerModel
        .find({ id_subcategoria: idSubcategoria })
        .populate('id_categoria')
        .populate('id_subcategoria')
        .populate('id_profesor')
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Talleres por subcategoría obtenidos exitosamente' 
          : 'No se encontraron talleres para esta subcategoría'
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al buscar talleres por subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async cambiarEstado(id: string, estado: string): Promise<{ data: Taller; message: string }> {
    try {
      this.validateMongoId(id);
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      
      const taller = await this.tallerModel
        .findByIdAndUpdate(id, { estado }, { new: true })
        .populate('id_subcategoria')
        .exec();
      
      if (!taller) {
        throw new NotFoundException({
          message: `Taller con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return {
        data: taller,
        message: `Taller ${estado} exitosamente`
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al cambiar el estado del taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async actualizarCupo(id: string, cuposReservados: number): Promise<{ data: Taller; message: string }> {
    try {
      this.validateMongoId(id);
      const taller = await this.tallerModel.findById(id);
      
      if (!taller) {
        throw new NotFoundException({
          message: `Taller con ID ${id} no encontrado`,
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      const nuevoCupoDisponible = taller.cupo_disponible - cuposReservados;
      if (nuevoCupoDisponible < 0) {
        throw new BadRequestException({
          message: 'No hay cupos disponibles suficientes',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      taller.cupo_disponible = nuevoCupoDisponible;
      const savedTaller = await taller.save();

      return {
        data: savedTaller,
        message: 'Cupo actualizado exitosamente'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar el cupo del taller',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findActivos(): Promise<{ data: Taller[]; message: string }> {
    try {
      const talleres = await this.tallerModel
        .find({ estado: 'activo' })
        .populate('id_subcategoria')
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Talleres activos obtenidos exitosamente' 
          : 'No se encontraron talleres activos'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los talleres activos',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findProximos(): Promise<{ data: Taller[]; message: string }> {
    try {
      const ahora = new Date();
      const unaSemanaDespues = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const talleres = await this.tallerModel
        .find({
          estado: 'activo',
          fecha_inicio: { $gte: ahora, $lte: unaSemanaDespues },
          cupo_disponible: { $gt: 0 }
        })
        .populate('id_subcategoria')
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Próximos talleres obtenidos exitosamente' 
          : 'No se encontraron próximos talleres'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener los próximos talleres',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async filtrarTalleres(filtros: {
    id_categoria?: string;
    id_subcategoria?: string;
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<{ data: Taller[]; message: string }> {
    try {
      const query: any = {};

      if (filtros.id_categoria && isValidObjectId(filtros.id_categoria)) {
        query.id_categoria = new Types.ObjectId(filtros.id_categoria);
      }

      if (filtros.id_subcategoria && isValidObjectId(filtros.id_subcategoria)) {
        query.id_subcategoria = new Types.ObjectId(filtros.id_subcategoria);
      }

      if (filtros.estado && ['activo', 'inactivo'].includes(filtros.estado.toLowerCase())) {
        query.estado = filtros.estado.toLowerCase();
      }

      if (filtros.fecha_inicio || filtros.fecha_fin) {
        query.fecha_inicio = {};
        if (filtros.fecha_inicio) {
          const fechaInicio = new Date(filtros.fecha_inicio);
          if (!isNaN(fechaInicio.getTime())) query.fecha_inicio.$gte = fechaInicio;
        }
        if (filtros.fecha_fin) {
          const fechaFin = new Date(filtros.fecha_fin);
          if (!isNaN(fechaFin.getTime())) query.fecha_inicio.$lte = fechaFin;
        }
        if (Object.keys(query.fecha_inicio).length === 0) delete query.fecha_inicio;
      }

      const talleres = await this.tallerModel
        .find(query)
        .populate('id_categoria')
        .populate('id_subcategoria')
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Talleres filtrados exitosamente' 
          : 'No se encontraron talleres con los filtros aplicados'
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al filtrar los talleres',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findByProfesor(id_profesor: string): Promise<{ data: Taller[]; message: string }> {
    try {
      this.validateMongoId(id_profesor);
      
      const talleres = await this.tallerModel
        .find({ id_profesor })
        .populate('id_profesor')
        .populate('id_categoria')
        .populate('id_subcategoria')
        .sort({ fecha_inicio: 1 })
        .exec();

      return {
        data: talleres,
        message: talleres.length > 0 
          ? 'Talleres por profesor obtenidos exitosamente' 
          : 'No se encontraron talleres para este profesor'
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al buscar talleres por profesor',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}