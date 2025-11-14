import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PremiosService } from './premios.service';
import { PremiosController } from './premios.controller';
import { Premio, PremioSchema } from 'src/entities/premio.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Premio.name, schema: PremioSchema }
    ])
  ],
  controllers: [PremiosController],
  providers: [PremiosService],
  exports: [PremiosService]
})
export class PremiosModule {}