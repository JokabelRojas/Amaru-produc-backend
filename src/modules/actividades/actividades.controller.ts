import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';

@ApiTags('Actividades')
@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear actividad' })
  create(@Body() dto: CreateActividadDto) {
    return this.actividadesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar actividad' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActividadDto,
  ) {
    return this.actividadesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar actividad' })
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}