import { EmployeeService } from '../../services/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto';
import { EmployeeResponseDto, EmployeeListResponseDto } from '../responses/employee-response.dto';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto>;
    findAll(page: number, limit: number, search?: string): Promise<EmployeeListResponseDto>;
    findOne(id: string): Promise<EmployeeResponseDto>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeResponseDto>;
    remove(id: string): Promise<void>;
}
