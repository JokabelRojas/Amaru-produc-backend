import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfesorService } from './profesores.service';
import { CreateProfesorDto } from './dto/create-profesores.dto';
import { UpdateProfesorDto } from './dto/update-profesores.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Profesores')
@Controller('profesor')
export class ProfesorController {
  constructor(private readonly profesorService: ProfesorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear profesor' })
  create(@Body() dto: CreateProfesorDto) {
    return this.profesorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los profesores' })
  findAll() {
    return this.profesorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un profesor por ID' })
  findOne(@Param('id') id: string) {
    return this.profesorService.findOne(id);
  }
  

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar profesor' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfesorDto,
  ) {
    return this.profesorService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar profesor' })
  remove(@Param('id') id: string) {
    return this.profesorService.remove(id);
  }
}
