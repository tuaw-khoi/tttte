"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let UserService = class UserService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createUserDto) {
        const existingUsername = await this.prismaService.user.findUnique({
            where: { username: createUserDto.username }
        });
        if (existingUsername) {
            throw new common_1.ConflictException('Username already exists');
        }
        const existingEmail = await this.prismaService.user.findUnique({
            where: { email: createUserDto.email }
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists');
        }
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
    async findAll(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { role: { contains: search, mode: 'insensitive' } },
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
    async findOne(id) {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.mapToResponse(user);
    }
    async update(id, updateUserDto) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
            const usernameExists = await this.prismaService.user.findUnique({
                where: { username: updateUserDto.username }
            });
            if (usernameExists) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prismaService.user.findUnique({
                where: { email: updateUserDto.email }
            });
            if (emailExists) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const updateData = {};
        if (updateUserDto.username)
            updateData.username = updateUserDto.username;
        if (updateUserDto.email)
            updateData.email = updateUserDto.email;
        if (updateUserDto.role)
            updateData.role = updateUserDto.role;
        if (updateUserDto.password) {
            updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
        }
        const user = await this.prismaService.user.update({
            where: { id },
            data: updateData
        });
        return this.mapToResponse(user);
    }
    async remove(id) {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prismaService.user.delete({
            where: { id }
        });
    }
    async login(loginUserDto) {
        const user = await this.prismaService.user.findUnique({
            where: { username: loginUserDto.username }
        });
        console.log('User found:', user);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = jwt.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        return {
            user: this.mapToResponse(user),
            token
        };
    }
    mapToResponse(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map