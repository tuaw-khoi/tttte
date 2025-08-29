# Employee Management System with Face Recognition

A complete full-stack application for managing employees, tracking attendance, and performing face recognition-based check-ins. Built with modern technologies and best practices.

## 🏗️ Architecture

The system consists of three main components:

1. **Frontend (React + TypeScript)** - Modern web interface with Tailwind CSS
2. **Backend (NestJS + PostgreSQL)** - RESTful API with Prisma ORM
3. **Face Recognition Service (Python + Flask)** - AI-powered face recognition

## 🚀 Features

### Core Functionality

- **Employee Management**: CRUD operations for employee records
- **Attendance Tracking**: Monitor check-ins and check-outs
- **Face Recognition**: Register and recognize employee faces
- **Real-time Camera**: Webcam integration for face captures
- **Authentication**: JWT-based user authentication
- **Responsive Design**: Mobile-first approach

### Advanced Features

- **Video-based Registration**: Multi-frame face registration for accuracy
- **Quality Assessment**: Automatic face quality scoring
- **Backend Sync**: Automatic synchronization between services
- **Statistics Dashboard**: Comprehensive attendance analytics
- **Search & Filtering**: Advanced data querying capabilities

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router DOM** for routing
- **React Query** for server state
- **Axios** for HTTP requests
- **Lucide React** for icons

### Backend

- **NestJS** framework
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **Class-validator** for validation
- **bcrypt** for password hashing

### Face Recognition Service

- **Python 3.8+**
- **Flask** web framework
- **OpenCV** for image processing
- **face_recognition** library
- **NumPy** for numerical operations
- **scikit-learn** for ML utilities

## 📋 Prerequisites

- **Node.js 16+** and npm
- **Python 3.8+** and pip
- **PostgreSQL 12+**
- **Modern web browser** with camera access

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd thuctapthucte
```

### 2. Backend Setup

```bash
cd manager-employee-be

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start the backend
npm run start:dev
```

### 3. Face Recognition Service Setup

```bash
cd face_attendance

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python src/api.py
```

### 4. Frontend Setup

```bash
cd manager-employee-fe

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:3000" > .env

# Start the frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000
- **Face Recognition**: http://localhost:5000

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/employee_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3000
```

#### Face Recognition Service

```env
NESTJS_BASE_URL=http://localhost:3000
FLASK_ENV=development
FLASK_DEBUG=1
```

## 📁 Project Structure

```
thuctapthucte/
├── manager-employee-be/          # NestJS Backend
│   ├── src/
│   │   ├── employees/           # Employee management
│   │   ├── attendances/         # Attendance tracking
│   │   ├── face-encodings/      # Face data management
│   │   ├── users/               # Authentication
│   │   └── prisma/              # Database layer
│   └── prisma/
│       └── schema.prisma        # Database schema
├── manager-employee-fe/          # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── store/               # State management
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Utility functions
│   └── public/                  # Static assets
└── face_attendance/             # Python Face Recognition
    ├── src/
    │   ├── api.py               # Flask API endpoints
    │   ├── recognition.py       # Face recognition logic
    │   ├── encoding.py          # Face encoding utilities
    │   ├── register.py          # Registration functions
    │   ├── advanced_recognition.py  # Advanced recognition
    │   └── video_registration.py    # Video processing
    ├── embeddings/              # Face encodings storage
    └── metadata/                # Face metadata storage
```

## 🔐 Authentication

The system uses JWT tokens for authentication:

1. **Login**: POST `/users/login` with username/password
2. **Token Storage**: JWT stored in Zustand store
3. **Auto-injection**: Token automatically added to API requests
4. **Route Protection**: Protected routes redirect to login
5. **Token Refresh**: Automatic logout on 401 responses

## 📱 API Endpoints

### Authentication

- `POST /users/login` - User login
- `POST /users` - User registration

### Employees

- `GET /employees` - List employees (with pagination)
- `POST /employees` - Create employee
- `GET /employees/:id` - Get employee details
- `PATCH /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Attendance

- `GET /attendances` - List attendance records
- `POST /attendances` - Create attendance record
- `GET /attendances/stats` - Get attendance statistics
- `GET /attendances/employee/:id` - Get employee attendance

### Face Recognition

- `POST /register/video` - Register face from video
- `POST /recognize` - Recognize faces in image
- `POST /attendance/check-in` - Check-in with face
- `GET /stats` - Get recognition statistics

## 🎯 Usage Examples

### Register Employee Face

1. Navigate to Employees page
2. Click camera icon on employee row
3. Start camera and record face
4. Click "Register Face" button
5. Face data is saved and synced to backend

### Check-in with Face Recognition

1. Go to Face Recognition page
2. Start camera
3. Record face data
4. Click "Check In" button
5. System recognizes employee and creates attendance record

### Manual Attendance

1. Navigate to Attendance page
2. Use quick check-in buttons
3. Or filter by date/employee
4. View detailed attendance records

## 🧪 Testing

### Backend Tests

```bash
cd manager-employee-be
npm run test
npm run test:e2e
```

### Frontend Tests

```bash
cd manager-employee-fe
npm test
```

### Face Recognition Tests

```bash
cd face_attendance
python -m pytest tests/
```

## 🚀 Local Development

### Starting All Services

#### Option 1: Manual Start

```bash
# Terminal 1 - Backend
cd manager-employee-be
npm run start:dev

# Terminal 2 - Face Recognition
cd face_attendance
python src/api.py

# Terminal 3 - Frontend
cd manager-employee-fe
npm start
```

#### Option 2: Using Scripts

```bash
# Windows
start-local.bat

# Linux/Mac
chmod +x start-local.sh
./start-local.sh
```

### Development Workflow

1. **Backend**: Hot reload with `npm run start:dev`
2. **Frontend**: Hot reload with `npm start`
3. **Face Recognition**: Restart Python service when needed
4. **Database**: Use Prisma Studio for database management

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt
- **Input Validation** with class-validator
- **CORS Protection** for cross-origin requests
- **SQL Injection Prevention** with Prisma ORM
- **Face Data Encryption** for sensitive biometric data

## 📊 Performance

- **Lazy Loading** for large datasets
- **Pagination** for efficient data retrieval
- **Optimized Queries** with Prisma
- **Image Compression** for face recognition
- **Caching** with React Query
- **Responsive Design** for all devices

## 🐛 Troubleshooting

### Common Issues

1. **Camera Access Denied**

   - Check browser permissions
   - Ensure HTTPS in production

2. **Face Recognition Fails**

   - Verify Python dependencies
   - Check face_recognition library installation
   - Ensure sufficient lighting

3. **Database Connection Issues**

   - Verify PostgreSQL is running
   - Check connection string in .env
   - Run migrations if needed

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript compilation
   - Verify all dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- **Real-time Notifications** for attendance events
- **Advanced Analytics** with charts and reports
- **Mobile App** for iOS/Android
- **Biometric Security** enhancements
- **Integration APIs** for third-party systems
- **Machine Learning** improvements for recognition accuracy

---

**Happy Coding! 🎉**
