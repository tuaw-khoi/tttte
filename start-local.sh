#!/bin/bash

echo "🚀 Starting Employee Management System (Local Mode)..."
echo

echo "📦 Starting Backend (NestJS)..."
cd manager-employee-be
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 10

echo "🐍 Starting Face Recognition Service (Python)..."
cd face_attendance
python src/api.py &
FACE_PID=$!
cd ..

echo "⏳ Waiting for face recognition service to start..."
sleep 10

echo "⚛️ Starting Frontend (React)..."
cd manager-employee-fe
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "✅ All services are starting up!"
echo
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3000"
echo "   Face Recognition: http://localhost:5000"
echo
echo "📝 Make sure you have:"
echo "   1. PostgreSQL running on port 5432"
echo "   2. Created database 'employee_db'"
echo "   3. Set up .env file in manager-employee-be/"
echo
echo "🎉 System is ready!"
echo
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FACE_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

 