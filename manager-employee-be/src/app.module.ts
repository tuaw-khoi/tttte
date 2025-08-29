import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { EmployeeModule } from './employees/employee.module';
import { FaceEncodingModule } from './face-encodings/face-encoding.module';
import { AttendanceModule } from './attendances/attendance.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UserModule, EmployeeModule, FaceEncodingModule, AttendanceModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
