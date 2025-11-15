import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      throw new BadRequestException(`ID ${id} no es válido`);
    }
  }

  async create(createFestivalDto: CreateFestivalDto): Promise<Festival> {
    try {
      const createdFestival = new this.festivalModel(createFestivalDto);
      const savedFestival = await createdFestival.save();
      return await savedFestival.populate('id_actividad');
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Datos del festival inválidos');
      }
      throw error;
    }
  }

  async findAll(): Promise<Festival[]> {
    return this.festivalModel.find().populate('id_actividad').exec();
  }

  async findOne(id: string): Promise<Festival> {
    this.validateMongoId(id);
    const festival = await this.festivalModel.findById(id).populate('id_actividad').exec();
    if (!festival) throw new NotFoundException(`Festival con ID ${id} no encontrado`);
    return festival;
  }

  async update(id: string, updateFestivalDto: UpdateFestivalDto): Promise<Festival> {
    this.validateMongoId(id);
    
    const festival = await this.festivalModel.findById(id);
    if (!festival) throw new NotFoundException(`Festival con ID ${id} no encontrado`);

    Object.assign(festival, updateFestivalDto);
    return await festival.save();
  }

  async remove(id: string): Promise<Festival> {
    this.validateMongoId(id);
    const deletedFestival = await this.festivalModel.findByIdAndDelete(id);
    if (!deletedFestival) throw new NotFoundException(`Festival con ID ${id} no encontrado`);
    return deletedFestival;
  }

  async findByActividad(idActividad: string): Promise<Festival[]> {
    this.validateMongoId(idActividad);
    return this.festivalModel.find({ id_actividad: idActividad }).populate('id_actividad').exec();
  }

  async cambiarEstado(id: string, estado: string): Promise<Festival> {
    this.validateMongoId(id);
    if (!['activo', 'inactivo'].includes(estado)) {
      throw new BadRequestException('El estado debe ser "activo" o "inactivo"');
    }
    const festival = await this.festivalModel.findByIdAndUpdate(id, { estado }, { new: true }).populate('id_actividad');
    if (!festival) throw new NotFoundException(`Festival con ID ${id} no encontrado`);
    return festival;
  }

  async findProximos(): Promise<Festival[]> {
    const hoy = new Date();
    return this.festivalModel.find({ 
      fecha_inicio: { $gte: hoy },
      estado: 'activo'
    }).populate('id_actividad').exec();
  }

  async findByTipo(tipo: string): Promise<Festival[]> {
    return this.festivalModel.find({ 
      tipo: new RegExp(tipo, 'i'),
      estado: 'activo'
    }).populate('id_actividad').exec();
  }
  async findActivos(): Promise<Festival[]> {
  return this.festivalModel.find({ 
    estado: 'activo'
  }).populate('id_actividad').exec();
}
}