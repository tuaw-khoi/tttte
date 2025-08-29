export class EmployeeEntity {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  createdAt: Date;
} 