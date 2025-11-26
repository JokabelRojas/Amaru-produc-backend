import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateInscripcionDto } from './dto/create-inscripciones.dto';
import { UpdateInscripcionDto } from './dto/update-inscripciones.dto';
import { Inscripcion } from 'src/entities/inscripcion.entity';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectModel(Inscripcion.name) private inscripcionModel: Model<Inscripcion>,
  ) {}

  private validateMongoId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID ${id} no es válido`);
    }
  }

  private async calcularTotalInscripcion(idUsuario: string): Promise<{ total: number; moneda: string }> {
    // Aquí implementas la lógica para calcular el total
    // Por ejemplo, podrías:
    // 1. Buscar cursos/eventos que el usuario quiere inscribirse
    // 2. Consultar precios desde otra colección
    // 3. Aplicar descuentos si corresponde
    
    // Por ahora, usaremos valores por defecto como ejemplo
    // Puedes modificar esta lógica según tus necesidades
    
    // Ejemplo: calcular basado en cursos pendientes del usuario
    const totalCalculado = 100.00; // Este valor vendría de tu lógica de negocio
    const moneda = 'PEN'; // O podrías determinar la moneda basado en el usuario/ubicación
    
    return { total: totalCalculado, moneda };
  }

async create(createInscripcionDto: CreateInscripcionDto): Promise<Inscripcion> {
  try {
    // Calcular automáticamente el total y moneda
    const { total, moneda } = await this.calcularTotalInscripcion(createInscripcionDto.id_usuario);
    
    // Crear el objeto de inscripción con los valores calculados
    const inscripcionData = {
      ...createInscripcionDto,
      total,
      moneda,
      fecha_inscripcion: new Date()
    };

    const createdInscripcion = new this.inscripcionModel(inscripcionData);
    const savedInscripcion = await createdInscripcion.save();
    return await savedInscripcion.populate('id_usuario');
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new BadRequestException('Datos de la inscripción inválidos');
    }
    throw error;
  }
}

  // Los demás métodos permanecen igual...
  async findAll(): Promise<Inscripcion[]> {
    return this.inscripcionModel.find().populate('id_usuario').exec();
  }

  async findOne(id: string): Promise<Inscripcion> {
    this.validateMongoId(id);
    const inscripcion = await this.inscripcionModel.findById(id).populate('id_usuario').exec();
    if (!inscripcion) throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    return inscripcion;
  }

  async update(id: string, updateInscripcionDto: UpdateInscripcionDto): Promise<Inscripcion> {
    this.validateMongoId(id);
    
    const inscripcion = await this.inscripcionModel.findById(id);
    if (!inscripcion) throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);

    Object.assign(inscripcion, updateInscripcionDto);
    return await inscripcion.save();
  }

  async remove(id: string): Promise<Inscripcion> {
    this.validateMongoId(id);
    const deletedInscripcion = await this.inscripcionModel.findByIdAndDelete(id);
    if (!deletedInscripcion) throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    return deletedInscripcion;
  }

  async findByUsuario(idUsuario: string): Promise<Inscripcion[]> {
    this.validateMongoId(idUsuario);
    return this.inscripcionModel.find({ id_usuario: idUsuario }).populate('id_usuario').exec();
  }

  async cambiarEstado(id: string, estado: string): Promise<Inscripcion> {
    this.validateMongoId(id);
    const estadosPermitidos = ['pendiente','aprobado','rechazado'];
    if (!estadosPermitidos.includes(estado)) {
      throw new BadRequestException(`Estado debe ser: ${estadosPermitidos.join(', ')}`);
    }
    const inscripcion = await this.inscripcionModel.findByIdAndUpdate(
      id, 
      { estado }, 
      { new: true }
    ).populate('id_usuario');
    if (!inscripcion) throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    return inscripcion;
  }

  async findByEstado(estado: string): Promise<Inscripcion[]> {
    const estadosPermitidos = ['pendiente','aprobado','rechazado'];
    if (!estadosPermitidos.includes(estado)) {
      throw new BadRequestException(`Estado debe ser: ${estadosPermitidos.join(', ')}`);
    }
    return this.inscripcionModel.find({ estado }).populate('id_usuario').exec();
  }

  async getEstadisticas(): Promise<any> {
    const total = await this.inscripcionModel.countDocuments();
    const porEstado = await this.inscripcionModel.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);
    const ingresos = await this.inscripcionModel.aggregate([
      { $match: { estado: 'aprobado' } }, // Cambié 'pagado' por 'aprobado' para coincidir con tus estados
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return {
      total,
      porEstado,
      ingresosTotales: ingresos[0]?.total || 0
    };
  }
}