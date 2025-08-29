import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './http/controllers/attendance.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService]
})
export class AttendanceModule {} 