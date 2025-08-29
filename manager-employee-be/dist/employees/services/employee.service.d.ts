import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../http/dto/employee.dto';
import { EmployeeResponseDto, EmployeeListResponseDto } from '../http/responses/employee-response.dto';
export declare class EmployeeService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto>;
    findAll(page?: number, limit?: number, search?: string): Promise<EmployeeListResponseDto>;
    findOne(id: string): Promise<EmployeeResponseDto>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeResponseDto>;
    remove(id: string): Promise<void>;
    private mapToResponse;
}
