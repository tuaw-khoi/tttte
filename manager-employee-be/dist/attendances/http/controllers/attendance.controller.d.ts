import { AttendanceService } from '../../services/attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../dto/attendance.dto';
import { AttendanceResponseDto, AttendanceListResponseDto, AttendanceStatsDto } from '../responses/attendance-response.dto';
import { HttpService } from '@nestjs/axios';
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly httpService;
    constructor(attendanceService: AttendanceService, httpService: HttpService);
    create(createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto>;
    findAll(page: number, limit: number, employeeId?: string, date?: string): Promise<AttendanceListResponseDto>;
    getStats(): Promise<AttendanceStatsDto>;
    findByEmployeeId(employeeId: string, page: number, limit: number): Promise<AttendanceListResponseDto>;
    findByDate(date: string, page: number, limit: number): Promise<AttendanceListResponseDto>;
    findOne(id: string): Promise<AttendanceResponseDto>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<AttendanceResponseDto>;
    checkOut(id: string, checkOutData?: {
        checkOutTime?: string;
    }): Promise<AttendanceResponseDto>;
    remove(id: string): Promise<void>;
    removeByEmployeeId(employeeId: string): Promise<void>;
    faceRecognitionCheckin(checkinData: {
        image: string;
        timestamp?: string;
    }): Promise<AttendanceResponseDto>;
    private calculateCosineSimilarity;
    findActiveAttendanceToday(employeeId: string): Promise<any>;
    debugEmployeeAttendance(employeeId: string): Promise<any>;
    checkoutEmployeeToday(employeeId: string, checkOutData?: {
        checkOutTime?: string;
    }): Promise<any>;
    faceRecognitionOnly(recognitionData: {
        image: string;
    }): Promise<any>;
}
