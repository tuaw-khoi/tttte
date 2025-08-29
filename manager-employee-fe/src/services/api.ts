import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  LoginUserDto,
  LoginResponse,
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  FaceEncoding,
  CreateFaceEncodingDto,
  UpdateFaceEncodingDto,
  Attendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceStats,
  EmployeeListResponse,
  AttendanceListResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Request interceptor to add JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginUserDto): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/users/login', credentials);
    console.log('Login response:', response.data);
    return response.data;
  }

  async register(userData: CreateUserDto): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  // Employee endpoints
  async getEmployees(page: number = 1, limit: number = 10, search?: string): Promise<EmployeeListResponse> {
    const params = { page, limit, ...(search && { search }) };
    const response: AxiosResponse<EmployeeListResponse> = await this.api.get('/employees', { params });
    return response.data;
  }

  async getEmployee(id: string): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.api.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(employeeData: CreateEmployeeDto): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.api.post('/employees', employeeData);
    return response.data;
  }

  async updateEmployee(id: string, employeeData: UpdateEmployeeDto): Promise<Employee> {
    const response: AxiosResponse<Employee> = await this.api.patch(`/employees/${id}`, employeeData);
    return response.data;
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.api.delete(`/employees/${id}`);
  }

  // Attendance endpoints
  async getAttendances(page: number = 1, limit: number = 10, employeeId?: string, date?: string): Promise<AttendanceListResponse> {
    const params = { page, limit, ...(employeeId && { employeeId }), ...(date && { date }) };
    const response: AxiosResponse<AttendanceListResponse> = await this.api.get('/attendances', { params });
    return response.data;
  }

  async getAttendance(id: string): Promise<Attendance> {
    const response: AxiosResponse<Attendance> = await this.api.get(`/attendances/${id}`);
    return response.data;
  }

  async createAttendance(attendanceData: CreateAttendanceDto): Promise<Attendance> {
    const response: AxiosResponse<Attendance> = await this.api.post('/attendances', attendanceData);
    return response.data;
  }

  async updateAttendance(id: string, attendanceData: UpdateAttendanceDto): Promise<Attendance> {
    const response: AxiosResponse<Attendance> = await this.api.patch(`/attendances/${id}`, attendanceData);
    return response.data;
  }

  async checkOut(id: string, checkOutTime?: string): Promise<Attendance> {
    const response: AxiosResponse<Attendance> = await this.api.post(`/attendances/${id}/checkout`, { checkOutTime });
    return response.data;
  }

  async deleteAttendance(id: string): Promise<void> {
    await this.api.delete(`/attendances/${id}`);
  }

  async getAttendanceStats(): Promise<AttendanceStats> {
    const response: AxiosResponse<AttendanceStats> = await this.api.get('/attendances/stats');
    return response.data;
  }

  // Face Recognition Check-in (Public - No token required)
  async checkInWithFace(image: string, timestamp: string): Promise<any> {
    const response = await fetch(
      `${this.api.defaults.baseURL}/attendances/face-recognition-checkin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          timestamp,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Check-in failed");
    }

    return response.json();
  }

  // Face Recognition Only (Public - No token required, no attendance creation)
  async recognizeFaceOnly(image: string): Promise<any> {
    const response = await fetch(
      `${this.api.defaults.baseURL}/attendances/face-recognition-only`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Face recognition failed");
    }

    return response.json();
  }

  // Find active attendance for employee today (Public - No token required)
  async findActiveAttendanceToday(employeeId: string): Promise<any> {
    const response = await fetch(
      `${this.api.defaults.baseURL}/attendances/employee/${employeeId}/active-today`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to find active attendance");
    }

    return response.json();
  }

  // Checkout employee today (Public - No token required)
  async checkoutEmployeeToday(employeeId: string, checkOutTime?: string): Promise<any> {
    const response = await fetch(
      `${this.api.defaults.baseURL}/attendances/employee/${employeeId}/checkout-today`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkOutTime,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Check-out failed");
    }

    return response.json();
  }

  // Face Encoding endpoints
  async getFaceEncodings(page: number = 1, limit: number = 10, employeeId?: string): Promise<PaginatedResponse<FaceEncoding>> {
    const params = { page, limit, ...(employeeId && { employeeId }) };
    const response: AxiosResponse<PaginatedResponse<FaceEncoding>> = await this.api.get('/face-encodings', { params });
    return response.data;
  }

  async getFaceEncoding(id: string): Promise<FaceEncoding> {
    const response: AxiosResponse<FaceEncoding> = await this.api.get(`/face-encodings/${id}`);
    return response.data;
  }

  async createFaceEncoding(faceEncodingData: CreateFaceEncodingDto): Promise<FaceEncoding> {
    const response: AxiosResponse<FaceEncoding> = await this.api.post('/face-encodings', faceEncodingData);
    console.log('Face encoding created:', response.data);
    return response.data;
  }

  async updateFaceEncoding(id: string, faceEncodingData: UpdateFaceEncodingDto): Promise<FaceEncoding> {
    const response: AxiosResponse<FaceEncoding> = await this.api.patch(`/face-encodings/${id}`, faceEncodingData);
    return response.data;
  }

  async deleteFaceEncoding(id: string): Promise<void> {
    await this.api.delete(`/face-encodings/${id}`);
  }

  // User endpoints
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    const params = { page, limit, ...(search && { search }) };
    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }
}

export const apiService = new ApiService(); 