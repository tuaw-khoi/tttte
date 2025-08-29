// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  role?: string;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  email?: string;
  role?: string;
}

export interface LoginUserDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Employee types
export interface Employee {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  hireDate?: string;
}

export interface UpdateEmployeeDto {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  hireDate?: string;
}

// Face Encoding types
export interface FaceEncoding {
  id: string;
  employeeId: string;
  encoding: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaceEncodingDto {
  employeeId: string;
  encoding: string;
}

export interface UpdateFaceEncodingDto {
  encoding?: string;
}

// Attendance types
export interface Attendance {
  id: string;
  employeeId: string;
  checkIn: string;
  checkOut?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
    department?: string;
  };
}

export interface CreateAttendanceDto {
  employeeId: string;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface UpdateAttendanceDto {
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Specific response types for backend compatibility
export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceListResponse {
  attendances: Attendance[];
  total: number;
  page: number;
  limit: number;
}

// Attendance Stats
export interface AttendanceStats {
  totalAttendances: number;
  todayAttendances: number;
  thisWeekAttendances: number;
  thisMonthAttendances: number;
  activeAttendances: number; // Số nhân viên đang làm việc
  completedAttendances: number; // Số nhân viên đã hoàn thành ngày làm việc
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
} 