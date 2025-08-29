import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string; // If not provided, will use current time

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 