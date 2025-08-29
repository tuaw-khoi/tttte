export class FaceEncodingResponseDto {
  id: string;
  encoding: string; // Base64 encoded
  createdAt: Date;
  employeeId: string;
}

export class FaceEncodingListResponseDto {
  faceEncodings: FaceEncodingResponseDto[];
  total: number;
  page: number;
  limit: number;
} 