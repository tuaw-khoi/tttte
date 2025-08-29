export class AttendanceResponseDto {
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

export class AttendanceListResponseDto {
  attendances: AttendanceResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class AttendanceStatsDto {
  totalAttendances: number;
  todayAttendances: number;
  thisWeekAttendances: number;
  thisMonthAttendances: number;
  activeAttendances: number; // Số nhân viên đang làm việc
  completedAttendances: number; // Số nhân viên đã hoàn thành ngày làm việc
} 