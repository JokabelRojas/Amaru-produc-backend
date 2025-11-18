import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categoria, CategoriaDocument } from 'src/entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categorias.dto';
import { UpdateCategoriaDto } from './dto/update-categorias.dto';
import { Subcategoria } from 'src/entities/subcategoria.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectModel(Categoria.name) private readonly categoriaModel: Model<CategoriaDocument>,
    @InjectModel(Subcategoria.name) private readonly subcategoriaModel: Model<Subcategoria>,
  ) {}

  // Validadores
  private async validateCreateCategoria(createCategoriaDto: CreateCategoriaDto): Promise<void> {
    // Validar nombre único
    const existingCategoria = await this.categoriaModel.findOne({
      nombre: createCategoriaDto.nombre,
    }).exec();

    if (existingCategoria) {
      throw new ConflictException({
        message: 'Ya existe una categoría con este nombre',
        error: 'CONFLICT',
        statusCode: 409,
      });
    }

    // Validar tipo
    const validTypes = ['taller', 'servicio'];
    if (!validTypes.includes(createCategoriaDto.tipo)) {
      throw new BadRequestException({
        message: 'El tipo debe ser "taller" o "servicio"',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    // Validar estado si se proporciona
    if (createCategoriaDto.estado) {
      const validStates = ['activo', 'inactivo'];
      if (!validStates.includes(createCategoriaDto.estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
    }
  }

  private async validateUpdateCategoria(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<void> {
    // Verificar que la categoría existe
    const categoriaExists = await this.categoriaModel.findById(id).exec();
    if (!categoriaExists) {
      throw new NotFoundException({
        message: 'Categoría no encontrada',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }

    // Validar nombre único (si se está actualizando el nombre)
    if (updateCategoriaDto.nombre) {
      const existingCategoria = await this.categoriaModel.findOne({
        nombre: updateCategoriaDto.nombre,
        _id: { $ne: id }, // Excluir la categoría actual
      }).exec();

      if (existingCategoria) {
        throw new ConflictException({
          message: 'Ya existe otra categoría con este nombre',
          error: 'CONFLICT',
          statusCode: 409,
        });
      }
    }

    // Validar tipo (si se está actualizando)
    if (updateCategoriaDto.tipo) {
      const validTypes = ['taller', 'servicio'];
      if (!validTypes.includes(updateCategoriaDto.tipo)) {
        throw new BadRequestException({
          message: 'El tipo debe ser "taller" o "servicio"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
    }

    // Validar estado (si se está actualizando)
    if (updateCategoriaDto.estado) {
      const validStates = ['activo', 'inactivo'];
      if (!validStates.includes(updateCategoriaDto.estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }
    }
  }

  private async validateCategoriaExists(id: string): Promise<Categoria> {
    const categoria = await this.categoriaModel.findById(id).exec();
    if (!categoria) {
      throw new NotFoundException({
        message: 'Categoría no encontrada',
        error: 'NOT_FOUND',
        statusCode: 404,
      });
    }
    return categoria;
  }

  // Crear
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      await this.validateCreateCategoria(createCategoriaDto);

      const created = new this.categoriaModel(createCategoriaDto);
      const savedCategoria = await created.save();

      return savedCategoria;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al crear la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Obtener todas
  async findAll(): Promise<Categoria[]> {
    try {
      const categorias = await this.categoriaModel.find().exec();
      return categorias;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener las categorías',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Obtener activas
  async findActive(): Promise<Categoria[]> {
    try {
      const categorias = await this.categoriaModel.find({ estado: 'activo' }).exec();
      return categorias;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al obtener las categorías activas',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Filtrar por estado (activo/inactivo)
  async findByEstado(estado: 'activo' | 'inactivo'): Promise<Categoria[]> {
    try {
      // Validar estado
      const validStates = ['activo', 'inactivo'];
      if (!validStates.includes(estado)) {
        throw new BadRequestException({
          message: 'El estado debe ser "activo" o "inactivo"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const categorias = await this.categoriaModel.find({ estado }).exec();
      return categorias;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al filtrar las categorías por estado',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Filtrar por tipo
  async findByTipo(tipo: 'taller' | 'servicio'): Promise<Categoria[]> {
    try {
      // Validar tipo
      const validTypes = ['taller', 'servicio'];
      if (!validTypes.includes(tipo)) {
        throw new BadRequestException({
          message: 'El tipo debe ser "taller" o "servicio"',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const categorias = await this.categoriaModel.find({ tipo, estado: 'activo' }).exec();
      return categorias;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al filtrar las categorías por tipo',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Buscar por rango de fechas
  async findByDateRange(startDate: Date, endDate: Date): Promise<Categoria[]> {
    try {
      // Validar fechas
      if (!startDate || !endDate) {
        throw new BadRequestException({
          message: 'Las fechas de inicio y fin son requeridas',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      if (startDate > endDate) {
        throw new BadRequestException({
          message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      const categorias = await this.categoriaModel
        .find({
          createdAt: { $gte: startDate, $lte: endDate },
        })
        .exec();

      return categorias;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al buscar categorías por rango de fechas',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Buscar por ID
  async findOne(id: string): Promise<Categoria> {
    try {
      const categoria = await this.validateCategoriaExists(id);
      return categoria;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al obtener la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Actualizar
  async update(id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    try {
      await this.validateUpdateCategoria(id, updateCategoriaDto);

      const updated = await this.categoriaModel
        .findByIdAndUpdate(id, updateCategoriaDto, { new: true })
        .exec();

      return updated!;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al actualizar la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Soft delete / desactivar
  async softDelete(id: string): Promise<Categoria> {
    try {
      await this.validateCategoriaExists(id);

      const categoria = await this.categoriaModel
        .findByIdAndUpdate(id, { estado: 'inactivo' }, { new: true })
        .exec();

      // Desactivar TODAS las subcategorías relacionadas
      await this.subcategoriaModel.updateMany(
        { id_categoria: id },
        { estado: 'inactivo' }
      ).exec();

      return categoria!;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al desactivar la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Activar
  async activate(id: string): Promise<Categoria> {
    try {
      await this.validateCategoriaExists(id);

      const categoria = await this.categoriaModel
        .findByIdAndUpdate(id, { estado: 'activo' }, { new: true })
        .exec();

      // Activar TODAS las subcategorías relacionadas
      await this.subcategoriaModel.updateMany(
        { id_categoria: id },
        { estado: 'activo' }
      ).exec();

      return categoria!;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al activar la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }

  // Eliminar permanente
  async remove(id: string): Promise<void> {
    try {
      await this.validateCategoriaExists(id);

      // Verificar si existen subcategorías antes de eliminar
      const subcategoriasCount = await this.subcategoriaModel.countDocuments({ 
        id_categoria: id 
      }).exec();
      
      if (subcategoriasCount > 0) {
        throw new BadRequestException({
          message: 'No se puede eliminar la categoría porque tiene subcategorías asociadas. Desactívela en su lugar.',
          error: 'BAD_REQUEST',
          statusCode: 400,
        });
      }

      await this.categoriaModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Error al eliminar la categoría',
        error: 'BAD_REQUEST',
        statusCode: 400,
        details: error.message,
      });
    }
  }
}