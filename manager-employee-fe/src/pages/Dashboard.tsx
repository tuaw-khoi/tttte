import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  UsersIcon,
  UserGroupIcon,
  ClockIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";
import { AttendanceStats, Employee, Attendance } from "../types";
import { formatDate, formatTime } from "../utils";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, employeesData, attendancesData] = await Promise.all([
          apiService.getAttendanceStats(),
          apiService.getEmployees(1, 5),
          apiService.getAttendances(1, 5),
        ]);

        setStats(statsData);
        setRecentEmployees(employeesData.employees || []);
        setRecentAttendances(attendancesData.attendances || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Chào mừng! Đây là demo hệ thống quản lý nhân viên với nhận diện khuôn
          mặt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nhân viên
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              Nhân viên trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chấm công hôm nay
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Lần điểm danh hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng chấm công
            </CardTitle>
            <CameraIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng số lần điểm danh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.thisMonthAttendances || 0}
            </div>
            <p className="text-xs text-muted-foreground">Chấm công tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Nhân viên gần đây</CardTitle>
            <CardDescription>
              Những nhân viên mới nhất được thêm vào hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {employee.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {employee.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.position || "Chưa có chức vụ"} •{" "}
                        {employee.department || "Chưa có phòng ban"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(employee.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có nhân viên nào</p>
                  <p className="text-xs">
                    Vào mục "Nhân viên" để thêm nhân viên mới
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Chấm công gần đây</CardTitle>
            <CardDescription>Những lần điểm danh gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttendances.length > 0 ? (
                recentAttendances.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center space-x-4"
                  >
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {attendance.employee?.fullName ||
                          "Nhân viên không xác định"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Đã điểm danh lúc {formatTime(attendance.checkIn)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(attendance.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có lần chấm công nào</p>
                  <p className="text-xs">Vào trang chủ để test điểm danh</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
