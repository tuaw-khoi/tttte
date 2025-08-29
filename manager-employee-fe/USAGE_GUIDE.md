# 📖 Hướng dẫn sử dụng hệ thống điểm danh tự động

## 🎯 **Tổng quan hệ thống**

Hệ thống điểm danh tự động sử dụng nhận diện khuôn mặt để:

- **Check-in**: Điểm danh khi bắt đầu làm việc
- **Check-out**: Kết thúc ngày làm việc
- **Quản lý**: Theo dõi và quản lý điểm danh

## 🚀 **Cách sử dụng**

### **1. Điểm danh (Check-in) - `/checkin`**

#### **Bước 1: Truy cập trang**

- Vào đường link: `/checkin`
- Hoặc click "Điểm danh công khai" trong sidebar

#### **Bước 2: Sử dụng**

- **Camera tự động khởi động** khi vào trang
- **Đưa mặt vào khung camera**
- **Giữ nguyên tư thế** trong 2-3 giây
- **Hệ thống tự động quét** và điểm danh
- **Không cần thao tác gì thêm!**

#### **Bước 3: Kết quả**

- ✅ **Thành công**: Hiển thị thông tin nhân viên và thời gian
- ❌ **Thất bại**: Hiển thị lỗi và tự động reset sau 3 giây

---

### **2. Kết thúc làm việc (Check-out) - `/checkout`**

#### **Bước 1: Truy cập trang**

- Vào đường link: `/checkout`
- Hoặc click "Check-out công khai" trong sidebar

#### **Bước 2: Sử dụng**

- **Camera tự động khởi động** khi vào trang
- **Đưa mặt vào khung camera**
- **Giữ nguyên tư thế** trong 2-3 giây
- **Hệ thống tự động quét** và check-out
- **Không cần thao tác gì thêm!**

#### **Bước 3: Kết quả**

- ✅ **Thành công**: Hiển thị thông tin check-out và giờ làm việc
- ❌ **Thất bại**: Hiển thị lỗi và tự động reset sau 3 giây

---

### **3. Quản lý điểm danh (Admin) - `/admin/attendance`**

#### **Bước 1: Đăng nhập**

- Vào `/login` và đăng nhập với tài khoản admin

#### **Bước 2: Điểm danh thủ công**

- Click "Điểm danh thủ công"
- Chọn nhân viên từ danh sách
- Nhập thời gian check-in/check-out
- Thêm ghi chú (tùy chọn)
- Click "Ghi nhận điểm danh"

#### **Bước 3: Quản lý**

- Xem thống kê tổng quan
- Lọc theo nhân viên, ngày, trạng thái
- Check-out cho nhân viên đang làm việc
- Xóa hồ sơ điểm danh

---

## 🔧 **Troubleshooting**

### **Camera không hoạt động**

- Kiểm tra quyền truy cập camera
- Refresh trang và thử lại
- Đảm bảo trình duyệt hỗ trợ WebRTC

### **Không nhận diện được khuôn mặt**

- Đảm bảo ánh sáng đủ sáng
- Nhìn thẳng vào camera
- Giữ nguyên tư thế trong 2-3 giây
- Kiểm tra xem đã đăng ký khuôn mặt chưa

### **Lỗi điểm danh**

- Kiểm tra kết nối internet
- Đảm bảo backend đang hoạt động
- Thử lại sau vài giây

---

## 📱 **Tính năng nâng cao**

### **Auto-scanning**

- Hệ thống tự động quét mỗi 2 giây
- Không cần thao tác thủ công
- Tự động reset sau khi hoàn thành

### **Real-time status**

- Hiển thị trạng thái camera
- Phát hiện khuôn mặt real-time
- Trạng thái quét với animation

### **Responsive design**

- Hoạt động tốt trên mọi thiết bị
- Mobile-friendly
- Touch-friendly controls

---

## 🎨 **Giao diện**

### **Trang chủ (`/`)**

- Link đến Check-in và Check-out
- Hướng dẫn sử dụng
- Thông tin hệ thống

### **Trang Check-in (`/checkin`)**

- Camera tự động
- Trạng thái quét real-time
- Kết quả điểm danh

### **Trang Check-out (`/checkout`)**

- Camera tự động
- Trạng thái quét real-time
- Kết quả check-out

### **Trang Admin (`/admin/*`)**

- Dashboard tổng quan
- Quản lý nhân viên
- Quản lý điểm danh
- Đăng ký khuôn mặt

---

## 🚨 **Lưu ý quan trọng**

1. **Không cần đăng nhập** để sử dụng Check-in/Check-out
2. **Camera tự động khởi động** khi vào trang
3. **Hệ thống tự động quét** khuôn mặt
4. **Không cần thao tác gì thêm** - chỉ cần đưa mặt vào camera
5. **Tự động reset** sau khi hoàn thành
6. **Error handling** tự động

---

## 📞 **Hỗ trợ**

Nếu gặp vấn đề:

1. Kiểm tra console browser để xem lỗi
2. Refresh trang và thử lại
3. Kiểm tra kết nối internet
4. Liên hệ admin để được hỗ trợ

---

**🎉 Chúc bạn sử dụng hệ thống hiệu quả!**
