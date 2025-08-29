import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../http/dto/employee.dto';
import { EmployeeResponseDto, EmployeeListResponseDto } from '../http/responses/employee-response.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    // Check if email already exists
    if (createEmployeeDto.email) {
      const existingEmployee = await this.prismaService.employee.findUnique({
        where: { email: createEmployeeDto.email }
      });
      if (existingEmployee) {
        throw new ConflictException('Email already exists');
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

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<EmployeeListResponseDto> {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { department: { contains: search, mode: 'insensitive' as const } },
        { position: { contains: search, mode: 'insensitive' as const } },
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

  async findOne(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.prismaService.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.mapToResponse(employee);
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    // Check if employee exists
    const existingEmployee = await this.prismaService.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if email already exists (if being updated)
    if (updateEmployeeDto.email && updateEmployeeDto.email !== existingEmployee.email) {
      const emailExists = await this.prismaService.employee.findUnique({
        where: { email: updateEmployeeDto.email }
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
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

  async remove(id: string): Promise<void> {
    const employee = await this.prismaService.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prismaService.employee.delete({
      where: { id }
    });
  }

  private mapToResponse(employee: any): EmployeeResponseDto {
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
} 