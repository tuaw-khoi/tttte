"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDto = exports.UserListResponseDto = exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    username;
    email;
    role;
    createdAt;
}
exports.UserResponseDto = UserResponseDto;
class UserListResponseDto {
    users;
    total;
    page;
    limit;
}
exports.UserListResponseDto = UserListResponseDto;
class LoginResponseDto {
    user;
    token;
}
exports.LoginResponseDto = LoginResponseDto;
//# sourceMappingURL=user-response.dto.js.map