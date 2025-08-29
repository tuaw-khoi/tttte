export declare class CreateUserDto {
    username: string;
    password: string;
    email: string;
    role?: string;
}
export declare class UpdateUserDto {
    username?: string;
    password?: string;
    email?: string;
    role?: string;
}
export declare class LoginUserDto {
    username: string;
    password: string;
}
