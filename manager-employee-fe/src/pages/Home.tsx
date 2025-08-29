import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  UsersIcon,
  CameraIcon,
  ClockIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <BuildingOfficeIcon className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ thống quản lý nhân viên
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống điểm danh tự động bằng nhận diện khuôn mặt
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Điểm danh</CardTitle>
              <CardDescription className="mb-4">
                Nhân viên có thể điểm danh tự động bằng camera
              </CardDescription>
              <Link to="/checkin">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  Điểm danh ngay
                </Button>
              </Link>
            </CardHeader>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Quản trị</CardTitle>
              <CardDescription className="mb-4">
                Quản lý nhân viên, xem báo cáo và cài đặt hệ thống
              </CardDescription>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ShieldCheckIcon className="mr-2 h-4 w-4" />
                  Đăng nhập quản trị
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Quản lý nhân viên</h3>
            <p className="text-sm text-gray-600">
              Thông tin cá nhân, phòng ban
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CameraIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Nhận diện khuôn mặt</h3>
            <p className="text-sm text-gray-600">
              AI tự động xác thực danh tính
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Báo cáo chấm công</h3>
            <p className="text-sm text-gray-600">Thống kê và xuất báo cáo</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">© 2024 Hệ thống quản lý nhân viên</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
