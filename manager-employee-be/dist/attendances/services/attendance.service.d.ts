import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../http/dto/attendance.dto';
import { AttendanceResponseDto, AttendanceListResponseDto, AttendanceStatsDto } from '../http/responses/attendance-response.dto';
export declare class AttendanceService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto>;
    findAll(page?: number, limit?: number, employeeId?: string, date?: string): Promise<AttendanceListResponseDto>;
    findOne(id: string): Promise<AttendanceResponseDto>;
    findByEmployeeId(employeeId: string, page?: number, limit?: number): Promise<AttendanceListResponseDto>;
    findByDate(date: string, page?: number, limit?: number): Promise<AttendanceListResponseDto>;
    checkOut(id: string, checkOutTime?: string): Promise<AttendanceResponseDto>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<AttendanceResponseDto>;
    remove(id: string): Promise<void>;
    removeByEmployeeId(employeeId: string): Promise<void>;
    getStats(): Promise<AttendanceStatsDto>;
    private mapToResponse;
}
