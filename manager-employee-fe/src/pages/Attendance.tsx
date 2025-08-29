import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";
import { Employee, AttendanceStats } from "../types";

import type { Attendance as AttendanceType } from "../types";
import { formatDate, formatTime, formatDateTime } from "../utils";

const Attendance: React.FC = () => {
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual check-in form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    employeeId: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkInTime: new Date().toTimeString().slice(0, 5),
    checkOutDate: new Date().toISOString().split("T")[0],
    checkOutTime: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedDate, selectedEmployee, selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attendancesData, employeesData, statsData] = await Promise.all([
        apiService.getAttendances(
          currentPage,
          10,
          selectedEmployee,
          selectedDate
        ),
        apiService.getEmployees(1, 100),
        apiService.getAttendanceStats(),
      ]);

      let filteredAttendances = attendancesData.attendances || [];

      // Filter by status if selected
      if (selectedStatus) {
        filteredAttendances = filteredAttendances.filter((attendance) => {
          if (selectedStatus === "active") return !attendance.checkOut;
          if (selectedStatus === "completed") return attendance.checkOut;
          if (selectedStatus === "overtime") {
            if (!attendance.checkOut) return false;
            const hours =
              (new Date(attendance.checkOut).getTime() -
                new Date(attendance.checkIn).getTime()) /
              (1000 * 60 * 60);
            return hours >= 8;
          }
          if (selectedStatus === "undertime") {
            if (!attendance.checkOut) return false;
            const hours =
              (new Date(attendance.checkOut).getTime() -
                new Date(attendance.checkIn).getTime()) /
              (1000 * 60 * 60);
            return hours < 8;
          }
          return true;
        });
      }

      // Filter by search term if provided
      if (searchTerm) {
        filteredAttendances = filteredAttendances.filter((attendance) => {
          const employeeName = getEmployeeName(
            attendance.employeeId
          ).toLowerCase();
          const employeePosition = (
            getEmployeePosition(attendance.employeeId) || ""
          ).toLowerCase();
          const notes = (attendance.notes || "").toLowerCase();
          const searchLower = searchTerm.toLowerCase();

          return (
            employeeName.includes(searchLower) ||
            employeePosition.includes(searchLower) ||
            notes.includes(searchLower)
          );
        });
      }

      setAttendances(filteredAttendances);
      setEmployees(employeesData.employees || []);
      setStats(statsData);
      setTotalPages(Math.ceil((filteredAttendances.length || 0) / 10));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (employeeId: string) => {
    try {
      await apiService.createAttendance({
        employeeId,
        checkIn: new Date().toISOString(),
      });
      fetchData();
    } catch (error) {
      console.error("Error creating attendance:", error);
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    try {
      const result = await apiService.checkOut(attendanceId);

      // Show success message with details
      const workingHours = getWorkingHours(result.checkIn, result.checkOut);
      const employeeName = getEmployeeName(result.employeeId);

      setSuccessMessage(
        `${employeeName} đã check-out thành công! ${workingHours}`
      );
      setError(null);

      fetchData(); // Refresh data

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Check-out thất bại";
      setError(errorMessage);
      setSuccessMessage(null);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ điểm danh này?")) {
      try {
        await apiService.deleteAttendance(attendanceId);
        fetchData();
      } catch (error) {
        console.error("Error deleting attendance:", error);
      }
    }
  };

  const handleManualFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFormData.employeeId) return;

    // Validate time logic
    if (manualFormData.checkOutTime && manualFormData.checkInTime) {
      const checkInDateTime = new Date(
        `${manualFormData.checkInDate}T${manualFormData.checkInTime}`
      );
      const checkOutDateTime = new Date(
        `${manualFormData.checkOutDate}T${manualFormData.checkOutTime}`
      );

      if (checkOutDateTime <= checkInDateTime) {
        setError("Thời gian check-out phải sau thời gian check-in");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const checkInDateTime = new Date(
        `${manualFormData.checkInDate}T${manualFormData.checkInTime}`
      ).toISOString();

      const attendanceData: any = {
        employeeId: manualFormData.employeeId,
        checkIn: checkInDateTime,
        notes: manualFormData.notes,
      };

      // Add check-out if provided
      if (manualFormData.checkOutTime) {
        const checkOutDateTime = new Date(
          `${manualFormData.checkOutDate}T${manualFormData.checkOutTime}`
        ).toISOString();
        attendanceData.checkOut = checkOutDateTime;
      }

      await apiService.createAttendance(attendanceData);

      // Reset form and close
      setManualFormData({
        employeeId: "",
        checkInDate: new Date().toISOString().split("T")[0],
        checkInTime: new Date().toTimeString().slice(0, 5),
        checkOutDate: new Date().toISOString().split("T")[0],
        checkOutTime: "",
        notes: "",
      });
      setShowManualForm(false);
      fetchData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Điểm danh thất bại";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetManualForm = () => {
    setManualFormData({
      employeeId: "",
      checkInDate: new Date().toISOString().split("T")[0],
      checkInTime: new Date().toTimeString().slice(0, 5),
      checkOutDate: new Date().toISOString().split("T")[0],
      checkOutTime: "",
      notes: "",
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.fullName : "Nhân viên không xác định";
  };

  const getEmployeePosition = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.position : "";
  };

  const getWorkingHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return "Chưa check-out";

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0) return "Thời gian không hợp lệ";

    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (attendance: AttendanceType) => {
    if (!attendance.checkOut) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-3 h-3 mr-1" />
          Đang làm việc
        </span>
      );
    }

    const checkIn = new Date(attendance.checkIn);
    const checkOut = new Date(attendance.checkOut);
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    if (hours >= 8) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Đủ giờ
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Thiếu giờ
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chấm công</h1>
          <p className="text-muted-foreground">
            Theo dõi điểm danh của nhân viên và quản lý hồ sơ chấm công
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowManualForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Điểm danh thủ công
          </Button>
          <Button variant="outline" disabled>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Xuất báo cáo (Tạm thời)
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng chấm công
            </CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tất cả hồ sơ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">Điểm danh hôm nay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.thisWeekAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tổng hàng tuần</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.thisMonthAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tổng hàng tháng</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tình trạng hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đang làm việc:
              </span>
              <span className="font-medium text-yellow-600">
                {stats?.activeAttendances || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đã hoàn thành:
              </span>
              <span className="font-medium text-green-600">
                {stats?.completedAttendances || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tổng cộng:</span>
              <span className="font-medium text-blue-600">
                {stats?.todayAttendances || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê giờ làm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Đủ giờ (≥8h):
              </span>
              <span className="font-medium text-green-600">
                {
                  attendances.filter((a) => {
                    if (!a.checkOut) return false;
                    const hours =
                      (new Date(a.checkOut).getTime() -
                        new Date(a.checkIn).getTime()) /
                      (1000 * 60 * 60);
                    return hours >= 8;
                  }).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Thiếu giờ (&lt;8h):
              </span>
              <span className="font-medium text-red-600">
                {
                  attendances.filter((a) => {
                    if (!a.checkOut) return false;
                    const hours =
                      (new Date(a.checkOut).getTime() -
                        new Date(a.checkIn).getTime()) /
                      (1000 * 60 * 60);
                    return hours < 8;
                  }).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Chưa check-out:
              </span>
              <span className="font-medium text-yellow-600">
                {stats?.activeAttendances || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {employees.slice(0, 3).map((employee) => {
              const employeeAttendances = attendances.filter(
                (a) => a.employeeId === employee.id
              );
              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{employee.fullName}</span>
                  <span className="font-medium text-blue-600">
                    {employeeAttendances.length}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5" />
            Tìm kiếm & Lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSelectedDate(e.target.value)
              }
              leftIcon={<CalendarIcon className="h-4 w-4" />}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Tất cả nhân viên</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang làm việc</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="overtime">Đủ giờ</option>
              <option value="undertime">Thiếu giờ</option>
            </select>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setSelectedEmployee("");
                setSelectedStatus("");
              }}
              className="px-6"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Điểm danh nhanh</CardTitle>
          <CardDescription>
            Ghi lại chấm công thủ công cho nhân viên thường xuyên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.slice(0, 6).map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.position}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleManualCheckIn(employee.id)}
                >
                  Điểm danh
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Check-in Form Modal */}
      {showManualForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <PlusIcon className="h-5 w-5" />
              Điểm danh thủ công
            </CardTitle>
            <CardDescription>
              Ghi lại chấm công với thông tin chi tiết
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleManualFormSubmit} className="space-y-6">
              {/* Employee Selection - Most Important */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Chọn nhân viên *
                </label>
                <select
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  value={manualFormData.employeeId}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      employeeId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName} -{" "}
                      {employee.position || "Chưa có chức vụ"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Inputs - Simplified */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Thời gian check-in *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={manualFormData.checkInDate}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          checkInDate: e.target.value,
                        })
                      }
                      required
                      className="h-12 text-base"
                    />
                    <Input
                      type="time"
                      value={manualFormData.checkInTime}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          checkInTime: e.target.value,
                        })
                      }
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Thời gian check-out (tùy chọn)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={manualFormData.checkOutDate}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          checkOutDate: e.target.value,
                        })
                      }
                      className="h-12 text-base"
                    />
                    <Input
                      type="time"
                      value={manualFormData.checkOutTime}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          checkOutTime: e.target.value,
                        })
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  placeholder="Ghi chú về lần điểm danh này..."
                  value={manualFormData.notes}
                  onChange={(e) =>
                    setManualFormData({
                      ...manualFormData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full h-20 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !manualFormData.employeeId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                  )}
                  Ghi nhận điểm danh
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetManualForm}
                  className="h-12 px-6"
                >
                  Đặt lại
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowManualForm(false)}
                  className="h-12 px-6"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hồ sơ chấm công</span>
            <span className="text-sm font-normal text-gray-500">
              Tìm thấy {attendances.length} hồ sơ
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có hồ sơ nào
              </h3>
              <p className="text-gray-500">
                Hãy thử thay đổi bộ lọc hoặc tạo điểm danh mới
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        {getEmployeeName(attendance.employeeId)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getEmployeePosition(attendance.employeeId) ||
                          "Chưa có chức vụ"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Check-in: {formatTime(attendance.checkIn)}</span>
                        {attendance.checkOut && (
                          <span>
                            Check-out: {formatTime(attendance.checkOut)}
                          </span>
                        )}
                        <span>{formatDate(attendance.createdAt)}</span>
                      </div>
                      {attendance.notes && (
                        <p className="text-xs text-gray-600 italic">
                          📝 {attendance.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    {getStatusBadge(attendance)}
                    <div className="text-sm font-medium text-gray-700">
                      {getWorkingHours(attendance.checkIn, attendance.checkOut)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!attendance.checkOut && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckOut(attendance.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Check-out
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAttendance(attendance.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} của {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Tiếp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="h-6 w-6" />
              Có lỗi xảy ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="outline"
              className="mt-4"
            >
              Đóng
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50 mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircleIcon className="h-6 w-6" />
              Thành công!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">{successMessage}</p>
            <Button
              onClick={() => setSuccessMessage(null)}
              variant="outline"
              className="mt-4"
            >
              Đóng
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
