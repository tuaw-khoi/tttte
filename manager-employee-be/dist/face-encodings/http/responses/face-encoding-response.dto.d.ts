export declare class FaceEncodingResponseDto {
    id: string;
    encoding: string;
    createdAt: Date;
    employeeId: string;
}
export declare class FaceEncodingListResponseDto {
    faceEncodings: FaceEncodingResponseDto[];
    total: number;
    page: number;
    limit: number;
}
