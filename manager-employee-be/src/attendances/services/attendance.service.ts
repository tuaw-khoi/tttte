import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../http/dto/attendance.dto';
import { AttendanceResponseDto, AttendanceListResponseDto, AttendanceStatsDto } from '../http/responses/attendance-response.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    // Check if employee exists
    const employee = await this.prismaService.employee.findUnique({
      where: { id: createAttendanceDto.employeeId }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if employee already has attendance for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await this.prismaService.attendance.findFirst({
      where: {
        employeeId: createAttendanceDto.employeeId,
        checkIn: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingAttendance) {
      throw new ConflictException('Employee already has attendance for today');
    }

    // Validate check-out time if provided
    if (createAttendanceDto.checkOut) {
      const checkInTime = createAttendanceDto.checkIn ? new Date(createAttendanceDto.checkIn) : new Date();
      const checkOutTime = new Date(createAttendanceDto.checkOut);
      
      if (checkOutTime <= checkInTime) {
        throw new BadRequestException('Check-out time must be after check-in time');
      }
    }

    const attendance = await this.prismaService.attendance.create({
      data: {
        checkIn: createAttendanceDto.checkIn ? new Date(createAttendanceDto.checkIn) : new Date(),
        checkOut: createAttendanceDto.checkOut ? new Date(createAttendanceDto.checkOut) : null,
        notes: createAttendanceDto.notes || null,
        employeeId: createAttendanceDto.employeeId,
      }
    });

    return this.mapToResponse(attendance);
  }

  async findAll(page: number = 1, limit: number = 10, employeeId?: string, date?: string): Promise<AttendanceListResponseDto> {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      where.checkIn = {
        gte: startDate,
        lt: endDate
      };
    }

    const [attendances, total] = await Promise.all([
      this.prismaService.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { checkIn: 'desc' },
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              position: true,
              department: true
            }
          }
        }
      }),
      this.prismaService.attendance.count({ where })
    ]);

    return {
      attendances: attendances.map(attendance => this.mapToResponse(attendance)),
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<AttendanceResponseDto> {
    const attendance = await this.prismaService.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
            department: true
          }
        }
      }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    return this.mapToResponse(attendance);
  }

  async findByEmployeeId(employeeId: string, page: number = 1, limit: number = 10): Promise<AttendanceListResponseDto> {
    return this.findAll(page, limit, employeeId);
  }

  async findByDate(date: string, page: number = 1, limit: number = 10): Promise<AttendanceListResponseDto> {
    return this.findAll(page, limit, undefined, date);
  }

  async checkOut(id: string, checkOutTime?: string): Promise<AttendanceResponseDto> {
    // Check if attendance exists
    const existingAttendance = await this.prismaService.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true
          }
        }
      }
    });

    if (!existingAttendance) {
      throw new NotFoundException('Attendance not found');
    }

    // Check if already checked out
    if (existingAttendance.checkOut) {
      throw new ConflictException('Employee already checked out');
    }

    // Use provided time or current time
    const checkOutDateTime = checkOutTime ? new Date(checkOutTime) : new Date();
    
    // Validate check-out time
    if (checkOutDateTime <= existingAttendance.checkIn) {
      throw new BadRequestException('Check-out time must be after check-in time');
    }

    // Calculate working hours
    const workingHours = (checkOutDateTime.getTime() - existingAttendance.checkIn.getTime()) / (1000 * 60 * 60);
    
    // Determine status based on working hours
    let status = 'normal';
    let statusNote = '';
    
    if (workingHours < 8) {
      status = 'undertime';
      statusNote = `Thiếu ${(8 - workingHours).toFixed(1)} giờ`;
    } else if (workingHours >= 8 && workingHours <= 10) {
      status = 'normal';
      statusNote = 'Đủ giờ làm việc';
    } else {
      status = 'overtime';
      statusNote = `Làm thêm ${(workingHours - 8).toFixed(1)} giờ`;
    }

    // Update attendance with check-out
    const attendance = await this.prismaService.attendance.update({
      where: { id },
      data: {
        checkOut: checkOutDateTime,
        notes: existingAttendance.notes ? 
          `${existingAttendance.notes} | Check-out: ${statusNote}` : 
          `Check-out: ${statusNote}`
      }
    });

    return this.mapToResponse(attendance);
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<AttendanceResponseDto> {
    // Check if attendance exists
    const existingAttendance = await this.prismaService.attendance.findUnique({
      where: { id }
    });

    if (!existingAttendance) {
      throw new NotFoundException('Attendance not found');
    }

    // Validate check-out time if provided
    if (updateAttendanceDto.checkOut) {
      const checkInTime = updateAttendanceDto.checkIn ? new Date(updateAttendanceDto.checkIn) : existingAttendance.checkIn;
      const checkOutTime = new Date(updateAttendanceDto.checkOut);
      
      if (checkOutTime <= checkInTime) {
        throw new BadRequestException('Check-out time must be after check-in time');
      }
    }

    const attendance = await this.prismaService.attendance.update({
      where: { id },
      data: {
        checkIn: updateAttendanceDto.checkIn ? new Date(updateAttendanceDto.checkIn) : existingAttendance.checkIn,
        checkOut: updateAttendanceDto.checkOut ? new Date(updateAttendanceDto.checkOut) : updateAttendanceDto.checkOut === null ? null : existingAttendance.checkOut,
        notes: updateAttendanceDto.notes !== undefined ? updateAttendanceDto.notes : existingAttendance.notes,
      }
    });

    return this.mapToResponse(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.prismaService.attendance.findUnique({
      where: { id }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    await this.prismaService.attendance.delete({
      where: { id }
    });
  }

  async removeByEmployeeId(employeeId: string): Promise<void> {
    await this.prismaService.attendance.deleteMany({
      where: { employeeId }
    });
  }

  async getStats(): Promise<AttendanceStatsDto> {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalAttendances, todayAttendances, thisWeekAttendances, thisMonthAttendances, activeAttendances, completedAttendances] = await Promise.all([
      this.prismaService.attendance.count(),
      this.prismaService.attendance.count({
        where: {
          checkIn: {
            gte: today
          }
        }
      }),
      this.prismaService.attendance.count({
        where: {
          checkIn: {
            gte: thisWeek
          }
        }
      }),
      this.prismaService.attendance.count({
        where: {
          checkIn: {
            gte: thisMonth
          }
        }
      }),
      // Số nhân viên đang làm việc (có check-in nhưng chưa check-out hôm nay)
      this.prismaService.attendance.count({
        where: {
          checkIn: {
            gte: today
          },
          checkOut: null
        }
      }),
      // Số nhân viên đã hoàn thành ngày làm việc hôm nay
      this.prismaService.attendance.count({
        where: {
          checkIn: {
            gte: today
          },
          checkOut: {
            not: null
          }
        }
      })
    ]);

    return {
      totalAttendances,
      todayAttendances,
      thisWeekAttendances,
      thisMonthAttendances,
      activeAttendances,
      completedAttendances
    };
  }

  private mapToResponse(attendance: any): AttendanceResponseDto {
    return {
      id: attendance.id,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      notes: attendance.notes,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
      employeeId: attendance.employeeId,
      employee: attendance.employee ? {
        id: attendance.employee.id,
        fullName: attendance.employee.fullName,
        email: attendance.employee.email
      } : undefined
    };
  }
} 