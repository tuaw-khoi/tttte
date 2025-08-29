import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FaceEncodingService } from '../../services/face-encoding.service';
import { CreateFaceEncodingDto, UpdateFaceEncodingDto } from '../dto/face-encoding.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('face-encodings')
export class FaceEncodingController {
  constructor(
    private readonly faceEncodingService: FaceEncodingService,
    private readonly httpService: HttpService
  ) {}

  @Post()
  async create(@Body() createFaceEncodingDto: CreateFaceEncodingDto) {
    console.log('Creating face encoding with data:', createFaceEncodingDto);
    const result = await this.faceEncodingService.create(createFaceEncodingDto);
    return {
      id: result.id,
      employeeId: result.employeeId,
      encoding: Buffer.from(result.encoding).toString('base64'), // Convert Buffer to base64 string
      createdAt: result.createdAt,
      employee: result.employee
    };
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('employeeId') employeeId?: string,
  ) {
    const results = await this.faceEncodingService.findAll();
    
    // Filter by employeeId if provided
    let filteredResults = results;
    if (employeeId) {
      filteredResults = results.filter(r => r.employeeId === employeeId);
    }
    
    // Apply pagination
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

  @Get('employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    const result = await this.faceEncodingService.findByEmployeeId(employeeId);
    if (!result) return [];
    
    return [{
      id: result.id,
      employeeId: result.employeeId,
      encoding: Buffer.from(result.encoding).toString('base64'),
      createdAt: result.createdAt,
      employee: result.employee
    }];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
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

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateFaceEncodingDto: UpdateFaceEncodingDto
  ) {
    const result = await this.faceEncodingService.update(id, updateFaceEncodingDto);
    return {
      id: result.id,
      employeeId: result.employeeId,
      encoding: Buffer.from(result.encoding).toString('base64'),
      createdAt: result.createdAt,
      employee: result.employee
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.faceEncodingService.remove(id);
    return { success: true };
  }

  @Delete('employee/:employeeId')
  async removeByEmployeeId(@Param('employeeId') employeeId: string) {
    const result = await this.faceEncodingService.findByEmployeeId(employeeId);
    if (result) {
      await this.faceEncodingService.remove(result.id);
    }
    return { success: true };
  }

  @Post('sync-from-recognition-service')
  @HttpCode(HttpStatus.OK)
  async syncFromRecognitionService(@Body() syncData: {
    employee_id: string;
    encoding: string;
  }) {
    const createDto: CreateFaceEncodingDto = {
      employeeId: syncData.employee_id,
      encoding: syncData.encoding
    };
    
    // Check if encoding already exists for this employee
    const existing = await this.faceEncodingService.findByEmployeeId(syncData.employee_id);
    
    if (existing) {
      // Update existing encoding
      const updateDto: UpdateFaceEncodingDto = {
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
    } else {
      // Create new encoding
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

  @Post('process-registration')
  @HttpCode(HttpStatus.OK)
  async processFaceRegistration(@Body() registrationData: {
    employeeId: string;
    employeeName: string;
    videoFrames: string[];
  }) {
    try {
      // Call Python service for face processing
      const pythonResponse = await firstValueFrom(
        this.httpService.post('http://localhost:5000/process/register', {
          employee_id: registrationData.employeeId,
          employee_name: registrationData.employeeName,
          video_frames: registrationData.videoFrames
        })
      );

      if (pythonResponse.data.success) {
        // Save the processed encoding to database
        const createDto: CreateFaceEncodingDto = {
          employeeId: registrationData.employeeId,
          encoding: pythonResponse.data.encoding
        };

        // Check if encoding already exists
        const existing = await this.faceEncodingService.findByEmployeeId(registrationData.employeeId);
        
        if (existing) {
          // Update existing encoding
          const updateDto: UpdateFaceEncodingDto = {
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
        } else {
          // Create new encoding
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
      } else {
        return {
          success: false,
          message: pythonResponse.data.message || 'Face processing failed',
          processing_result: pythonResponse.data
        };
      }
    } catch (error) {
      console.error('Error calling Python service:', error);
      return {
        success: false,
        message: 'Failed to process face registration',
        error: error.message
      };
    }
  }

  @Post('process-recognition')
  @HttpCode(HttpStatus.OK)
  async processFaceRecognition(@Body() recognitionData: {
    image: string;
    employeeId?: string;
  }) {
    try {
      // Call Python service for face recognition
      const pythonResponse = await firstValueFrom(
        this.httpService.post('http://localhost:5000/process/checkin', {
          image: recognitionData.image,
          employee_id: recognitionData.employeeId
        })
      );

      if (pythonResponse.data.success) {
        return {
          success: true,
          recognition_results: pythonResponse.data,
          faces_detected: pythonResponse.data.faces_count,
          processing_result: pythonResponse.data
        };
      } else {
        return {
          success: false,
          message: pythonResponse.data.message || 'Face recognition failed',
          processing_result: pythonResponse.data
        };
      }
    } catch (error) {
      console.error('Error calling Python service:', error);
      return {
        success: false,
        message: 'Failed to process face recognition',
        error: error.message
      };
    }
  }

  @Get('employee/:employeeId/exists')
  async checkEmployeeFaceExists(@Param('employeeId') employeeId: string) {
    const encodings = await this.faceEncodingService.findByEmployeeId(employeeId);
    return {
      exists: !!encodings,
      count: encodings ? 1 : 0
    };
  }
} 