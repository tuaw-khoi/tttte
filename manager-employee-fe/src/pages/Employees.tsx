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
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from "../types";
import { formatDate } from "../utils";

interface EmployeeFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  position: string;
  hireDate: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
    hireDate: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployees(
        currentPage,
        10,
        searchTerm
      );
      setEmployees(response.employees || []);
      setTotalPages(Math.ceil((response.total || 0) / 10));
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await apiService.updateEmployee(editingEmployee.id, formData);
      } else {
        await apiService.createEmployee(formData);
      }

      setShowForm(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee.fullName,
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      department: employee.department || "",
      position: employee.position || "",
      hireDate: employee.hireDate || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await apiService.deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      department: "",
      position: "",
      hireDate: "",
    });
  };

  const openNewForm = () => {
    setEditingEmployee(null);
    resetForm();
    setShowForm(true);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhân viên</h1>
          <p className="text-muted-foreground">
            Quản lý cơ sở dữ liệu nhân viên và dữ liệu nhận diện khuôn mặt
          </p>
        </div>
        <Button onClick={openNewForm}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </CardTitle>
            <CardDescription>
              {editingEmployee
                ? "Cập nhật thông tin nhân viên"
                : "Nhập thông tin nhân viên để thêm vào hệ thống"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Input
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
                <Input
                  label="Phòng ban"
                  name="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
                <Input
                  label="Chức vụ"
                  name="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
                <Input
                  label="Ngày thuê"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) =>
                    setFormData({ ...formData, hireDate: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingEmployee ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>
            Tìm thấy {employees.length} nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{employee.fullName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.position || "Không có chức vụ"} •{" "}
                      {employee.department || "Không có phòng ban"}
                    </p>
                    {employee.email && (
                      <p className="text-sm text-muted-foreground">
                        {employee.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(employee.createdAt)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(employee)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/face-recognition?employee=${employee.id}`,
                        "_blank"
                      )
                    }
                  >
                    <CameraIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
              <span className="text-sm">
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
    </div>
  );
};

export default Employees;
