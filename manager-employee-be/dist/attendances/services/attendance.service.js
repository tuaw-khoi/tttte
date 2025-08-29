"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createAttendanceDto) {
        const employee = await this.prismaService.employee.findUnique({
            where: { id: createAttendanceDto.employeeId }
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
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
            throw new common_1.ConflictException('Employee already has attendance for today');
        }
        if (createAttendanceDto.checkOut) {
            const checkInTime = createAttendanceDto.checkIn ? new Date(createAttendanceDto.checkIn) : new Date();
            const checkOutTime = new Date(createAttendanceDto.checkOut);
            if (checkOutTime <= checkInTime) {
                throw new common_1.BadRequestException('Check-out time must be after check-in time');
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
    async findAll(page = 1, limit = 10, employeeId, date) {
        const skip = (page - 1) * limit;
        let where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Attendance not found');
        }
        return this.mapToResponse(attendance);
    }
    async findByEmployeeId(employeeId, page = 1, limit = 10) {
        return this.findAll(page, limit, employeeId);
    }
    async findByDate(date, page = 1, limit = 10) {
        return this.findAll(page, limit, undefined, date);
    }
    async checkOut(id, checkOutTime) {
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
            throw new common_1.NotFoundException('Attendance not found');
        }
        if (existingAttendance.checkOut) {
            throw new common_1.ConflictException('Employee already checked out');
        }
        const checkOutDateTime = checkOutTime ? new Date(checkOutTime) : new Date();
        if (checkOutDateTime <= existingAttendance.checkIn) {
            throw new common_1.BadRequestException('Check-out time must be after check-in time');
        }
        const workingHours = (checkOutDateTime.getTime() - existingAttendance.checkIn.getTime()) / (1000 * 60 * 60);
        let status = 'normal';
        let statusNote = '';
        if (workingHours < 8) {
            status = 'undertime';
            statusNote = `Thiếu ${(8 - workingHours).toFixed(1)} giờ`;
        }
        else if (workingHours >= 8 && workingHours <= 10) {
            status = 'normal';
            statusNote = 'Đủ giờ làm việc';
        }
        else {
            status = 'overtime';
            statusNote = `Làm thêm ${(workingHours - 8).toFixed(1)} giờ`;
        }
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
    async update(id, updateAttendanceDto) {
        const existingAttendance = await this.prismaService.attendance.findUnique({
            where: { id }
        });
        if (!existingAttendance) {
            throw new common_1.NotFoundException('Attendance not found');
        }
        if (updateAttendanceDto.checkOut) {
            const checkInTime = updateAttendanceDto.checkIn ? new Date(updateAttendanceDto.checkIn) : existingAttendance.checkIn;
            const checkOutTime = new Date(updateAttendanceDto.checkOut);
            if (checkOutTime <= checkInTime) {
                throw new common_1.BadRequestException('Check-out time must be after check-in time');
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
    async remove(id) {
        const attendance = await this.prismaService.attendance.findUnique({
            where: { id }
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance not found');
        }
        await this.prismaService.attendance.delete({
            where: { id }
        });
    }
    async removeByEmployeeId(employeeId) {
        await this.prismaService.attendance.deleteMany({
            where: { employeeId }
        });
    }
    async getStats() {
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
            this.prismaService.attendance.count({
                where: {
                    checkIn: {
                        gte: today
                    },
                    checkOut: null
                }
            }),
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
    mapToResponse(attendance) {
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
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map