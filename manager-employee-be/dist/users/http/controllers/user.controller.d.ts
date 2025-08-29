import { UserService } from 'src/users/services/user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto';
import { UserResponseDto, UserListResponseDto, LoginResponseDto } from '../responses/user-response.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    login(loginUserDto: LoginUserDto): Promise<LoginResponseDto>;
    findAll(page: number, limit: number, search?: string): Promise<UserListResponseDto>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
}
