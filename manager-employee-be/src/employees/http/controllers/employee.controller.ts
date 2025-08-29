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
import { EmployeeService } from '../../services/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.dto';
import { EmployeeResponseDto, EmployeeListResponseDto } from '../responses/employee-response.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<EmployeeListResponseDto> {
    return this.employeeService.findAll(page, limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }
} 