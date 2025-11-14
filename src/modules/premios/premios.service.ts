import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePremioDto } from './dto/create-premio.dto';
import { UpdatePremioDto } from './dto/update-premio.dto';
import { Premio } from 'src/entities/premio.entity';

@Injectable()
export class PremiosService {

  constructor(
    @InjectModel(Premio.name)
    private readonly premioModel: Model<Premio>,
  ) {}

  async create(dto: CreatePremioDto): Promise<Premio> {
    const premio = new this.premioModel(dto);
    return await premio.save();
  }

  async findAll(): Promise<Premio[]> {
    return this.premioModel.find().sort({ fecha: -1, createdAt: -1 });
  }

  async findOne(id: string): Promise<Premio> {
    const premio = await this.premioModel.findById(id);
    if (!premio) throw new NotFoundException('Premio no encontrado');
    return premio;
  }

  async update(id: string, dto: UpdatePremioDto): Promise<Premio> {
    const premio = await this.premioModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!premio) throw new NotFoundException('Premio no encontrado');
    return premio;
  }

  async remove(id: string): Promise<{ message: string }> {
    const premio = await this.premioModel.findByIdAndDelete(id);
    if (!premio) throw new NotFoundException('Premio no encontrado');

    return { message: 'Premio eliminado correctamente' };
  }
}