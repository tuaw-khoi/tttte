import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './http/controllers/user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
