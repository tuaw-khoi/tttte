# Hướng Dẫn Setup Local - Employee Management System

## 🚀 Khởi Động Nhanh

### 1. Cài Đặt Dependencies

#### Backend (NestJS)

```bash
cd manager-employee-be
npm install
```

#### Frontend (React)

```bash
cd manager-employee-fe
npm install
```

#### Face Recognition Service (Python)

```bash
cd face_attendance
pip install -r requirements.txt
```

### 2. Cài Đặt Database

#### PostgreSQL

1. Cài đặt PostgreSQL 12+ trên máy
2. Tạo database mới:

```sql
CREATE DATABASE employee_db;
```

#### Cấu Hình Backend

1. Copy file `env.example` thành `.env`:

```bash
cd manager-employee-be
copy env.example .env
```

2. Chỉnh sửa `.env` với thông tin database của bạn:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/employee_db"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

3. Chạy migrations:

```bash
npx prisma migrate dev
```

### 3. Khởi Động Hệ Thống

#### Cách 1: Sử Dụng Script (Khuyến Nghị)

**Windows:**

```bash
start-local.bat
```

**Linux/Mac:**

```bash
chmod +x start-local.sh
./start-local.sh
```

#### Cách 2: Khởi Động Thủ Công

**Terminal 1 - Backend:**

```bash
cd manager-employee-be
npm run start:dev
```

**Terminal 2 - Face Recognition:**

```bash
cd face_attendance
python src/api.py
```

**Terminal 3 - Frontend:**

```bash
cd manager-employee-fe
npm start
```

### 4. Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000
- **Face Recognition**: http://localhost:5000

## 🔧 Cấu Hình Chi Tiết

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/employee_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:3000
```

### Face Recognition Service

```env
NESTJS_BASE_URL=http://localhost:3000
FLASK_ENV=development
FLASK_DEBUG=1
```

## 📋 Kiểm Tra Hệ Thống

### 1. Kiểm Tra Backend

```bash
curl http://localhost:3000/health
```

### 2. Kiểm Tra Face Recognition

```bash
curl http://localhost:5000/health
```

### 3. Kiểm Tra Database

```bash
cd manager-employee-be
npx prisma studio
```

## 🐛 Xử Lý Sự Cố

### Backend Không Khởi Động

- Kiểm tra PostgreSQL có đang chạy không
- Kiểm tra thông tin database trong `.env`
- Chạy `npx prisma generate` nếu cần

### Face Recognition Lỗi

- Kiểm tra Python dependencies: `pip list`
- Kiểm tra camera permissions
- Kiểm tra port 5000 có bị chiếm không

### Frontend Không Load

- Kiểm tra backend có đang chạy không
- Kiểm tra `REACT_APP_API_URL` trong `.env`
- Xóa `node_modules` và chạy lại `npm install`

## 📱 Sử Dụng Hệ Thống

### 1. Tạo User Đầu Tiên

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### 2. Đăng Nhập

- Truy cập http://localhost:3000
- Đăng nhập với username/password vừa tạo

### 3. Quản Lý Employees

- Thêm employees mới
- Chỉnh sửa thông tin
- Xóa employees

### 4. Face Recognition

- Đăng ký khuôn mặt cho employees
- Check-in bằng nhận diện khuôn mặt
- Xem lịch sử attendance

## 🔒 Bảo Mật

- **JWT Secret**: Thay đổi `JWT_SECRET` trong production
- **Database**: Sử dụng strong password cho PostgreSQL
- **CORS**: Backend đã enable CORS cho development
- **HTTPS**: Sử dụng HTTPS trong production

## 📊 Monitoring

### Logs

- **Backend**: Xem logs trong terminal backend
- **Frontend**: Xem logs trong browser console
- **Face Recognition**: Xem logs trong terminal Python

### Performance

- Sử dụng Prisma Studio để monitor database
- Kiểm tra network requests trong browser DevTools
- Monitor memory usage của Python service

## 🚀 Local Development Tips

### Performance Optimization

- Sử dụng Prisma Studio để monitor database queries
- Kiểm tra network requests trong browser DevTools
- Monitor memory usage của Python service

### Debug Mode

- Backend: `npm run start:dev` với hot reload
- Frontend: `npm start` với hot reload
- Face Recognition: Restart service khi cần thiết

---

**Lưu ý**: Đây là hướng dẫn cho local development. Hệ thống được thiết kế để chạy trực tiếp trên máy local.
