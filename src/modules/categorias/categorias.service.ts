import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria, CategoriaDocument } from 'src/entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categorias.dto';
import { UpdateCategoriaDto } from './dto/update-categorias.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectModel(Categoria.name) private readonly categoriaModel: Model<CategoriaDocument>,
  ) {}

  // Crear
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const created = new this.categoriaModel(createCategoriaDto);
    return created.save();
  }

  // Obtener todas
  async findAll(): Promise<Categoria[]> {
    return this.categoriaModel.find().exec();
  }

  // Obtener activas
  async findActive(): Promise<Categoria[]> {
    return this.categoriaModel.find({ estado: 'activo' }).exec();
  }

  // Filtrar por estado (activo/inactivo)
  async findByEstado(estado: 'activo' | 'inactivo'): Promise<Categoria[]> {
    return this.categoriaModel.find({ estado }).exec();
  }

  // Filtrar por tipo
  async findByTipo(tipo: 'taller' | 'servicio'): Promise<Categoria[]> {
    return this.categoriaModel.find({ tipo, estado: 'activo' }).exec();
  }

  // Buscar por rango de fechas
  async findByDateRange(startDate: Date, endDate: Date): Promise<Categoria[]> {
    return this.categoriaModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();
  }

  // Buscar por ID
  async findOne(id: string): Promise<Categoria> {
    const categoria = await this.categoriaModel.findById(id).exec();
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  // Actualizar
  async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const updated = await this.categoriaModel
      .findByIdAndUpdate(id, updateCategoriaDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Categoría no encontrada');
    return updated;
  }

  // Soft delete / desactivar
  async softDelete(id: string): Promise<Categoria> {
    const categoria = await this.categoriaModel
      .findByIdAndUpdate(id, { estado: 'inactivo' }, { new: true })
      .exec();
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  // Activar
  async activate(id: string): Promise<Categoria> {
    const categoria = await this.categoriaModel
      .findByIdAndUpdate(id, { estado: 'activo' }, { new: true })
      .exec();
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  // Eliminar permanente
  async remove(id: string): Promise<void> {
    const result = await this.categoriaModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Categoría no encontrada');
  }
}
