@echo off
echo 🚀 Starting Employee Management System (Local Mode)...
echo.

echo 📦 Starting Backend (NestJS)...
start "Backend" cmd /k "cd manager-employee-be && npm run start:dev"

echo ⏳ Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo 🐍 Starting Face Recognition Service (Python)...
start "Face Recognition" cmd /k "cd face_attendance && python src/api-clean.py"

echo ⏳ Waiting for face recognition service to start...
timeout /t 10 /nobreak >nul

echo ⚛️ Starting Frontend (React)...
start "Frontend" cmd /k "cd manager-employee-fe && npm start"

echo.
echo ✅ All services are starting up!
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3001
echo    Backend API: http://localhost:3000
echo    Face Recognition: http://localhost:5000
echo.
echo 📝 Make sure you have:
echo    1. PostgreSQL running on port 5432
echo    2. Created database 'employee_db'
echo    3. Set up .env file in manager-employee-be/
echo.
echo 🎉 System is ready!
pause 