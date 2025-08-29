export class AttendanceEntity {
  id: string;
  checkIn: Date;
  checkOut?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  employeeId: string;
} 