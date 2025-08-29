import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FaceEncodingService } from './services/face-encoding.service';
import { FaceEncodingController } from './http/controllers/face-encoding.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [FaceEncodingController],
  providers: [FaceEncodingService],
  exports: [FaceEncodingService]
})
export class FaceEncodingModule {} 