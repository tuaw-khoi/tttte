import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFaceEncodingDto {
  @IsString()
  @IsNotEmpty()
  encoding: string; // Base64 encoded face encoding

  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class UpdateFaceEncodingDto {
  @IsString()
  @IsNotEmpty()
  encoding: string; // Base64 encoded face encoding
} 