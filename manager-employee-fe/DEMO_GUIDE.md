# Hướng dẫn Demo - Hệ thống quản lý nhân viên

## Tổng quan

Đây là phiên bản demoo của hệ thống quản lý nhân viên với tính năng nhận diện khuôn mặt và điểm danh tự động.

## Tính năng chính

### 1. Điểm danh tự động

- **Trang chủ** (`/`): Giao diện demo đơn giản với 2 nút chínhh
- **Điểm danh** (`/checkin`): Hệ thống tự động quét khuôn mặt và điểm danh
- **Check-out** (`/checkout`): Hệ thống tự động quét khuôn mặt và check-out

### 2. Quản trị hệ thốnggs

- **Đăng nhập** (`/login`): Sử dụng tài khoản demo để truy cập
- **Bảng điều khiển** (`/admin/dashboard`): Xem tổng quan hệ thống
- **Quản lý nhân viên** (`/admin/employees`): Thêm, sửa, xóa nhân viên
- **Chấm công** (`/admin/attendance`): Xem báo cáo và thống kê
- **Đăng ký khuôn mặt** (`/admin/face-recognition`): Đăng ký khuôn mặt cho nhân viên

## Quy trình demo

### Bước 1: Thêm nhân viên

1. Đăng nhập vào hệ thống
2. Vào mục "Nhân viên"
3. Click "Thêm nhân viên"
4. Điền thông tin cơ bản (tên, email, phòng ban, chức vụ)
5. Lưu thông tin

### Bước 2: Đăng ký khuôn mặt

1. Vào mục "Đăng ký khuôn mặt"
2. Chọn nhân viên từ danh sách
3. Khởi động camera
4. Ghi video khuôn mặt (5-10 giây)
5. Lưu khuôn mặt

### Bước 3: Test điểm danh

1. Vào trang chủ
2. Click "Điểm danh ngay"
3. Đưa mặt vào camera
4. Hệ thống tự động nhận diện và điểm danh

### Bước 4: Xem báo cáo

1. Vào mục "Chấm công"
2. Xem thống kê và báo cáo
3. Lọc theo ngày, nhân viên, trạng thái

## Lưu ý quan trọng

### Demo System

- **Dữ liệu**: Tất cả dữ liệu sẽ được reset định kỳ
- **Tài khoản**: Sử dụng tài khoản demo được cung cấp
- **Camera**: Cần cấp quyền truy cập camera để test

### Tính năng AI

- **Nhận diện khuôn mặt**: Sử dụng thuật toán cơ bản để demo
- **Độ chính xác**: Có thể thay đổi tùy thuộc vào điều kiện ánh sáng
- **Xử lý**: Tự động quét mỗi 2 giây khi có khuôn mặt

### Hỗ trợ kỹ thuật

- **Trình duyệt**: Chrome, Firefox, Safari (cần hỗ trợ WebRTC)
- **Camera**: Webcam tích hợp hoặc camera USB
- **Kết nối**: Cần kết nối internet ổn định

## Cấu trúc dữ liệu

### Nhân viên

- Họ và tên
- Email
- Số điện thoại
- Phòng ban
- Chức vụ
- Ngày thuê

### Chấm công

- Thời gian check-in
- Thời gian check-out
- Ghi chú
- Trạng thái

### Khuôn mặt

- ID nhân viên
- Dữ liệu encoding
- Độ tin cậy
- Ngày tạo

## API Endpoints

### Public

- `POST /api/attendance/checkin` - Điểm danh
- `POST /api/attendance/checkout` - Check-out
- `POST /api/face-recognition/recognize` - Nhận diện khuôn mặt

### Admin (cần đăng nhập)

- `GET /api/employees` - Lấy danh sách nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/:id` - Cập nhật nhân viên
- `DELETE /api/employees/:id` - Xóa nhân viên
- `GET /api/attendance` - Lấy danh sách chấm công
- `POST /api/face-encodings` - Đăng ký khuôn mặt

## Troubleshooting

### Camera không hoạt động

- Kiểm tra quyền truy cập camera
- Thử refresh trang
- Kiểm tra trình duyệt có hỗ trợ WebRTC

### Không nhận diện được khuôn mặt

- Đảm bảo ánh sáng đủ sáng
- Đưa mặt vào khung camera rõ ràng
- Kiểm tra đã đăng ký khuôn mặt chưa

### Lỗi đăng nhập

- Kiểm tra thông tin tài khoản
- Đảm bảo kết nối internet
- Thử refresh trang

## Liên hệ hỗ trợ

- **Email**: support@demo.com
- **Documentation**: Xem file README.md chính
- **Issues**: Báo cáo vấn đề qua email

---

_Phiên bản demo - Cập nhật lần cuối: 2024_
