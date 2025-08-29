export declare class EmployeeResponseDto {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
    department?: string;
    position?: string;
    hireDate?: Date;
    createdAt: Date;
}
export declare class EmployeeListResponseDto {
    employees: EmployeeResponseDto[];
    total: number;
    page: number;
    limit: number;
}
