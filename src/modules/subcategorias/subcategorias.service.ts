import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
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

  private validateMongoId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException({
        message: `ID ${id} no es válido`,
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }
  }

  private async validateCreateSubcategoria(dto: CreateSubcategoriaDto): Promise<void> {
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

    // Validar nombre único en la misma categoría
    const existingSubcategoria = await this.subcategoriaModel.findOne({
      nombre: dto.nombre,
      id_categoria: dto.id_categoria,
    }).exec();

    if (existingSubcategoria) {
      throw new ConflictException({
        message: 'Ya existe una subcategoría con este nombre en la categoría seleccionada',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }
  }

  private async validateSubcategoriaExists(id: string): Promise<Subcategoria> {
    this.validateMongoId(id);
    const subcategoria = await this.subcategoriaModel.findById(id).exec();
    if (!subcategoria) {
      throw new NotFoundException({
        message: 'Subcategoría no encontrada',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return subcategoria;
  }

  async create(createSubcategoriaDto: CreateSubcategoriaDto): Promise<Subcategoria> {
    try {
      await this.validateCreateSubcategoria(createSubcategoriaDto);

      // Verificar que la categoría padre existe y está activa
      this.validateMongoId(createSubcategoriaDto.id_categoria);
      const categoriaPadre = await this.categoriaModel
        .findById(createSubcategoriaDto.id_categoria)
        .exec();
      
      if (!categoriaPadre) {
        throw new BadRequestException({
          message: 'La categoría especificada no existe',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      if (categoriaPadre.estado === 'inactivo') {
        throw new BadRequestException({
          message: 'No se puede crear subcategoría en una categoría inactiva',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const createdSubcategoria = new this.subcategoriaModel(createSubcategoriaDto);
      const savedSubcategoria = await createdSubcategoria.save();
      const populatedSubcategoria = await savedSubcategoria.populate('id_categoria');
      
      return populatedSubcategoria;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException({
          message: 'Datos de subcategoría inválidos',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear la subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findByCategoria(idCategoria: string): Promise<Subcategoria[]> {
    try {
      this.validateMongoId(idCategoria);
      
      // Verificar que la categoría existe
      const categoria = await this.categoriaModel.findById(idCategoria).exec();
      if (!categoria) {
        throw new NotFoundException({
          message: 'Categoría no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      const subcategorias = await this.subcategoriaModel
        .find({ id_categoria: idCategoria })
        .populate('id_categoria')
        .exec();

      return subcategorias;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al buscar subcategorías por categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findAll(): Promise<Subcategoria[]> {
    try {
      const subcategorias = await this.subcategoriaModel
        .find()
        .populate('id_categoria')
        .exec();

      return subcategorias;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener las subcategorías',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findOne(id: string): Promise<Subcategoria> {
    try {
      const subcategoria = await this.validateSubcategoriaExists(id);
      const populatedSubcategoria = await subcategoria.populate('id_categoria');
      
      return populatedSubcategoria;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener la subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async update(id: string, updateSubcategoriaDto: UpdateSubcategoriaDto): Promise<Subcategoria> {
    try {
      const subcategoria = await this.validateSubcategoriaExists(id);

      // Validar nombre único si se está actualizando
      if (updateSubcategoriaDto.nombre) {
        const existingSubcategoria = await this.subcategoriaModel.findOne({
          nombre: updateSubcategoriaDto.nombre,
          id_categoria: subcategoria.id_categoria,
          _id: { $ne: id },
        }).exec();

        if (existingSubcategoria) {
          throw new ConflictException({
            message: 'Ya existe otra subcategoría con este nombre en la categoría',
            error: 'CONFLICT',
            statusCode: 409,
          });
        }
      }

      // Validar categoría si se está actualizando
      if (updateSubcategoriaDto.id_categoria) {
        this.validateMongoId(updateSubcategoriaDto.id_categoria);
        const nuevaCategoria = await this.categoriaModel.findById(updateSubcategoriaDto.id_categoria).exec();
        
        if (!nuevaCategoria) {
          throw new BadRequestException({
            message: 'La categoría especificada no existe',
            error: 'BAD_REQUEST',
            statusCode: 400,
          });
        }

        if (nuevaCategoria.estado === 'inactivo') {
          throw new BadRequestException({
            message: 'No se puede mover la subcategoría a una categoría inactiva',
            error: 'BAD_REQUEST',
            statusCode: 400,
          });
        }
      }

      Object.assign(subcategoria, updateSubcategoriaDto);
      const savedSubcategoria = await subcategoria.save();
      const populatedSubcategoria = await savedSubcategoria.populate('id_categoria');

      return populatedSubcategoria;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar la subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.validateSubcategoriaExists(id);

      const deletedSubcategoria = await this.subcategoriaModel.findByIdAndDelete(id).exec();
      
      if (!deletedSubcategoria) {
        throw new NotFoundException({
          message: 'Subcategoría no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar la subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async cambiarEstado(id: string, estado: string): Promise<Subcategoria> {
    try {
      await this.validateSubcategoriaExists(id);
      
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const subcategoria = await this.subcategoriaModel
        .findByIdAndUpdate(id, { estado }, { new: true })
        .populate('id_categoria')
        .exec();
      
      if (!subcategoria) {
        throw new NotFoundException({
          message: 'Subcategoría no encontrada',
          error: 'NOT_FOUND',
          statusCode: 404,
        });
      }

      return subcategoria;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al cambiar el estado de la subcategoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async activarTodasPorCategoria(idCategoria: string): Promise<{ message: string; count: number }> {
    try {
      this.validateMongoId(idCategoria);
      
      const result = await this.subcategoriaModel.updateMany(
        { id_categoria: idCategoria },
        { estado: 'activo' }
      ).exec();

      return {
        message: `Se activaron ${result.modifiedCount} subcategorías`,
        count: result.modifiedCount
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al activar subcategorías por categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async desactivarTodasPorCategoria(idCategoria: string): Promise<{ message: string; count: number }> {
    try {
      this.validateMongoId(idCategoria);
      
      const result = await this.subcategoriaModel.updateMany(
        { id_categoria: idCategoria },
        { estado: 'inactivo' }
      ).exec();

      return {
        message: `Se desactivaron ${result.modifiedCount} subcategorías`,
        count: result.modifiedCount
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al desactivar subcategorías por categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findActivas(): Promise<Subcategoria[]> {
    try {
      const subcategorias = await this.subcategoriaModel
        .find({ estado: 'activo' })
        .populate('id_categoria')
        .exec();

      return subcategorias;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener las subcategorías activas',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  async findByEstado(estado: string): Promise<Subcategoria[]> {
    try {
      if (!['activo', 'inactivo'].includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const subcategorias = await this.subcategoriaModel
        .find({ estado })
        .populate('id_categoria')
        .exec();

      return subcategorias;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al filtrar subcategorías por estado',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}