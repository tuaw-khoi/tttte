"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeListResponseDto = exports.EmployeeResponseDto = void 0;
class EmployeeResponseDto {
    id;
    fullName;
    email;
    phoneNumber;
    department;
    position;
    hireDate;
    createdAt;
}
exports.EmployeeResponseDto = EmployeeResponseDto;
class EmployeeListResponseDto {
    employees;
    total;
    page;
    limit;
}
exports.EmployeeListResponseDto = EmployeeListResponseDto;
//# sourceMappingURL=employee-response.dto.js.map