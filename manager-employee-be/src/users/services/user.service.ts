import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../http/dto/user.dto';
import { UserResponseDto, UserListResponseDto, LoginResponseDto } from '../http/responses/user-response.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        // Check if username already exists
        const existingUsername = await this.prismaService.user.findUnique({
            where: { username: createUserDto.username }
        });
        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        // Check if email already exists
        const existingEmail = await this.prismaService.user.findUnique({
            where: { email: createUserDto.email }
        });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                username: createUserDto.username,
                passwordHash: hashedPassword,
                email: createUserDto.email,
                role: createUserDto.role || 'admin',
            }
        });

        return this.mapToResponse(user);
    }

    async findAll(page: number = 1, limit: number = 10, search?: string): Promise<UserListResponseDto> {
        const skip = (page - 1) * limit;
        
        const where = search ? {
            OR: [
                { username: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { role: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            this.prismaService.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prismaService.user.count({ where })
        ]);

        return {
            users: users.map(user => this.mapToResponse(user)),
            total,
            page,
            limit
        };
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.mapToResponse(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        // Check if user exists
        const existingUser = await this.prismaService.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Check if username already exists (if being updated)
        if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
            const usernameExists = await this.prismaService.user.findUnique({
                where: { username: updateUserDto.username }
            });
            if (usernameExists) {
                throw new ConflictException('Username already exists');
            }
        }

        // Check if email already exists (if being updated)
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prismaService.user.findUnique({
                where: { email: updateUserDto.email }
            });
            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }

        const updateData: any = {};
        
        if (updateUserDto.username) updateData.username = updateUserDto.username;
        if (updateUserDto.email) updateData.email = updateUserDto.email;
        if (updateUserDto.role) updateData.role = updateUserDto.role;
        
        // Hash password if being updated
        if (updateUserDto.password) {
            updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
        }

        const user = await this.prismaService.user.update({
            where: { id },
            data: updateData
        });

        return this.mapToResponse(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prismaService.user.delete({
            where: { id }
        });
    }

    async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
        const user = await this.prismaService.user.findUnique({
            where: { username: loginUserDto.username }
        });

        console.log('User found:', user);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return {
            user: this.mapToResponse(user),
            token
        };
    }

    private mapToResponse(user: any): UserResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
}
