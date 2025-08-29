import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { UserService } from 'src/users/services/user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../dto/user.dto';
import { UserResponseDto, UserListResponseDto, LoginResponseDto } from '../responses/user-response.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.create(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
        console.log('Login attempt with:', loginUserDto);
        
        return this.userService.login(loginUserDto);
    }

    @Get()
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('search') search?: string,
    ): Promise<UserListResponseDto> {
        return this.userService.findAll(page, limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string, 
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
