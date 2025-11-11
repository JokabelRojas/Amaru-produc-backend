import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
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
      this.validateMongoId(createServicioDto.id_categoria);
      this.validateMongoId(createServicioDto.id_subcategoria);

      const createdServicio = new this.servicioModel({
        titulo: createServicioDto.titulo ?? 'Servicio sin título',
        descripcion: createServicioDto.descripcion ?? '',
        id_categoria: createServicioDto.id_categoria,
        id_subcategoria: createServicioDto.id_subcategoria,
        estado: createServicioDto.estado ?? 'activo',
        imagen_url: createServicioDto.imagen_url ?? '',
      });

      const savedServicio = await createdServicio.save();
      return await savedServicio.populate(['id_categoria', 'id_subcategoria']);
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Datos del servicio inválidos: ' + error.message);
      }
      throw error;
    }
  }

  // Listar todos los servicios
  async findAll(): Promise<Servicio[]> {
    return this.servicioModel.find().populate('id_categoria').populate('id_subcategoria').exec();
  }

  // Listar servicios activos
  async findActivos(): Promise<Servicio[]> {
    return this.servicioModel.find({ estado: 'activo' }).populate('id_categoria').populate('id_subcategoria').exec();
  }

  // Buscar por ID
  async findOne(id: string): Promise<Servicio> {
    this.validateMongoId(id);
    const servicio = await this.servicioModel.findById(id).populate('id_categoria').populate('id_subcategoria').exec();
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
    return await updatedServicio.populate(['id_categoria', 'id_subcategoria']);
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
      .findByIdAndUpdate(id, { estado }, { new: true })
      .populate('id_categoria')
      .populate('id_subcategoria');
    if (!servicio) throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  // Filtrar servicios
  async filtrarServicios(filtros: { id_categoria?: string; id_subcategoria?: string; estado?: string }): Promise<Servicio[]> {
    const query: any = {};
    if (filtros.id_categoria && isValidObjectId(filtros.id_categoria)) query.id_categoria = new Types.ObjectId(filtros.id_categoria);
    if (filtros.id_subcategoria && isValidObjectId(filtros.id_subcategoria)) query.id_subcategoria = new Types.ObjectId(filtros.id_subcategoria);
    if (filtros.estado && ['activo', 'inactivo'].includes(filtros.estado.toLowerCase())) query.estado = filtros.estado.toLowerCase();

    return this.servicioModel.find(query).populate('id_categoria').populate('id_subcategoria').exec();
  }

  // Buscar por categoría
  async findByCategoria(idCategoria: string): Promise<Servicio[]> {
    this.validateMongoId(idCategoria);
    return this.servicioModel.find({ id_categoria: idCategoria }).populate('id_categoria').populate('id_subcategoria').exec();
  }

  // Buscar por subcategoría
  async findBySubcategoria(idSubcategoria: string): Promise<Servicio[]> {
    this.validateMongoId(idSubcategoria);
    return this.servicioModel.find({ id_subcategoria: idSubcategoria }).populate('id_categoria').populate('id_subcategoria').exec();
  }
}
