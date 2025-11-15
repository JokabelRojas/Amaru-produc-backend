import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubcategoriaDto } from './dto/create-subcategorias.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategorias.dto';
import { Subcategoria } from 'src/entities/subcategoria.entity';
import { Categoria } from 'src/entities/categoria.entity';

@Injectable()
export class SubcategoriasService {
  constructor(
    @InjectModel(Subcategoria.name) 
    private subcategoriaModel: Model<Subcategoria>,
      @InjectModel(Categoria.name)
    private categoriaModel: Model<Categoria>,
  ) {}

  async create(createSubcategoriaDto: CreateSubcategoriaDto): Promise<Subcategoria> {
    try {
      // Verificar que la categoría padre existe y está activa
      const categoriaPadre = await this.categoriaModel
        .findById(createSubcategoriaDto.id_categoria)
        .exec();
      
      if (!categoriaPadre) {
        throw new BadRequestException('La categoría especificada no existe');
      }

      if (categoriaPadre.estado === 'inactivo') {
        throw new BadRequestException('No se puede crear subcategoría en una categoría inactiva');
      }

      const createdSubcategoria = new this.subcategoriaModel(createSubcategoriaDto);
      const savedSubcategoria = await createdSubcategoria.save();
      return await savedSubcategoria.populate('id_categoria');
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Datos de subcategoría inválidos');
      }
      throw error;
    }
  }

  async findByCategoria(idCategoria: string): Promise<Subcategoria[]> {
    // Verificar que la categoría existe
    const categoria = await this.categoriaModel.findById(idCategoria).exec();
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.subcategoriaModel
      .find({ id_categoria: idCategoria })
      .populate('id_categoria')
      .exec();
  }

  async findAll(): Promise<Subcategoria[]> {
    return this.subcategoriaModel
      .find()
      .populate('id_categoria')
      .exec();
  }

  async findOne(id: string): Promise<Subcategoria> {
    const subcategoria = await this.subcategoriaModel
      .findById(id)
      .populate('id_categoria')
      .exec();
    
    if (!subcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }
    
    return subcategoria;
  }

  async update(id: string, updateSubcategoriaDto: UpdateSubcategoriaDto): Promise<Subcategoria> {
    const existingSubcategoria = await this.subcategoriaModel
      .findByIdAndUpdate(id, updateSubcategoriaDto, { new: true })
      .exec();
    
    if (!existingSubcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }
    
    return existingSubcategoria;
  }

  async remove(id: string): Promise<Subcategoria> {
    const deletedSubcategoria = await this.subcategoriaModel.findByIdAndDelete(id);
    
    if (!deletedSubcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }
    
    return deletedSubcategoria;
  }



  async cambiarEstado(id: string, estado: string): Promise<Subcategoria> {
    const subcategoria = await this.subcategoriaModel
      .findByIdAndUpdate(id, { estado }, { new: true })
      .exec();
    
    if (!subcategoria) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada`);
    }
    
    return subcategoria;
  }

  async activarTodasPorCategoria(idCategoria: string): Promise<{ message: string, count: number }> {
  const result = await this.subcategoriaModel.updateMany(
    { id_categoria: idCategoria },
    { estado: 'activo' }
  ).exec();

  return {
    message: `Se activaron ${result.modifiedCount} subcategorías`,
    count: result.modifiedCount
  };
}

async desactivarTodasPorCategoria(idCategoria: string): Promise<{ message: string, count: number }> {
  const result = await this.subcategoriaModel.updateMany(
    { id_categoria: idCategoria },
    { estado: 'inactivo' }
  ).exec();

  return {
    message: `Se desactivaron ${result.modifiedCount} subcategorías`,
    count: result.modifiedCount
  };
}
}