export declare class UserResponseDto {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
}
export declare class UserListResponseDto {
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
}
export declare class LoginResponseDto {
    user: UserResponseDto;
    token: string;
}
