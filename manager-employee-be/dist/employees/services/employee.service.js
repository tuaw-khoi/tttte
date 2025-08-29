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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmployeeService = class EmployeeService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createEmployeeDto) {
        if (createEmployeeDto.email) {
            const existingEmployee = await this.prismaService.employee.findUnique({
                where: { email: createEmployeeDto.email }
            });
            if (existingEmployee) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const employee = await this.prismaService.employee.create({
            data: {
                fullName: createEmployeeDto.fullName,
                email: createEmployeeDto.email,
                phoneNumber: createEmployeeDto.phoneNumber,
                department: createEmployeeDto.department,
                position: createEmployeeDto.position,
                hireDate: createEmployeeDto.hireDate ? new Date(createEmployeeDto.hireDate) : null,
            }
        });
        return this.mapToResponse(employee);
    }
    async findAll(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } },
                { position: { contains: search, mode: 'insensitive' } },
            ]
        } : {};
        const [employees, total] = await Promise.all([
            this.prismaService.employee.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prismaService.employee.count({ where })
        ]);
        return {
            employees: employees.map(employee => this.mapToResponse(employee)),
            total,
            page,
            limit
        };
    }
    async findOne(id) {
        const employee = await this.prismaService.employee.findUnique({
            where: { id }
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return this.mapToResponse(employee);
    }
    async update(id, updateEmployeeDto) {
        const existingEmployee = await this.prismaService.employee.findUnique({
            where: { id }
        });
        if (!existingEmployee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        if (updateEmployeeDto.email && updateEmployeeDto.email !== existingEmployee.email) {
            const emailExists = await this.prismaService.employee.findUnique({
                where: { email: updateEmployeeDto.email }
            });
            if (emailExists) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        const employee = await this.prismaService.employee.update({
            where: { id },
            data: {
                fullName: updateEmployeeDto.fullName,
                email: updateEmployeeDto.email,
                phoneNumber: updateEmployeeDto.phoneNumber,
                department: updateEmployeeDto.department,
                position: updateEmployeeDto.position,
                hireDate: updateEmployeeDto.hireDate ? new Date(updateEmployeeDto.hireDate) : null,
            }
        });
        return this.mapToResponse(employee);
    }
    async remove(id) {
        const employee = await this.prismaService.employee.findUnique({
            where: { id }
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        await this.prismaService.employee.delete({
            where: { id }
        });
    }
    mapToResponse(employee) {
        return {
            id: employee.id,
            fullName: employee.fullName,
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            department: employee.department,
            position: employee.position,
            hireDate: employee.hireDate,
            createdAt: employee.createdAt,
        };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map