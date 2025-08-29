import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Bảng điều khiển";
      case "/admin/employees":
        return "Nhân viên";
      case "/admin/attendance":
        return "Chấm công";
      case "/admin/face-recognition":
        return "Đăng ký khuôn mặt";
      default:
        return "Bảng điều khiển";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="lg:pl-64">
        <Header onMenuToggle={toggleSidebar} title={getPageTitle()} />

        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
