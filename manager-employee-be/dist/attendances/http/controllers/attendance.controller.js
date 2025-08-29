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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("../../services/attendance.service");
const attendance_dto_1 = require("../dto/attendance.dto");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AttendanceController = class AttendanceController {
    attendanceService;
    httpService;
    constructor(attendanceService, httpService) {
        this.attendanceService = attendanceService;
        this.httpService = httpService;
    }
    create(createAttendanceDto) {
        return this.attendanceService.create(createAttendanceDto);
    }
    findAll(page, limit, employeeId, date) {
        return this.attendanceService.findAll(page, limit, employeeId, date);
    }
    getStats() {
        return this.attendanceService.getStats();
    }
    findByEmployeeId(employeeId, page, limit) {
        return this.attendanceService.findByEmployeeId(employeeId, page, limit);
    }
    findByDate(date, page, limit) {
        return this.attendanceService.findByDate(date, page, limit);
    }
    findOne(id) {
        return this.attendanceService.findOne(id);
    }
    update(id, updateAttendanceDto) {
        return this.attendanceService.update(id, updateAttendanceDto);
    }
    checkOut(id, checkOutData) {
        return this.attendanceService.checkOut(id, checkOutData?.checkOutTime);
    }
    remove(id) {
        return this.attendanceService.remove(id);
    }
    removeByEmployeeId(employeeId) {
        return this.attendanceService.removeByEmployeeId(employeeId);
    }
    async faceRecognitionCheckin(checkinData) {
        console.log('🔍 Starting face recognition check-in process...');
        console.log(`📸 Image size: ${checkinData.image.length} characters`);
        try {
            console.log('🚀 Calling Python service for face recognition...');
            let pythonResponse;
            try {
                pythonResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:5000/process/checkin', {
                    image: checkinData.image
                }));
            }
            catch (httpError) {
                console.error('❌ Failed to call Python service:', httpError);
                throw new Error(`Python service unavailable: ${httpError.message}`);
            }
            if (!pythonResponse?.data) {
                throw new Error('Invalid response from Python service');
            }
            if (!pythonResponse.data.success) {
                throw new Error(`Python service error: ${pythonResponse.data.error}`);
            }
            console.log('✅ Python service response received:', {
                face_detected: pythonResponse.data.face_detected,
                faces_count: pythonResponse.data.faces_count,
                face_quality: pythonResponse.data.face_quality,
                features_extracted: pythonResponse.data.debug_info?.features_extracted
            });
            const faceQuality = pythonResponse.data.face_quality || 0;
            const inputFaceFeatures = pythonResponse.data.face_features || [];
            console.log(`📊 Face quality score: ${faceQuality}`);
            console.log(`🔍 Input face features: ${inputFaceFeatures.length} points`);
            if (faceQuality < 0.3) {
                console.warn(`⚠️ Face quality too low: ${faceQuality} (minimum: 0.3)`);
                throw new Error(`Face quality too low: ${faceQuality.toFixed(2)} (minimum: 0.3)`);
            }
            if (inputFaceFeatures.length === 0) {
                console.error('❌ No face features extracted');
                throw new Error('Failed to extract face features');
            }
            console.log('🔍 Querying database for face encodings...');
            let allFaceEncodings;
            try {
                allFaceEncodings = await this.attendanceService['prismaService'].faceEncoding.findMany({
                    include: {
                        employee: true
                    }
                });
                console.log(`📊 Database query successful`);
                console.log(`📊 Raw encodings data:`, allFaceEncodings.map(e => ({
                    id: e.id,
                    employeeId: e.employeeId,
                    employeeName: e.employee?.fullName,
                    encodingLength: e.encoding?.length,
                    encodingType: typeof e.encoding,
                    createdAt: e.createdAt
                })));
            }
            catch (dbError) {
                console.error('❌ Database query failed:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
            console.log(`📊 Found ${allFaceEncodings.length} face encodings in database`);
            if (allFaceEncodings.length === 0) {
                console.error('❌ No face encodings found in database');
                throw new Error('No face encodings found in database. Please register faces first.');
            }
            const validEncodings = allFaceEncodings.filter(e => e.encoding && e.encoding.length > 0);
            console.log(`📊 Valid encodings (with data): ${validEncodings.length}`);
            if (validEncodings.length === 0) {
                console.error('❌ No valid encodings found - all encodings are empty');
                throw new Error('All face encodings in database are empty. Please re-register faces.');
            }
            console.log('🧠 Starting real face recognition comparison...');
            console.log(`🔍 Input features length: ${inputFaceFeatures.length}`);
            console.log(`🔍 Input features sample: ${inputFaceFeatures.slice(0, 5)}`);
            let bestMatch = null;
            let bestConfidence = 0;
            let recognitionMethod = 'feature_comparison';
            let allSimilarities = [];
            for (const encoding of allFaceEncodings) {
                if (encoding.employee && encoding.encoding) {
                    try {
                        console.log(`🔍 Processing encoding for ${encoding.employee.fullName}`);
                        console.log(`🔍 Stored encoding type: ${typeof encoding.encoding}`);
                        console.log(`🔍 Stored encoding length: ${encoding.encoding.length}`);
                        const storedFeatures = await this.attendanceService['prismaService'].faceEncoding.findMany({
                            include: { employee: true }
                        }).then(async (encodings) => {
                            const currentEncoding = encodings.find(e => e.id === encoding.id);
                            if (currentEncoding && currentEncoding.encoding) {
                                const { FaceEncodingService } = await Promise.resolve().then(() => require('../../../face-encodings/services/face-encoding.service'));
                                const faceEncodingService = new FaceEncodingService(this.attendanceService['prismaService']);
                                const encodingBuffer = Buffer.isBuffer(currentEncoding.encoding)
                                    ? currentEncoding.encoding
                                    : Buffer.from(currentEncoding.encoding);
                                return await faceEncodingService.extractFeaturesFromEncoding(encodingBuffer);
                            }
                            return [];
                        });
                        console.log(`🔍 Final stored features length: ${storedFeatures.length}`);
                        console.log(`🔍 Stored features sample: ${storedFeatures.slice(0, 5)}`);
                        if (storedFeatures.length > 0 && storedFeatures.length === inputFaceFeatures.length) {
                            const similarity = this.calculateCosineSimilarity(inputFaceFeatures, storedFeatures);
                            const confidence = similarity;
                            console.log(`🔍 Similarity calculation result: ${similarity}`);
                            console.log(`🔍 Confidence score: ${confidence}`);
                            allSimilarities.push({
                                employee: encoding.employee,
                                confidence: confidence
                            });
                            console.log(`🔍 Comparing with ${encoding.employee.fullName}: confidence = ${confidence.toFixed(3)}`);
                            if (confidence > bestConfidence) {
                                bestConfidence = confidence;
                                bestMatch = encoding.employee;
                                console.log(`🎯 New best match: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);
                            }
                        }
                        else {
                            console.warn(`⚠️ Feature length mismatch for ${encoding.employee.fullName}: stored=${storedFeatures.length}, input=${inputFaceFeatures.length}`);
                            if (storedFeatures.length === 0) {
                                console.warn(`⚠️ No features extracted from stored encoding`);
                            }
                        }
                    }
                    catch (compareError) {
                        console.warn(`⚠️ Error comparing with ${encoding.employee.fullName}:`, compareError);
                    }
                }
                else {
                    console.warn(`⚠️ Skipping encoding - missing employee or encoding data`);
                }
            }
            allSimilarities.sort((a, b) => b.confidence - a.confidence);
            console.log('📊 All similarities:', allSimilarities.map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
            console.log('📊 Top 3 similarities:', allSimilarities.slice(0, 3).map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
            const confidenceThreshold = 0.5;
            if (!bestMatch || bestConfidence < confidenceThreshold) {
                console.error(`❌ No confident match found. Best confidence: ${bestConfidence.toFixed(3)} (threshold: ${confidenceThreshold})`);
                console.error(`❌ Total encodings processed: ${allFaceEncodings.length}`);
                console.error(`❌ Valid comparisons made: ${allSimilarities.length}`);
                if (allSimilarities.length > 0) {
                    console.error(`❌ Best similarity: ${allSimilarities[0].employee.fullName} (${allSimilarities[0].confidence.toFixed(3)})`);
                }
                if (bestMatch && bestConfidence > 0.3) {
                    throw new Error(`Nhận diện kém (${(bestConfidence * 100).toFixed(1)}%). Vui lòng thử lại với ánh sáng tốt hơn.`);
                }
                else {
                    throw new Error(`Không tìm thấy nhân viên. Vui lòng đăng ký khuôn mặt trước.`);
                }
            }
            console.log(`✅ Confident match found: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);
            console.log(`✅ Employee validated: ${bestMatch.fullName} (ID: ${bestMatch.id})`);
            if (!bestMatch.fullName || !bestMatch.email) {
                console.error('❌ Employee data incomplete');
                throw new Error('Employee data incomplete');
            }
            const createDto = {
                employeeId: bestMatch.id,
                checkIn: checkinData.timestamp ? checkinData.timestamp : new Date().toISOString()
            };
            console.log('📝 Creating attendance record:', createDto);
            let attendance;
            try {
                attendance = await this.attendanceService.create(createDto);
            }
            catch (attendanceError) {
                console.error('❌ Failed to create attendance:', attendanceError);
                throw new Error(`Attendance creation failed: ${attendanceError.message}`);
            }
            console.log('✅ Attendance record created successfully');
            const result = {
                ...attendance,
                recognition_info: {
                    employee_name: bestMatch.fullName,
                    employee_email: bestMatch.email,
                    face_quality: faceQuality,
                    confidence: bestConfidence,
                    recognition_method: recognitionMethod,
                    processing_result: pythonResponse.data,
                    debug_info: {
                        faces_detected: pythonResponse.data.faces_count,
                        features_extracted: inputFaceFeatures.length,
                        quality_threshold_passed: faceQuality >= 0.3,
                        database_encodings_count: allFaceEncodings.length,
                        confidence_threshold: confidenceThreshold,
                        all_similarities: allSimilarities.map(s => ({
                            employee_name: s.employee.fullName,
                            confidence: s.confidence
                        })),
                        recognition_timestamp: new Date().toISOString()
                    },
                    note: 'Face recognition completed successfully with real feature comparison'
                }
            };
            return result;
        }
        catch (error) {
            console.error('💥 Error in face recognition check-in:', error);
            console.error('🔍 Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw new common_1.HttpException(`Error: Face recognition check-in failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    calculateCosineSimilarity(features1, features2) {
        try {
            if (features1.length !== features2.length) {
                console.warn(`⚠️ Feature length mismatch: ${features1.length} vs ${features2.length}`);
                return 0.0;
            }
            let dotProduct = 0;
            let norm1 = 0;
            let norm2 = 0;
            for (let i = 0; i < features1.length; i++) {
                dotProduct += features1[i] * features2[i];
                norm1 += features1[i] * features1[i];
                norm2 += features2[i] * features2[i];
            }
            norm1 = Math.sqrt(norm1);
            norm2 = Math.sqrt(norm2);
            if (norm1 === 0 || norm2 === 0) {
                console.warn(`⚠️ Zero norm detected: norm1=${norm1}, norm2=${norm2}`);
                return 0.0;
            }
            const rawSimilarity = dotProduct / (norm1 * norm2);
            const normalizedSimilarity = Math.abs(rawSimilarity);
            if (Math.random() < 0.1) {
                console.log(`🔍 Similarity debug: raw=${rawSimilarity.toFixed(4)}, normalized=${normalizedSimilarity.toFixed(4)}`);
            }
            return Math.max(0, Math.min(1, normalizedSimilarity));
        }
        catch (error) {
            console.error('Error calculating cosine similarity:', error);
            return 0.0;
        }
    }
    async findActiveAttendanceToday(employeeId) {
        try {
            console.log(`🔍 Finding active attendance for employee ${employeeId} today`);
            const today = new Date().toISOString().split('T')[0];
            const attendances = await this.attendanceService.findAll(1, 100, employeeId, today);
            const activeAttendance = attendances.attendances.find(att => !att.checkOut);
            if (activeAttendance) {
                console.log(`✅ Found active attendance: ${activeAttendance.id}`);
                return {
                    success: true,
                    attendance: activeAttendance,
                    message: 'Active attendance found'
                };
            }
            else {
                console.log(`❌ No active attendance found for employee ${employeeId} today`);
                return {
                    success: false,
                    attendance: null,
                    message: 'No active attendance found'
                };
            }
        }
        catch (error) {
            console.error('Error finding active attendance:', error);
            throw new common_1.HttpException(`Error finding active attendance: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async debugEmployeeAttendance(employeeId) {
        try {
            console.log(`🔍 Debug: Finding all attendances for employee ${employeeId}`);
            const allAttendances = await this.attendanceService['prismaService'].attendance.findMany({
                where: {
                    employeeId: employeeId
                },
                include: {
                    employee: true
                },
                orderBy: { checkIn: 'desc' }
            });
            console.log(`📊 Found ${allAttendances.length} total attendances for employee ${employeeId}`);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log(`📅 Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
            const todayAttendances = allAttendances.filter(att => {
                const checkInDate = new Date(att.checkIn);
                return checkInDate >= today && checkInDate < tomorrow;
            });
            console.log(`📊 Found ${todayAttendances.length} attendances for today`);
            return {
                success: true,
                employeeId: employeeId,
                totalAttendances: allAttendances.length,
                todayAttendances: todayAttendances.length,
                todayDateRange: {
                    start: today.toISOString(),
                    end: tomorrow.toISOString()
                },
                allAttendancesList: allAttendances.map(att => ({
                    id: att.id,
                    checkIn: att.checkIn,
                    checkOut: att.checkOut,
                    createdAt: att.createdAt,
                    updatedAt: att.updatedAt,
                    employeeName: att.employee?.fullName
                })),
                todayAttendancesList: todayAttendances.map(att => ({
                    id: att.id,
                    checkIn: att.checkIn,
                    checkOut: att.checkOut,
                    createdAt: att.createdAt,
                    updatedAt: att.updatedAt,
                    employeeName: att.employee?.fullName
                }))
            };
        }
        catch (error) {
            console.error('Error debugging employee attendance:', error);
            throw new common_1.HttpException(`Error debugging employee attendance: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkoutEmployeeToday(employeeId, checkOutData) {
        try {
            console.log(`🔍 Checking out employee ${employeeId} today`);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log(`📅 Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
            const attendances = await this.attendanceService['prismaService'].attendance.findMany({
                where: {
                    employeeId: employeeId,
                    checkIn: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                include: {
                    employee: true
                },
                orderBy: { checkIn: 'desc' }
            });
            console.log(`📊 Found ${attendances.length} attendances for employee ${employeeId} today`);
            attendances.forEach((att, index) => {
                console.log(`📋 Attendance ${index + 1}:`, {
                    id: att.id,
                    employeeId: att.employeeId,
                    checkIn: att.checkIn,
                    checkOut: att.checkOut,
                    createdAt: att.createdAt,
                    updatedAt: att.updatedAt,
                    employeeName: att.employee?.fullName
                });
            });
            const activeAttendance = attendances.find(att => !att.checkOut);
            if (activeAttendance) {
                console.log(`✅ Found active attendance: ${activeAttendance.id}`);
                console.log(`📋 Active attendance details:`, {
                    id: activeAttendance.id,
                    employeeId: activeAttendance.employeeId,
                    checkIn: activeAttendance.checkIn,
                    checkOut: activeAttendance.checkOut,
                    createdAt: activeAttendance.createdAt,
                    updatedAt: activeAttendance.updatedAt,
                    employeeName: activeAttendance.employee?.fullName
                });
                const checkOutResult = await this.attendanceService.checkOut(activeAttendance.id, checkOutData?.checkOutTime);
                console.log(`✅ Check-out successful for attendance ${activeAttendance.id}`);
                return {
                    success: true,
                    attendance: checkOutResult,
                    message: 'Check-out successful'
                };
            }
            else {
                console.log(`❌ No active attendance found for employee ${employeeId} today`);
                console.log(`🔍 All attendances for today:`, attendances.map(att => ({
                    id: att.id,
                    checkIn: att.checkIn,
                    checkOut: att.checkOut,
                    hasCheckOut: !!att.checkOut,
                    employeeName: att.employee?.fullName
                })));
                return {
                    success: false,
                    attendance: null,
                    message: 'No active attendance found to check-out'
                };
            }
        }
        catch (error) {
            console.error('Error during check-out:', error);
            throw new common_1.HttpException(`Error during check-out: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async faceRecognitionOnly(recognitionData) {
        console.log('🔍 Starting face recognition only (no attendance creation)...');
        console.log(`📸 Image size: ${recognitionData.image.length} characters`);
        try {
            console.log('🚀 Calling Python service for face recognition...');
            let pythonResponse;
            try {
                pythonResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://localhost:5000/process/checkin', {
                    image: recognitionData.image
                }));
            }
            catch (httpError) {
                console.error('❌ Failed to call Python service:', httpError);
                throw new Error(`Python service unavailable: ${httpError.message}`);
            }
            if (!pythonResponse?.data) {
                throw new Error('Invalid response from Python service');
            }
            if (!pythonResponse.data.success) {
                throw new Error(`Python service error: ${pythonResponse.data.error}`);
            }
            console.log('✅ Python service response received:', {
                face_detected: pythonResponse.data.face_detected,
                faces_count: pythonResponse.data.faces_count,
                face_quality: pythonResponse.data.face_quality,
                features_extracted: pythonResponse.data.debug_info?.features_extracted
            });
            const faceQuality = pythonResponse.data.face_quality || 0;
            const inputFaceFeatures = pythonResponse.data.face_features || [];
            console.log(`📊 Face quality score: ${faceQuality}`);
            console.log(`🔍 Input face features: ${inputFaceFeatures.length} points`);
            if (faceQuality < 0.3) {
                console.warn(`⚠️ Face quality too low: ${faceQuality} (minimum: 0.3)`);
                throw new Error(`Face quality too low: ${faceQuality.toFixed(2)} (minimum: 0.3)`);
            }
            if (inputFaceFeatures.length === 0) {
                console.error('❌ No face features extracted');
                throw new Error('Failed to extract face features');
            }
            console.log('🔍 Querying database for face encodings...');
            let allFaceEncodings;
            try {
                allFaceEncodings = await this.attendanceService['prismaService'].faceEncoding.findMany({
                    include: {
                        employee: true
                    }
                });
                console.log(`📊 Database query successful`);
                console.log(`📊 Raw encodings data:`, allFaceEncodings.map(e => ({
                    id: e.id,
                    employeeId: e.employeeId,
                    employeeName: e.employee?.fullName,
                    encodingLength: e.encoding?.length,
                    encodingType: typeof e.encoding,
                    createdAt: e.createdAt
                })));
            }
            catch (dbError) {
                console.error('❌ Database query failed:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
            if (!allFaceEncodings || allFaceEncodings.length === 0) {
                throw new Error('No face encodings found in database');
            }
            console.log(`📊 Found ${allFaceEncodings.length} face encodings in database`);
            console.log('🔍 Comparing face features with database...');
            console.log(`📊 Input features length: ${inputFaceFeatures.length}`);
            console.log(`📊 Input features sample: [${inputFaceFeatures.slice(0, 5).map(f => f.toFixed(3)).join(', ')}...]`);
            let bestMatch = null;
            let bestConfidence = 0;
            let recognitionMethod = 'feature_comparison';
            const allSimilarities = [];
            for (const encoding of allFaceEncodings) {
                if (encoding.employee && encoding.encoding) {
                    try {
                        console.log(`🔍 Processing encoding for ${encoding.employee.fullName}`);
                        console.log(`🔍 Stored encoding type: ${typeof encoding.encoding}`);
                        console.log(`🔍 Stored encoding length: ${encoding.encoding.length}`);
                        const storedFeatures = await this.attendanceService['prismaService'].faceEncoding.findMany({
                            include: { employee: true }
                        }).then(async (encodings) => {
                            const currentEncoding = encodings.find(e => e.id === encoding.id);
                            if (currentEncoding && currentEncoding.encoding) {
                                const { FaceEncodingService } = await Promise.resolve().then(() => require('../../../face-encodings/services/face-encoding.service'));
                                const faceEncodingService = new FaceEncodingService(this.attendanceService['prismaService']);
                                const encodingBuffer = Buffer.isBuffer(currentEncoding.encoding)
                                    ? currentEncoding.encoding
                                    : Buffer.from(currentEncoding.encoding);
                                return await faceEncodingService.extractFeaturesFromEncoding(encodingBuffer);
                            }
                            return [];
                        });
                        console.log(`🔍 Final stored features length: ${storedFeatures.length}`);
                        console.log(`🔍 Stored features sample: ${storedFeatures.slice(0, 5)}`);
                        if (storedFeatures.length > 0 && storedFeatures.length === inputFaceFeatures.length) {
                            const similarity = this.calculateCosineSimilarity(inputFaceFeatures, storedFeatures);
                            const confidence = similarity;
                            console.log(`🔍 Similarity calculation result: ${similarity}`);
                            console.log(`🔍 Confidence score: ${confidence}`);
                            allSimilarities.push({
                                employee: encoding.employee,
                                confidence: confidence
                            });
                            console.log(`🔍 Comparing with ${encoding.employee.fullName}: confidence = ${confidence.toFixed(3)}`);
                            if (confidence > bestConfidence) {
                                bestConfidence = confidence;
                                bestMatch = encoding.employee;
                                console.log(`🎯 New best match: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);
                            }
                        }
                        else {
                            console.warn(`⚠️ Feature length mismatch for ${encoding.employee.fullName}: stored=${storedFeatures.length}, input=${inputFaceFeatures.length}`);
                            if (storedFeatures.length === 0) {
                                console.warn(`⚠️ No features extracted from stored encoding`);
                            }
                        }
                    }
                    catch (compareError) {
                        console.warn(`⚠️ Error comparing with ${encoding.employee.fullName}:`, compareError);
                    }
                }
                else {
                    console.warn(`⚠️ Skipping encoding - missing employee or encoding data`);
                }
            }
            allSimilarities.sort((a, b) => b.confidence - a.confidence);
            console.log('📊 All similarities:', allSimilarities.map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
            console.log('📊 Top 3 similarities:', allSimilarities.slice(0, 3).map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
            const confidenceThreshold = 0.5;
            if (!bestMatch || bestConfidence < confidenceThreshold) {
                console.error(`❌ No confident match found. Best confidence: ${bestConfidence.toFixed(3)} (threshold: ${confidenceThreshold})`);
                console.error(`❌ Total encodings processed: ${allFaceEncodings.length}`);
                console.error(`❌ Valid comparisons made: ${allSimilarities.length}`);
                if (allSimilarities.length > 0) {
                    console.error(`❌ Best similarity: ${allSimilarities[0].employee.fullName} (${allSimilarities[0].confidence.toFixed(3)})`);
                }
                if (bestMatch && bestConfidence > 0.3) {
                    throw new Error(`Nhận diện kém (${(bestConfidence * 100).toFixed(1)}%). Vui lòng thử lại với ánh sáng tốt hơn.`);
                }
                else {
                    throw new Error(`Không tìm thấy nhân viên. Vui lòng đăng ký khuôn mặt trước.`);
                }
            }
            console.log(`✅ Employee recognized: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);
            const result = {
                employee_id: bestMatch.id,
                employee_name: bestMatch.fullName,
                employee_email: bestMatch.email,
                face_quality: faceQuality,
                confidence: bestConfidence,
                recognition_method: recognitionMethod,
                processing_result: pythonResponse.data,
                debug_info: {
                    faces_detected: pythonResponse.data.faces_count,
                    features_extracted: inputFaceFeatures.length,
                    quality_threshold_passed: faceQuality >= 0.3,
                    database_encodings_count: allFaceEncodings.length,
                    confidence_threshold: confidenceThreshold,
                    all_similarities: allSimilarities.map(s => ({
                        employee_name: s.employee.fullName,
                        confidence: s.confidence
                    })),
                    recognition_timestamp: new Date().toISOString()
                },
                note: 'Face recognition completed successfully - no attendance created'
            };
            return result;
        }
        catch (error) {
            console.error('💥 Error in face recognition only:', error);
            console.error('🔍 Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw new common_1.HttpException(`Error: Face recognition failed: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_dto_1.CreateAttendanceDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('employeeId')),
    __param(3, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findByEmployeeId", null);
__decorate([
    (0, common_1.Get)('date/:date'),
    __param(0, (0, common_1.Param)('date')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attendance_dto_1.UpdateAttendanceDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/checkout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('employee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "removeByEmployeeId", null);
__decorate([
    (0, common_1.Post)('face-recognition-checkin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "faceRecognitionCheckin", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/active-today'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findActiveAttendanceToday", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/debug'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "debugEmployeeAttendance", null);
__decorate([
    (0, common_1.Post)('employee/:employeeId/checkout-today'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkoutEmployeeToday", null);
__decorate([
    (0, common_1.Post)('face-recognition-only'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "faceRecognitionOnly", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendances'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        axios_1.HttpService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map