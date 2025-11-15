import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      throw new BadRequestException(`ID ${id} no es válido`);
    }
  }

  // Crear servicio
  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    try {
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
        throw new BadRequestException('Datos del servicio inválidos: ' + error.message);
      }
      throw error;
    }
  }

  // Listar todos los servicios
  async findAll(): Promise<Servicio[]> {
    return this.servicioModel.find().exec();
  }

  // Listar servicios activos
  async findActivos(): Promise<Servicio[]> {
    return this.servicioModel.find({ estado: 'activo' }).exec();
  }

  // Buscar por ID
  async findOne(id: string): Promise<Servicio> {
    this.validateMongoId(id);
    const servicio = await this.servicioModel.findById(id).exec();
    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return servicio;
  }

  // Actualizar servicio
  async update(id: string, updateServicioDto: UpdateServicioDto): Promise<Servicio> {
    this.validateMongoId(id);
    const servicio = await this.servicioModel.findById(id);
    if (!servicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);

    Object.assign(servicio, updateServicioDto);
    const updatedServicio = await servicio.save();
    return updatedServicio;
  }

  // Eliminar servicio
  async remove(id: string): Promise<Servicio> {
    this.validateMongoId(id);
    const deletedServicio = await this.servicioModel.findByIdAndDelete(id);
    if (!deletedServicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return deletedServicio;
  }

  // Cambiar estado (activo / inactivo)
  async cambiarEstado(id: string, estado: string): Promise<Servicio> {
    this.validateMongoId(id);
    if (!['activo', 'inactivo'].includes(estado)) {
      throw new BadRequestException('El estado debe ser "activo" o "inactivo"');
    }
    const servicio = await this.servicioModel
      .findByIdAndUpdate(id, { estado }, { new: true });
    if (!servicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  // Filtrar servicios (solo por estado ahora)
  async filtrarServicios(filtros: { estado?: string }): Promise<Servicio[]> {
    const query: any = {};
    if (filtros.estado && ['activo', 'inactivo'].includes(filtros.estado.toLowerCase())) {
      query.estado = filtros.estado.toLowerCase();
    }

    return this.servicioModel.find(query).exec();
  }
}