import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils";
import { useAuthStore } from "../../store/authStore";
import {
  UsersIcon,
  UserGroupIcon,
  ClockIcon,
  CameraIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: "Bảng điều khiển",
    href: "/admin/dashboard",
    icon: UsersIcon,
  },
  {
    title: "Nhân viên",
    href: "/admin/employees",
    icon: UserGroupIcon,
  },
  {
    title: "Chấm công",
    href: "/admin/attendance",
    icon: ClockIcon,
  },
  {
    title: "Đăng ký khuôn mặt",
    href: "/admin/face-recognition",
    icon: CameraIcon,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <h1 className="text-xl font-bold text-primary">
              Quản lý nhân viên
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Public Check-in Link */}
          <div className="px-3 py-2">
            <Link
              to="/checkin"
              target="_blank"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-green-100 text-green-700 hover:bg-green-200"
            >
              <ClockIcon className="mr-3 h-5 w-4" />
              Điểm danh công khai
              <ArrowTopRightOnSquareIcon className="ml-auto h-4 w-4" />
            </Link>
            <Link
              to="/checkout"
              target="_blank"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 mt-2"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-4" />
              Check-out công khai
              <ArrowTopRightOnSquareIcon className="ml-auto h-4 w-4" />
            </Link>
          </div>

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
