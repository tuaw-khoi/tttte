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
exports.FaceEncodingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FaceEncodingService = class FaceEncodingService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createFaceEncodingDto) {
        try {
            const encodingData = createFaceEncodingDto.encoding;
            console.log(`🔍 Storing face encoding for employee ${createFaceEncodingDto.employeeId}`);
            console.log(`🔍 Encoding type: ${typeof encodingData}`);
            console.log(`🔍 Encoding length: ${encodingData.length}`);
            console.log(`🔍 Encoding preview: ${encodingData.substring(0, 100)}...`);
            const faceEncoding = await this.prismaService.faceEncoding.create({
                data: {
                    employeeId: createFaceEncodingDto.employeeId,
                    encoding: Buffer.from(encodingData, 'base64'),
                },
                include: {
                    employee: true,
                },
            });
            console.log(`✅ Face encoding stored successfully with ID: ${faceEncoding.id}`);
            return faceEncoding;
        }
        catch (error) {
            console.error('❌ Error creating face encoding:', error);
            throw error;
        }
    }
    async findAll() {
        return this.prismaService.faceEncoding.findMany({
            include: {
                employee: true,
            },
        });
    }
    async findOne(id) {
        return this.prismaService.faceEncoding.findUnique({
            where: { id },
            include: {
                employee: true,
            },
        });
    }
    async findByEmployeeId(employeeId) {
        return this.prismaService.faceEncoding.findFirst({
            where: { employeeId },
            include: {
                employee: true,
            },
        });
    }
    async update(id, updateFaceEncodingDto) {
        try {
            const encodingData = updateFaceEncodingDto.encoding;
            console.log(`🔍 Updating face encoding ${id}`);
            console.log(`🔍 New encoding type: ${typeof encodingData}`);
            console.log(`🔍 New encoding length: ${encodingData.length}`);
            const faceEncoding = await this.prismaService.faceEncoding.update({
                where: { id },
                data: {
                    encoding: Buffer.from(encodingData, 'base64'),
                },
                include: {
                    employee: true,
                },
            });
            console.log(`✅ Face encoding updated successfully`);
            return faceEncoding;
        }
        catch (error) {
            console.error('❌ Error updating face encoding:', error);
            throw error;
        }
    }
    async remove(id) {
        return this.prismaService.faceEncoding.delete({
            where: { id },
        });
    }
    async extractFeaturesFromEncoding(encoding) {
        try {
            const base64String = encoding.toString('base64');
            console.log(`🔍 Decoded base64 string length: ${base64String.length}`);
            const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
            console.log(`🔍 JSON string length: ${jsonString.length}`);
            console.log(`🔍 JSON string preview: ${jsonString.substring(0, 100)}...`);
            let features = [];
            try {
                const parsedData = JSON.parse(jsonString);
                console.log(`🔍 Successfully parsed JSON encoding`);
                console.log(`🔍 JSON keys: ${Object.keys(parsedData)}`);
                features = parsedData.features || parsedData.face_features || [];
                console.log(`🔍 Extracted ${features.length} features from JSON`);
            }
            catch (jsonError) {
                console.log(`🔍 JSON parsing failed:`, jsonError.message);
                console.log(`🔍 Raw JSON string: ${jsonString}`);
                return [];
            }
            console.log(`🔍 Final features extracted: ${features.length}`);
            return features;
        }
        catch (error) {
            console.error('❌ Error extracting features from encoding:', error);
            return [];
        }
    }
};
exports.FaceEncodingService = FaceEncodingService;
exports.FaceEncodingService = FaceEncodingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FaceEncodingService);
//# sourceMappingURL=face-encoding.service.js.map