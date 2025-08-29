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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceEncodingController = void 0;
const common_1 = require("@nestjs/common");
const face_encoding_service_1 = require("../../services/face-encoding.service");
const face_encoding_dto_1 = require("../dto/face-encoding.dto");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FaceEncodingController = class FaceEncodingController {
    faceEncodingService;
    httpService;
    constructor(faceEncodingService, httpService) {
        this.faceEncodingService = faceEncodingService;
        this.httpService = httpService;
    }
    async create(createFaceEncodingDto) {
        console.log('Creating face encoding with data:', createFaceEncodingDto);
        const result = await this.faceEncodingService.create(createFaceEncodingDto);
        return {
            id: result.id,
            employeeId: result.employeeId,
            encoding: Buffer.from(result.encoding).toString('base64'),
            createdAt: result.createdAt,
            employee: result.employee
        };
    }
    async findAll(page, limit, employeeId) {
        const results = await this.faceEncodingService.findAll();
        let filteredResults = results;
        if (employeeId) {
            filteredResults = results.filter(r => r.employeeId === employeeId);
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = filteredResults.slice(startIndex, endIndex);
        return {
            faceEncodings: paginatedResults.map(result => ({
                id: result.id,
                employeeId: result.employeeId,
                encoding: Buffer.from(result.encoding).toString('base64'),
                createdAt: result.createdAt,
                employee: result.employee
            })),
            total: filteredResults.length,
            page,
            limit
        };
    }
    async findByEmployeeId(employeeId) {
        const result = await this.faceEncodingService.findByEmployeeId(employeeId);
        if (!result)
            return [];
        return [{
                id: result.id,
                employeeId: result.employeeId,
                encoding: Buffer.from(result.encoding).toString('base64'),
                createdAt: result.createdAt,
                employee: result.employee
            }];
    }
    async findOne(id) {
        const result = await this.faceEncodingService.findOne(id);
        if (!result) {
            throw new Error('Face encoding not found');
        }
        return {
            id: result.id,
            employeeId: result.employeeId,
            encoding: Buffer.from(result.encoding).toString('base64'),
            createdAt: result.createdAt,
            employee: result.employee
        };
    }
    async update(id, updateFaceEncodingDto) {
        const result = await this.faceEncodingService.update(id, updateFaceEncodingDto);
        return {
            id: result.id,
            employeeId: result.employeeId,
            encoding: Buffer.from(result.encoding).toString('base64'),
            createdAt: result.createdAt,
            employee: result.employee
        };
    }
    async remove(id) {
        await this.faceEncodingService.remove(id);
        return { success: true };
    }
    async removeByEmployeeId(employeeId) {
        const result = await this.faceEncodingService.findByEmployeeId(employeeId);
        if (result) {
            await this.faceEncodingService.remove(result.id);
        }
        return { success: true };
    }
    async syncFromRecognitionService(syncData) {
        const createDto = {
            employeeId: syncData.employee_id,
            encoding: syncData.encoding
        };
        const existing = await this.faceEncodingService.findByEmployeeId(syncData.employee_id);
        if (existing) {
            const updateDto = {
                encoding: syncData.encoding
            };
            const updated = await this.faceEncodingService.update(existing.id, updateDto);
            return {
                success: true,
                message: 'Face encoding updated successfully',
                data: {
                    id: updated.id,
                    employeeId: updated.employeeId,
                    encoding: Buffer.from(updated.encoding).toString('base64'),
                    createdAt: updated.createdAt,
                    employee: updated.employee
                }
            };
        }
        else {
            const created = await this.faceEncodingService.create(createDto);
            return {
                success: true,
                message: 'Face encoding created successfully',
                data: {
                    id: created.id,
                    employeeId: created.employeeId,
                    encoding: Buffer.from(created.encoding).toString('base64'),
                    createdAt: created.createdAt,
                    employee: created.employee
                }
            };
        }
    }
    async processFaceRegistration(registrationData) {
        try {
            const pythonResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:5000/process/register', {
                employee_id: registrationData.employeeId,
                employee_name: registrationData.employeeName,
                video_frames: registrationData.videoFrames
            }));
            if (pythonResponse.data.success) {
                const createDto = {
                    employeeId: registrationData.employeeId,
                    encoding: pythonResponse.data.encoding
                };
                const existing = await this.faceEncodingService.findByEmployeeId(registrationData.employeeId);
                if (existing) {
                    const updateDto = {
                        encoding: pythonResponse.data.encoding
                    };
                    const updated = await this.faceEncodingService.update(existing.id, updateDto);
                    return {
                        success: true,
                        message: `Face updated for ${registrationData.employeeName}`,
                        data: {
                            id: updated.id,
                            employeeId: updated.employeeId,
                            encoding: Buffer.from(updated.encoding).toString('base64'),
                            createdAt: updated.createdAt,
                            employee: updated.employee
                        },
                        processing_result: pythonResponse.data
                    };
                }
                else {
                    const created = await this.faceEncodingService.create(createDto);
                    return {
                        success: true,
                        message: `Face registered for ${registrationData.employeeName}`,
                        data: {
                            id: created.id,
                            employeeId: created.employeeId,
                            encoding: Buffer.from(created.encoding).toString('base64'),
                            createdAt: created.createdAt,
                            employee: created.employee
                        },
                        processing_result: pythonResponse.data
                    };
                }
            }
            else {
                return {
                    success: false,
                    message: pythonResponse.data.message || 'Face processing failed',
                    processing_result: pythonResponse.data
                };
            }
        }
        catch (error) {
            console.error('Error calling Python service:', error);
            return {
                success: false,
                message: 'Failed to process face registration',
                error: error.message
            };
        }
    }
    async processFaceRecognition(recognitionData) {
        try {
            const pythonResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:5000/process/checkin', {
                image: recognitionData.image,
                employee_id: recognitionData.employeeId
            }));
            if (pythonResponse.data.success) {
                return {
                    success: true,
                    recognition_results: pythonResponse.data,
                    faces_detected: pythonResponse.data.faces_count,
                    processing_result: pythonResponse.data
                };
            }
            else {
                return {
                    success: false,
                    message: pythonResponse.data.message || 'Face recognition failed',
                    processing_result: pythonResponse.data
                };
            }
        }
        catch (error) {
            console.error('Error calling Python service:', error);
            return {
                success: false,
                message: 'Failed to process face recognition',
                error: error.message
            };
        }
    }
    async checkEmployeeFaceExists(employeeId) {
        const encodings = await this.faceEncodingService.findByEmployeeId(employeeId);
        return {
            exists: !!encodings,
            count: encodings ? 1 : 0
        };
    }
};
exports.FaceEncodingController = FaceEncodingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [face_encoding_dto_1.CreateFaceEncodingDto]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "findByEmployeeId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, face_encoding_dto_1.UpdateFaceEncodingDto]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "removeByEmployeeId", null);
__decorate([
    (0, common_1.Post)('sync-from-recognition-service'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "syncFromRecognitionService", null);
__decorate([
    (0, common_1.Post)('process-registration'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "processFaceRegistration", null);
__decorate([
    (0, common_1.Post)('process-recognition'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "processFaceRecognition", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/exists'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaceEncodingController.prototype, "checkEmployeeFaceExists", null);
exports.FaceEncodingController = FaceEncodingController = __decorate([
    (0, common_1.Controller)('face-encodings'),
    __metadata("design:paramtypes", [face_encoding_service_1.FaceEncodingService,
        axios_1.HttpService])
], FaceEncodingController);
//# sourceMappingURL=face-encoding.controller.js.map