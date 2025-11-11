import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profesor } from '../../entities/profesor.entity';
import { CreateProfesorDto } from './dto/create-profesores.dto';
import { UpdateProfesorDto } from './dto/update-profesores.dto';

@Injectable()
export class ProfesorService {

  constructor(
    @InjectModel(Profesor.name)
    private readonly profesorModel: Model<Profesor>,
  ) {}

  async create(dto: CreateProfesorDto): Promise<Profesor> {
    const profesor = new this.profesorModel(dto);
    return await profesor.save();
  }

  async findAll(): Promise<Profesor[]> {
    return this.profesorModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Profesor> {
    const profesor = await this.profesorModel.findById(id);
    if (!profesor) throw new NotFoundException('Profesor no encontrado');
    return profesor;
  }

  async update(id: string, dto: UpdateProfesorDto): Promise<Profesor> {
    const profesor = await this.profesorModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!profesor) throw new NotFoundException('Profesor no encontrado');
    return profesor;
  }

  async remove(id: string): Promise<{ message: string }> {
    const profesor = await this.profesorModel.findByIdAndDelete(id);
    if (!profesor) throw new NotFoundException('Profesor no encontrado');

    return { message: 'Profesor eliminado correctamente' };
  }
}
