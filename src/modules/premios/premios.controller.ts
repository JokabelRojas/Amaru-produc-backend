import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreatePremioDto } from './dto/create-premio.dto';
import { UpdatePremioDto } from './dto/update-premio.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PremiosService } from './premios.service';

@ApiTags('Premios')
@Controller('premios')
export class PremiosController {
  constructor(private readonly premiosService: PremiosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear premio' })
  create(@Body() dto: CreatePremioDto) {
    return this.premiosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los premios' })
  findAll() {
    return this.premiosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un premio por ID' })
  findOne(@Param('id') id: string) {
    return this.premiosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar premio' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePremioDto,
  ) {
    return this.premiosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar premio' })
  remove(@Param('id') id: string) {
    return this.premiosService.remove(id);
  }
}