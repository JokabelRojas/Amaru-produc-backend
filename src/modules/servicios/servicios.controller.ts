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
    description: 'Crea un nuevo servicio independiente sin categorías'
  })
  @ApiBody({ type: CreateServicioDto })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente', type: Servicio })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  create(@Body() createServicioDto: CreateServicioDto): Promise<Servicio> {
    return this.serviciosService.create(createServicioDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los servicios', 
    description: 'Retorna todos los servicios sin filtros de categoría' 
  })
  @ApiResponse({ status: 200, description: 'Lista de servicios obtenida exitosamente', type: [Servicio] })
  findAll(): Promise<Servicio[]> {
    return this.serviciosService.findAll();
  }

  @Get('activos')
  @ApiOperation({ 
    summary: 'Obtener servicios activos', 
    description: 'Retorna todos los servicios con estado "activo"' 
  })
  @ApiResponse({ status: 200, description: 'Lista de servicios activos obtenida', type: [Servicio] })
  @ApiNotFoundResponse({ description: 'No se encontraron servicios activos' })
  async findActivos(): Promise<Servicio[]> {
    const serviciosActivos = await this.serviciosService.findActivos();
    if (!serviciosActivos || serviciosActivos.length === 0) {
      throw new NotFoundException('No hay servicios activos disponibles');
    }
    return serviciosActivos;
  }

  @Get('filtrar')
  @ApiOperation({ 
    summary: 'Filtrar servicios por estado', 
    description: 'Filtra servicios por estado (activo/inactivo)' 
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    description: 'Estado del servicio (activo/inactivo)', 
    enum: ['activo', 'inactivo'] 
  })
  @ApiResponse({ status: 200, description: 'Servicios filtrados obtenidos', type: [Servicio] })
  @ApiBadRequestResponse({ description: 'Parámetro de estado inválido' })
  async filtrarServicios(
    @Query('estado') estado?: string,
  ): Promise<Servicio[]> {
    return this.serviciosService.filtrarServicios({ estado });
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