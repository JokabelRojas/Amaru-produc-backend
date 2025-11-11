import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  Query, 
  NotFoundException 
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicios.dto';
import { UpdateServicioDto } from './dto/update-servicios.dto';
import { Servicio } from 'src/entities/servicio.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo servicio',
    description: 'Crea un nuevo servicio asociado a una categoría y subcategoría existente'
  })
  @ApiBody({ type: CreateServicioDto })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente', type: Servicio })
  @ApiBadRequestResponse({ description: 'Datos inválidos o IDs de categoría/subcategoría no existen' })
  create(@Body() createServicioDto: CreateServicioDto): Promise<Servicio> {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios', description: 'Retorna todos los servicios' })
  @ApiResponse({ status: 200, description: 'Lista de servicios obtenida exitosamente', type: [Servicio] })
  findAll(): Promise<Servicio[]> {
    return this.serviciosService.findAll();
  }

  @Get('activos')
  @ApiOperation({ summary: 'Obtener servicios activos', description: 'Retorna todos los servicios con estado "activo"' })
  @ApiResponse({ status: 200, description: 'Lista de servicios activos obtenida', type: [Servicio] })
  @ApiNotFoundResponse({ description: 'No se encontraron servicios activos' })
  async findActivos(): Promise<Servicio[]> {
    const serviciosActivos = await this.serviciosService.findActivos();
    if (!serviciosActivos || serviciosActivos.length === 0) {
      throw new NotFoundException('No hay servicios activos disponibles');
    }
    return serviciosActivos;
  }

  @Get('filtrar/servicios')
  @ApiOperation({ summary: 'Filtrar servicios', description: 'Filtra por categoría, subcategoría y estado (opcional)' })
  @ApiQuery({ name: 'id_categoria', required: false, description: 'ID de la categoría' })
  @ApiQuery({ name: 'id_subcategoria', required: false, description: 'ID de la subcategoría' })
  @ApiQuery({ name: 'estado', required: false, description: 'Estado del servicio (activo/inactivo)', enum: ['activo', 'inactivo'] })
  @ApiResponse({ status: 200, description: 'Servicios filtrados obtenidos', type: [Servicio] })
  @ApiBadRequestResponse({ description: 'Parámetros de filtrado inválidos' })
  async filtrarServicios(
    @Query('id_categoria') idCategoria?: string,
    @Query('id_subcategoria') idSubcategoria?: string,
    @Query('estado') estado?: string,
  ): Promise<Servicio[]> {
    return this.serviciosService.filtrarServicios({ id_categoria: idCategoria, id_subcategoria: idSubcategoria, estado });
  }

  @Get('categoria/:idCategoria')
  @ApiOperation({ summary: 'Obtener servicios por categoría' })
  @ApiParam({ name: 'idCategoria', description: 'ID de la categoría (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Servicios de la categoría', type: [Servicio] })
  findByCategoria(@Param('idCategoria') idCategoria: string): Promise<Servicio[]> {
    return this.serviciosService.findByCategoria(idCategoria);
  }

  @Get('subcategoria/:idSubcategoria')
  @ApiOperation({ summary: 'Obtener servicios por subcategoría' })
  @ApiParam({ name: 'idSubcategoria', description: 'ID de la subcategoría (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Servicios de la subcategoría', type: [Servicio] })
  findBySubcategoria(@Param('idSubcategoria') idSubcategoria: string): Promise<Servicio[]> {
    return this.serviciosService.findBySubcategoria(idSubcategoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiParam({ name: 'id', description: 'ID del servicio (MongoDB ObjectId)' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado', type: Servicio })
  @ApiNotFoundResponse({ description: 'Servicio no encontrado' })
  findOne(@Param('id') id: string): Promise<Servicio> {
    return this.serviciosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio a actualizar' })
  @ApiBody({ type: UpdateServicioDto })
  @ApiResponse({ status: 200, description: 'Servicio actualizado', type: Servicio })
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto): Promise<Servicio> {
    return this.serviciosService.update(id, updateServicioDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: { type: 'string', enum: ['activo', 'inactivo'], description: 'Nuevo estado del servicio' }
      },
      required: ['estado']
    }
  })
  @ApiResponse({ status: 200, description: 'Estado cambiado', type: Servicio })
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: string): Promise<Servicio> {
    return this.serviciosService.cambiarEstado(id, estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio a eliminar' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.serviciosService.remove(id);
  }
}
