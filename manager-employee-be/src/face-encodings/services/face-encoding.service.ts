import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaceEncodingDto } from '../http/dto/face-encoding.dto';

@Injectable()
export class FaceEncodingService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createFaceEncodingDto: CreateFaceEncodingDto) {
    try {
      // The encoding from Python is already base64 encoded JSON string
      // We should store it directly as base64 string, not convert to UTF-8
      const encodingData = createFaceEncodingDto.encoding;

      console.log(`🔍 Storing face encoding for employee ${createFaceEncodingDto.employeeId}`);
      console.log(`🔍 Encoding type: ${typeof encodingData}`);
      console.log(`🔍 Encoding length: ${encodingData.length}`);
      console.log(`🔍 Encoding preview: ${encodingData.substring(0, 100)}...`);

      const faceEncoding = await this.prismaService.faceEncoding.create({
        data: {
          employeeId: createFaceEncodingDto.employeeId,
          encoding: Buffer.from(encodingData, 'base64'), // Store as base64 buffer
        },
        include: {
          employee: true,
        },
      });

      console.log(`✅ Face encoding stored successfully with ID: ${faceEncoding.id}`);
      return faceEncoding;
    } catch (error) {
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

  async findOne(id: string) {
    return this.prismaService.faceEncoding.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
  }

  async findByEmployeeId(employeeId: string) {
    return this.prismaService.faceEncoding.findFirst({
      where: { employeeId },
      include: {
        employee: true,
      },
    });
  }

  async update(id: string, updateFaceEncodingDto: any) {
    try {
      // The encoding from Python is already base64 encoded JSON string
      // We should store it directly as base64 string, not convert to UTF-8
      const encodingData = updateFaceEncodingDto.encoding;

      console.log(`🔍 Updating face encoding ${id}`);
      console.log(`🔍 New encoding type: ${typeof encodingData}`);
      console.log(`🔍 New encoding length: ${encodingData.length}`);

      const faceEncoding = await this.prismaService.faceEncoding.update({
        where: { id },
        data: {
          encoding: Buffer.from(encodingData, 'base64'), // Store as base64 buffer
        },
        include: {
          employee: true,
        },
      });

      console.log(`✅ Face encoding updated successfully`);
      return faceEncoding;
    } catch (error) {
      console.error('❌ Error updating face encoding:', error);
      throw error;
    }
  }

  async remove(id: string) {
    return this.prismaService.faceEncoding.delete({
      where: { id },
    });
  }

  // Helper method to extract features from stored encoding
  async extractFeaturesFromEncoding(encoding: Buffer): Promise<number[]> {
    try {
      // The encoding is stored as base64 buffer, so decode it first
      const base64String = encoding.toString('base64');
      console.log(`🔍 Decoded base64 string length: ${base64String.length}`);
      
      // Decode base64 to get the original JSON string
      const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
      console.log(`🔍 JSON string length: ${jsonString.length}`);
      console.log(`🔍 JSON string preview: ${jsonString.substring(0, 100)}...`);
      
      let features: number[] = [];
      
      try {
        // Parse the JSON string
        const parsedData = JSON.parse(jsonString);
        console.log(`🔍 Successfully parsed JSON encoding`);
        console.log(`🔍 JSON keys: ${Object.keys(parsedData)}`);
        
        features = parsedData.features || parsedData.face_features || [];
        console.log(`🔍 Extracted ${features.length} features from JSON`);
        
      } catch (jsonError) {
        console.log(`🔍 JSON parsing failed:`, jsonError.message);
        console.log(`🔍 Raw JSON string: ${jsonString}`);
        return [];
      }
      
      console.log(`🔍 Final features extracted: ${features.length}`);
      return features;
      
    } catch (error) {
      console.error('❌ Error extracting features from encoding:', error);
      return [];
    }
  }
} 