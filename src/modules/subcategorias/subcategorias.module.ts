import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubcategoriasService } from './subcategorias.service';
import { SubcategoriasController } from './subcategorias.controller';
import { Subcategoria, SubcategoriaSchema } from 'src/entities/subcategoria.entity';
import { Categoria, CategoriaSchema } from 'src/entities/categoria.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subcategoria.name, schema: SubcategoriaSchema },
      { name: Categoria.name, schema: CategoriaSchema } 

    ])
  ],
  controllers: [SubcategoriasController],
  providers: [SubcategoriasService],
  exports: [SubcategoriasService]
})
export class SubcategoriasModule { }