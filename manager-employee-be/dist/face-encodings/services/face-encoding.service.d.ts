import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaceEncodingDto } from '../http/dto/face-encoding.dto';
export declare class FaceEncodingService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createFaceEncodingDto: CreateFaceEncodingDto): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    }>;
    findAll(): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    })[]>;
    findOne(id: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    }) | null>;
    findByEmployeeId(employeeId: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    }) | null>;
    update(id: string, updateFaceEncodingDto: any): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        encoding: Uint8Array;
        employeeId: string;
    }>;
    extractFeaturesFromEncoding(encoding: Buffer): Promise<number[]>;
}
