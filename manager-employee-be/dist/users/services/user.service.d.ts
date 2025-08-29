import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../http/dto/user.dto';
import { UserResponseDto, UserListResponseDto, LoginResponseDto } from '../http/responses/user-response.dto';
export declare class UserService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(page?: number, limit?: number, search?: string): Promise<UserListResponseDto>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    login(loginUserDto: LoginUserDto): Promise<LoginResponseDto>;
    private mapToResponse;
}
