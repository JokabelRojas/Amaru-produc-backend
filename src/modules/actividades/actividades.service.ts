import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateActividadDto): Promise<Actividad> {
    const actividad = new this.actividadModel(dto);
    return await actividad.save();
  }

  async findAll(): Promise<Actividad[]> {
    return this.actividadModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Actividad> {
    const actividad = await this.actividadModel.findById(id);
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    return actividad;
  }

  async update(id: string, dto: UpdateActividadDto): Promise<Actividad> {
    const actividad = await this.actividadModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    return actividad;
  }

  async remove(id: string): Promise<{ message: string }> {
    const actividad = await this.actividadModel.findByIdAndDelete(id);
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    return { message: 'Actividad eliminada correctamente' };
  }
}