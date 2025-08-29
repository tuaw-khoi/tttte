<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Manager Employee Backend API

A NestJS-based REST API for managing employees, face recognition, and attendance tracking.

## Features

- **User Management**: Admin user authentication and authorization
- **Employee Management**: CRUD operations for employee records
- **Face Recognition**: Store and manage face encodings for employees
- **Attendance Tracking**: Record and manage employee attendance
- **Statistics**: Get attendance statistics and reports

## Database Schema

The application uses PostgreSQL with Prisma ORM and includes the following models:

- **User**: Admin users with authentication
- **Employee**: Employee information and details
- **FaceEncoding**: Face recognition data for employees
- **Attendance**: Employee attendance records

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Create .env file
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Authentication

#### POST /users/login

Login with username and password

```json
{
  "username": "admin",
  "password": "password123"
}
```

#### POST /users

Create a new admin user

```json
{
  "username": "admin",
  "password": "password123",
  "email": "admin@example.com",
  "role": "admin"
}
```

### Employee Management

#### GET /employees

Get all employees with pagination and search

```
GET /employees?page=1&limit=10&search=john
```

#### POST /employees

Create a new employee

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "department": "Engineering",
  "position": "Software Engineer",
  "hireDate": "2024-01-15"
}
```

#### GET /employees/:id

Get employee by ID

#### PATCH /employees/:id

Update employee information

#### DELETE /employees/:id

Delete employee

### Face Recognition

#### POST /face-encodings

Create face encoding for an employee

```json
{
  "encoding": "base64-encoded-face-data",
  "employeeId": "employee-uuid"
}
```

#### GET /face-encodings

Get all face encodings with pagination

```
GET /face-encodings?page=1&limit=10&employeeId=uuid
```

#### GET /face-encodings/employee/:employeeId

Get face encodings for specific employee

#### PATCH /face-encodings/:id

Update face encoding

#### DELETE /face-encodings/:id

Delete face encoding

### Attendance Management

#### POST /attendances

Record attendance for an employee

```json
{
  "employeeId": "employee-uuid",
  "checkIn": "2024-01-15T09:00:00Z"
}
```

#### GET /attendances

Get all attendance records with filtering

```
GET /attendances?page=1&limit=10&employeeId=uuid&date=2024-01-15
```

#### GET /attendances/stats

Get attendance statistics

```json
{
  "totalAttendances": 150,
  "todayAttendances": 25,
  "thisWeekAttendances": 120,
  "thisMonthAttendances": 450
}
```

#### GET /attendances/employee/:employeeId

Get attendance records for specific employee

#### GET /attendances/date/:date

Get attendance records for specific date

#### PATCH /attendances/:id

Update attendance record

#### DELETE /attendances/:id

Delete attendance record

## Data Models

### User

```typescript
{
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: string;
  createdAt: Date;
}
```

### Employee

```typescript
{
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  createdAt: Date;
}
```

### FaceEncoding

```typescript
{
  id: string;
  encoding: Buffer;
  createdAt: Date;
  employeeId: string;
}
```

### Attendance

```typescript
{
  id: string;
  checkIn: Date;
  createdAt: Date;
  employeeId: string;
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Development

### Running Tests

```bash
npm run test
npm run test:e2e
```

### Code Formatting

```bash
npm run format
npm run lint
```

### Building for Production

```bash
npm run build
npm run start:prod
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 3000)

## Dependencies

### Production

- `@nestjs/common`: NestJS framework
- `@nestjs/core`: Core NestJS functionality
- `@nestjs/platform-express`: Express platform
- `@prisma/client`: Prisma ORM client
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token handling
- `class-validator`: Input validation
- `class-transformer`: Data transformation

### Development

- `@nestjs/cli`: NestJS CLI tools
- `@types/bcrypt`: TypeScript types for bcrypt
- `@types/jsonwebtoken`: TypeScript types for jsonwebtoken
- `prisma`: Prisma CLI and tools
