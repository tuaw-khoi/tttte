export declare class AttendanceResponseDto {
    id: string;
    checkIn: Date;
    checkOut?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    employeeId: string;
    employee?: {
        id: string;
        fullName: string;
        email?: string;
    };
}
export declare class AttendanceListResponseDto {
    attendances: AttendanceResponseDto[];
    total: number;
    page: number;
    limit: number;
}
export declare class AttendanceStatsDto {
    totalAttendances: number;
    todayAttendances: number;
    thisWeekAttendances: number;
    thisMonthAttendances: number;
    activeAttendances: number;
    completedAttendances: number;
}
