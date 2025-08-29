"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceStatsDto = exports.AttendanceListResponseDto = exports.AttendanceResponseDto = void 0;
class AttendanceResponseDto {
    id;
    checkIn;
    checkOut;
    notes;
    createdAt;
    updatedAt;
    employeeId;
    employee;
}
exports.AttendanceResponseDto = AttendanceResponseDto;
class AttendanceListResponseDto {
    attendances;
    total;
    page;
    limit;
}
exports.AttendanceListResponseDto = AttendanceListResponseDto;
class AttendanceStatsDto {
    totalAttendances;
    todayAttendances;
    thisWeekAttendances;
    thisMonthAttendances;
    activeAttendances;
    completedAttendances;
}
exports.AttendanceStatsDto = AttendanceStatsDto;
//# sourceMappingURL=attendance-response.dto.js.map