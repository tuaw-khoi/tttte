# Hệ thống quản lý nhân viên với nhận diện khuôn mặt - Phiên bản Demo

## Tổng quan

Đây là phiên bản demo của hệ thống quản lý nhân viên với tính năng nhận diện khuôn mặt và điểm danh tự động. Hệ thống được thiết kế để demo cho các công ty quan tâm đến giải pháp quản lý nhân viên hiện đại.

## Tính năng chính

### 🔐 **Xác thực và phân quyền**

- Đăng nhập/đăng xuất với JWT
- Phân quyền admin và nhân viên
- Bảo mật API endpointssssss

### 👥 **Quản lý nhân viên**

- Thêm, sửa, xóa thông tin nhân viên
- Tìm kiếm và lọc nhân viên
- Phân trang danh sách nhân viên

### 📸 **Nhận diện khuôn mặt**

- Đăng ký khuôn mặt cho nhân viên
- Xử lý ảnh và trích xuất đặc trưng
- Lưu trữ mã hóa khuôn mặt an toàn

### ⏰ **Hệ thống điểm danh hoàn chỉnh**

#### **Điểm danh tự động (Công khai)**

- Trang điểm danh không cần đăng nhập (`/checkin`)
- Sử dụng camera để nhận diện khuôn mặt
- Tự động ghi nhận thời gian check-in
- Hiển thị thông tin nhân viên và độ tin cậy

#### **Điểm danh thủ công (Admin)**

- Form điểm danh chi tiết với validation
- Chọn nhân viên từ danh sách
- Nhập thời gian check-in/check-out tùy chỉnh
- Thêm ghi chú cho mỗi lần điểm danh
- Quản lý check-out cho nhân viên đang làm việc

#### **Quản lý và báo cáo**

- Thống kê chi tiết: tổng quan, hôm nay, tuần này, tháng này
- Phân tích trạng thái: đang làm việc, đã hoàn thành, đủ giờ, thiếu giờ
- Tìm kiếm và lọc nâng cao theo nhân viên, ngày, trạng thái
- Phân trang và sắp xếp dữ liệu
- Xuất báo cáo (sắp tới)

### 🎯 **Tính năng nâng cao**

- Validation thời gian check-in/check-out
- Tính toán giờ làm việc tự động
- Badge trạng thái màu sắc rõ ràng
- Responsive design cho mobile
- Error handling và loading states

## Cấu trúc dự án

```
manager-employee-fe/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Layout
│   │   └── ui/              # Button, Input, Card
│   ├── pages/
│   │   ├── Home.tsx         # Trang chủ công khai
│   │   ├── CheckIn.tsx      # Điểm danh tự động (công khai)
│   │   ├── Login.tsx        # Đăng nhập admin
│   │   ├── Dashboard.tsx    # Bảng điều khiển
│   │   ├── Employees.tsx    # Quản lý nhân viên
│   │   ├── Attendance.tsx   # Quản lý điểm danh (admin)
│   │   └── FaceRecognition.tsx # Đăng ký khuôn mặt
│   ├── services/
│   │   └── api.ts           # API service
│   ├── store/
│   │   └── authStore.ts     # Quản lý trạng thái đăng nhập
│   └── types/
│       └── index.ts         # TypeScript types
```

## Hướng dẫn sử dụng

### **Demo nhanh**

1. **Trang chủ** (`/`): Giao diện demo đơn giản
2. **Điểm danh** (`/checkin`): Test tính năng điểm danh tự động
3. **Đăng nhập** (`/login`): Truy cập quản trị với tài khoản demo
4. **Quản lý**: Thêm nhân viên, đăng ký khuôn mặt, xem báo cáo

### **1. Điểm danh tự động (Công khai)**

1. Truy cập `/checkin` (không cần đăng nhập)
2. Khởi động camera
3. Nhìn vào camera và bắt đầu ghi video
4. Hệ thống tự động nhận diện và điểm danh
5. Xem kết quả và thông tin nhận diện

### **2. Điểm danh thủ công (Admin)**

1. Đăng nhập vào hệ thống
2. Vào trang "Chấm công"
3. Click "Điểm danh thủ công"
4. Chọn nhân viên và nhập thông tin
5. Ghi nhận điểm danh

### **3. Quản lý điểm danh**

1. Xem thống kê tổng quan
2. Lọc theo nhân viên, ngày, trạng thái
3. Check-out cho nhân viên đang làm việc
4. Xem lịch sử điểm danh chi tiết

### **4. Đăng ký khuôn mặt**

1. Vào trang "Đăng ký khuôn mặt"
2. Chọn nhân viên
3. Ghi video khuôn mặt
4. Lưu vào hệ thống

## Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## API Endpoints

### **Điểm danh (Công khai)**

- `POST /checkin` - Điểm danh tự động

### **Điểm danh (Admin)**

- `GET /attendances` - Lấy danh sách điểm danh
- `POST /attendances` - Tạo điểm danh mới
- `PATCH /attendances/:id` - Cập nhật điểm danh
- `DELETE /attendances/:id` - Xóa điểm danh
- `GET /attendances/stats` - Thống kê điểm danh

### **Nhân viên**

- `GET /employees` - Lấy danh sách nhân viên
- `POST /employees` - Tạo nhân viên mới
- `PATCH /employees/:id` - Cập nhật nhân viên
- `DELETE /employees/:id` - Xóa nhân viên

### **Khuôn mặt**

- `GET /face-encodings` - Lấy danh sách mã hóa khuôn mặt
- `POST /face-encodings` - Tạo mã hóa khuôn mặt mới
- `DELETE /face-encodings/:id` - Xóa mã hóa khuôn mặt

## Lưu ý Demo

- **Dữ liệu**: Tất cả dữ liệu sẽ được reset định kỳ
- **Tài khoản**: Sử dụng tài khoản demo được cung cấp
- **Camera**: Cần cấp quyền truy cập camera để test
- **AI**: Sử dụng thuật toán cơ bản để demo tính năng

## Tính năng sắp tới

- [ ] Xuất báo cáo Excel/PDF
- [ ] Thông báo real-time
- [ ] Dashboard với biểu đồ
- [ ] Quản lý ca làm việc
- [ ] Tích hợp với hệ thống lương
- [ ] Mobile app

## Tài liệu Demo

Xem file `DEMO_GUIDE.md` để biết hướng dẫn chi tiết về cách sử dụng demo.

## Đóng góp

1. Fork dự án
2. Tạo feature branch
3. Commit thay đổi
4. Push lên branch
5. Tạo Pull Request

## Giấy phép

MIT License - xem file LICENSE để biết thêm chi tiết.
