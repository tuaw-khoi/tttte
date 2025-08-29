import { FaceEncodingService } from '../../services/face-encoding.service';
import { CreateFaceEncodingDto, UpdateFaceEncodingDto } from '../dto/face-encoding.dto';
import { HttpService } from '@nestjs/axios';
export declare class FaceEncodingController {
    private readonly faceEncodingService;
    private readonly httpService;
    constructor(faceEncodingService: FaceEncodingService, httpService: HttpService);
    create(createFaceEncodingDto: CreateFaceEncodingDto): Promise<{
        id: string;
        employeeId: string;
        encoding: string;
        createdAt: Date;
        employee: {
            email: string | null;
            id: string;
            createdAt: Date;
            fullName: string;
            phoneNumber: string | null;
            department: string | null;
            position: string | null;
            hireDate: Date | null;
        };
    }>;
    findAll(page: number, limit: number, employeeId?: string): Promise<{
        faceEncodings: {
            id: string;
            employeeId: string;
            encoding: string;
            createdAt: Date;
            employee: {
                email: string | null;
                id: string;
                createdAt: Date;
                fullName: string;
                phoneNumber: string | null;
                department: string | null;
                position: string | null;
                hireDate: Date | null;
            };
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByEmployeeId(employeeId: string): Promise<{
        id: string;
        employeeId: string;
        encoding: string;
        createdAt: Date;
        employee: {
            email: string | null;
            id: string;
            createdAt: Date;
            fullName: string;
            phoneNumber: string | null;
            department: string | null;
            position: string | null;
            hireDate: Date | null;
        };
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        employeeId: string;
        encoding: string;
        createdAt: Date;
        employee: {
            email: string | null;
            id: string;
            createdAt: Date;
            fullName: string;
            phoneNumber: string | null;
            department: string | null;
            position: string | null;
            hireDate: Date | null;
        };
    }>;
    update(id: string, updateFaceEncodingDto: UpdateFaceEncodingDto): Promise<{
        id: string;
        employeeId: string;
        encoding: string;
        createdAt: Date;
        employee: {
            email: string | null;
            id: string;
            createdAt: Date;
            fullName: string;
            phoneNumber: string | null;
            department: string | null;
            position: string | null;
            hireDate: Date | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    removeByEmployeeId(employeeId: string): Promise<{
        success: boolean;
    }>;
    syncFromRecognitionService(syncData: {
        employee_id: string;
        encoding: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            employeeId: string;
            encoding: string;
            createdAt: Date;
            employee: {
                email: string | null;
                id: string;
                createdAt: Date;
                fullName: string;
                phoneNumber: string | null;
                department: string | null;
                position: string | null;
                hireDate: Date | null;
            };
        };
    }>;
    processFaceRegistration(registrationData: {
        employeeId: string;
        employeeName: string;
        videoFrames: string[];
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            employeeId: string;
            encoding: string;
            createdAt: Date;
            employee: {
                email: string | null;
                id: string;
                createdAt: Date;
                fullName: string;
                phoneNumber: string | null;
                department: string | null;
                position: string | null;
                hireDate: Date | null;
            };
        };
        processing_result: any;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        processing_result: any;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
        processing_result?: undefined;
    }>;
    processFaceRecognition(recognitionData: {
        image: string;
        employeeId?: string;
    }): Promise<{
        success: boolean;
        recognition_results: any;
        faces_detected: any;
        processing_result: any;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        processing_result: any;
        recognition_results?: undefined;
        faces_detected?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        recognition_results?: undefined;
        faces_detected?: undefined;
        processing_result?: undefined;
    }>;
    checkEmployeeFaceExists(employeeId: string): Promise<{
        exists: boolean;
        count: number;
    }>;
}
