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
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { AttendanceService } from '../../services/attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from '../dto/attendance.dto';
import { AttendanceResponseDto, AttendanceListResponseDto, AttendanceStatsDto } from '../responses/attendance-response.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly httpService: HttpService
  ) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
  ): Promise<AttendanceListResponseDto> {
    return this.attendanceService.findAll(page, limit, employeeId, date);
  }

  @Get('stats')
  getStats(): Promise<AttendanceStatsDto> {
    return this.attendanceService.getStats();
  }

  @Get('employee/:employeeId')
  findByEmployeeId(
    @Param('employeeId') employeeId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<AttendanceListResponseDto> {
    return this.attendanceService.findByEmployeeId(employeeId, page, limit);
  }

  @Get('date/:date')
  findByDate(
    @Param('date') date: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<AttendanceListResponseDto> {
    return this.attendanceService.findByDate(date, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AttendanceResponseDto> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateAttendanceDto: UpdateAttendanceDto
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Post(':id/checkout')
  @HttpCode(HttpStatus.OK)
  checkOut(
    @Param('id') id: string,
    @Body() checkOutData?: { checkOutTime?: string }
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.checkOut(id, checkOutData?.checkOutTime);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.attendanceService.remove(id);
  }

  @Delete('employee/:employeeId')
  removeByEmployeeId(@Param('employeeId') employeeId: string): Promise<void> {
    return this.attendanceService.removeByEmployeeId(employeeId);
  }

  @Post('face-recognition-checkin')
  @HttpCode(HttpStatus.CREATED)
  async faceRecognitionCheckin(@Body() checkinData: {
    image: string;
    timestamp?: string;
  }): Promise<AttendanceResponseDto> {
    console.log('🔍 Starting face recognition check-in process...');
    console.log(`📸 Image size: ${checkinData.image.length} characters`);
    
    try {
      // Step 1: Call Python service for face processing and feature extraction
      console.log('🚀 Calling Python service for face recognition...');
      
      let pythonResponse;
      try {
        pythonResponse = await firstValueFrom(
          this.httpService.post('http://localhost:5000/process/checkin', {
            image: checkinData.image
          })
        );
      } catch (httpError) {
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

      // Step 2: Get face quality and features from Python
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

      // Step 3: Query database to get all face encodings for comparison
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
        
      } catch (dbError) {
        console.error('❌ Database query failed:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log(`📊 Found ${allFaceEncodings.length} face encodings in database`);
      
      if (allFaceEncodings.length === 0) {
        console.error('❌ No face encodings found in database');
        throw new Error('No face encodings found in database. Please register faces first.');
      }
      
      // Check if encodings have valid data
      const validEncodings = allFaceEncodings.filter(e => e.encoding && e.encoding.length > 0);
      console.log(`📊 Valid encodings (with data): ${validEncodings.length}`);
      
      if (validEncodings.length === 0) {
        console.error('❌ No valid encodings found - all encodings are empty');
        throw new Error('All face encodings in database are empty. Please re-register faces.');
      }

      // Step 4: Real face recognition comparison
      console.log('🧠 Starting real face recognition comparison...');
      console.log(`🔍 Input features length: ${inputFaceFeatures.length}`);
      console.log(`🔍 Input features sample: ${inputFaceFeatures.slice(0, 5)}`);
      
      let bestMatch: any = null;
      let bestConfidence = 0;
      let recognitionMethod = 'feature_comparison';
      let allSimilarities: Array<{employee: any, confidence: number}> = [];

      // Compare input features with all stored encodings
      for (const encoding of allFaceEncodings) {
        if (encoding.employee && encoding.encoding) {
          try {
            console.log(`🔍 Processing encoding for ${encoding.employee.fullName}`);
            console.log(`🔍 Stored encoding type: ${typeof encoding.encoding}`);
            console.log(`🔍 Stored encoding length: ${encoding.encoding.length}`);
            
            // Use the helper method from face encoding service
            const storedFeatures = await this.attendanceService['prismaService'].faceEncoding.findMany({
              include: { employee: true }
            }).then(async (encodings) => {
              // Find the current encoding and extract features
              const currentEncoding = encodings.find(e => e.id === encoding.id);
              if (currentEncoding && currentEncoding.encoding) {
                // Import the face encoding service to use the helper method
                const { FaceEncodingService } = await import('../../../face-encodings/services/face-encoding.service');
                const faceEncodingService = new FaceEncodingService(this.attendanceService['prismaService']);
                // Convert to Buffer if it's not already
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
              // Calculate similarity using cosine distance
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
            } else {
              console.warn(`⚠️ Feature length mismatch for ${encoding.employee.fullName}: stored=${storedFeatures.length}, input=${inputFaceFeatures.length}`);
              if (storedFeatures.length === 0) {
                console.warn(`⚠️ No features extracted from stored encoding`);
              }
            }
          } catch (compareError) {
            console.warn(`⚠️ Error comparing with ${encoding.employee.fullName}:`, compareError);
          }
        } else {
          console.warn(`⚠️ Skipping encoding - missing employee or encoding data`);
        }
      }

      // Sort similarities for debugging
      allSimilarities.sort((a, b) => b.confidence - a.confidence);
      console.log('📊 All similarities:', allSimilarities.map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
      console.log('📊 Top 3 similarities:', allSimilarities.slice(0, 3).map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));

      // Step 5: Check if we have a confident match
      const confidenceThreshold = 0.5; // Giảm threshold để dễ nhận diện hơn
      
      if (!bestMatch || bestConfidence < confidenceThreshold) {
        console.error(`❌ No confident match found. Best confidence: ${bestConfidence.toFixed(3)} (threshold: ${confidenceThreshold})`);
        console.error(`❌ Total encodings processed: ${allFaceEncodings.length}`);
        console.error(`❌ Valid comparisons made: ${allSimilarities.length}`);
        if (allSimilarities.length > 0) {
          console.error(`❌ Best similarity: ${allSimilarities[0].employee.fullName} (${allSimilarities[0].confidence.toFixed(3)})`);
        }
        
        if (bestMatch && bestConfidence > 0.3) {
          throw new Error(`Nhận diện kém (${(bestConfidence * 100).toFixed(1)}%). Vui lòng thử lại với ánh sáng tốt hơn.`);
        } else {
          throw new Error(`Không tìm thấy nhân viên. Vui lòng đăng ký khuôn mặt trước.`);
        }
      }

      console.log(`✅ Confident match found: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);

      // Step 6: Validate employee exists and is active
      console.log(`✅ Employee validated: ${bestMatch.fullName} (ID: ${bestMatch.id})`);
      
      if (!bestMatch.fullName || !bestMatch.email) {
        console.error('❌ Employee data incomplete');
        throw new Error('Employee data incomplete');
      }

      // Step 7: Create attendance record
      const createDto: CreateAttendanceDto = {
        employeeId: bestMatch.id,
        checkIn: checkinData.timestamp ? checkinData.timestamp : new Date().toISOString()
      };
      
      console.log('📝 Creating attendance record:', createDto);
      
      let attendance;
      try {
        attendance = await this.attendanceService.create(createDto);
      } catch (attendanceError) {
        console.error('❌ Failed to create attendance:', attendanceError);
        throw new Error(`Attendance creation failed: ${attendanceError.message}`);
      }
      
      console.log('✅ Attendance record created successfully');
      
      // Step 8: Return enhanced attendance with recognition info
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
      return result as any;
    } catch (error) {
      console.error('💥 Error in face recognition check-in:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw new HttpException(
        `Error: Face recognition check-in failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private calculateCosineSimilarity(features1: number[], features2: number[]): number {
    try {
      if (features1.length !== features2.length) {
        console.warn(`⚠️ Feature length mismatch: ${features1.length} vs ${features2.length}`);
        return 0.0;
      }

      // Calculate dot product
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

      // Calculate cosine similarity (range: -1 to 1)
      const rawSimilarity = dotProduct / (norm1 * norm2);
      
      // Convert to 0-1 range using absolute value approach
      // This is more suitable for face recognition
      const normalizedSimilarity = Math.abs(rawSimilarity);
      
      // Add some debug info for first few comparisons
      if (Math.random() < 0.1) { // Log 10% of comparisons for debugging
        console.log(`🔍 Similarity debug: raw=${rawSimilarity.toFixed(4)}, normalized=${normalizedSimilarity.toFixed(4)}`);
      }
      
      return Math.max(0, Math.min(1, normalizedSimilarity));
    } catch (error) {
      console.error('Error calculating cosine similarity:', error);
      return 0.0;
    }
  }

  @Get('employee/:employeeId/active-today')
  @HttpCode(HttpStatus.OK)
  async findActiveAttendanceToday(@Param('employeeId') employeeId: string): Promise<any> {
    try {
      console.log(`🔍 Finding active attendance for employee ${employeeId} today`);
      
      const today = new Date().toISOString().split('T')[0];
      const attendances = await this.attendanceService.findAll(1, 100, employeeId, today);
      
      // Find active (not checked out) attendance
      const activeAttendance = attendances.attendances.find(att => !att.checkOut);
      
      if (activeAttendance) {
        console.log(`✅ Found active attendance: ${activeAttendance.id}`);
        return {
          success: true,
          attendance: activeAttendance,
          message: 'Active attendance found'
        };
      } else {
        console.log(`❌ No active attendance found for employee ${employeeId} today`);
        return {
          success: false,
          attendance: null,
          message: 'No active attendance found'
        };
      }
    } catch (error) {
      console.error('Error finding active attendance:', error);
      throw new HttpException(
        `Error finding active attendance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('employee/:employeeId/debug')
  @HttpCode(HttpStatus.OK)
  async debugEmployeeAttendance(@Param('employeeId') employeeId: string): Promise<any> {
    try {
      console.log(`🔍 Debug: Finding all attendances for employee ${employeeId}`);
      
      // Get all attendances for this employee (no date filter)
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
      
      // Get today's date range
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      console.log(`📅 Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
      
      // Filter today's attendances
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
          checkOut: (att as any).checkOut,
          createdAt: att.createdAt,
          updatedAt: (att as any).updatedAt,
          employeeName: att.employee?.fullName
        })),
        todayAttendancesList: todayAttendances.map(att => ({
          id: att.id,
          checkIn: att.checkIn,
          checkOut: (att as any).checkOut,
          createdAt: att.createdAt,
          updatedAt: (att as any).updatedAt,
          employeeName: att.employee?.fullName
        }))
      };
    } catch (error) {
      console.error('Error debugging employee attendance:', error);
      throw new HttpException(
        `Error debugging employee attendance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('employee/:employeeId/checkout-today')
  @HttpCode(HttpStatus.OK)
  async checkoutEmployeeToday(
    @Param('employeeId') employeeId: string,
    @Body() checkOutData?: { checkOutTime?: string }
  ): Promise<any> {
    try {
      console.log(`🔍 Checking out employee ${employeeId} today`);
      
      // Get today's date in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      console.log(`📅 Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`);
      
      // Find attendance for today using date range
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
      
      // Debug: Log all attendances
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
      
      // Find active (not checked out) attendance
      const activeAttendance = attendances.find(att => !(att as any).checkOut);
      
      if (activeAttendance) {
        console.log(`✅ Found active attendance: ${activeAttendance.id}`);
        console.log(`📋 Active attendance details:`, {
          id: activeAttendance.id,
          employeeId: (activeAttendance as any).employeeId,
          checkIn: activeAttendance.checkIn,
          checkOut: (activeAttendance as any).checkOut,
          createdAt: activeAttendance.createdAt,
          updatedAt: (activeAttendance as any).updatedAt,
          employeeName: activeAttendance.employee?.fullName
        });
        
        // Perform check-out
        const checkOutResult = await this.attendanceService.checkOut(
          activeAttendance.id,
          checkOutData?.checkOutTime
        );
        
        console.log(`✅ Check-out successful for attendance ${activeAttendance.id}`);
        
        return {
          success: true,
          attendance: checkOutResult,
          message: 'Check-out successful'
        };
      } else {
        console.log(`❌ No active attendance found for employee ${employeeId} today`);
        console.log(`🔍 All attendances for today:`, attendances.map(att => ({
          id: att.id,
          checkIn: att.checkIn,
          checkOut: (att as any).checkOut,
          hasCheckOut: !!(att as any).checkOut,
          employeeName: att.employee?.fullName
        })));
        
        return {
          success: false,
          attendance: null,
          message: 'No active attendance found to check-out'
        };
      }
    } catch (error) {
      console.error('Error during check-out:', error);
      throw new HttpException(
        `Error during check-out: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('face-recognition-only')
  @HttpCode(HttpStatus.OK)
  async faceRecognitionOnly(@Body() recognitionData: {
    image: string;
  }): Promise<any> {
    console.log('🔍 Starting face recognition only (no attendance creation)...');
    console.log(`📸 Image size: ${recognitionData.image.length} characters`);
    
    try {
      // Step 1: Call Python service for face processing and feature extraction
      console.log('🚀 Calling Python service for face recognition...');
      
      let pythonResponse;
      try {
        pythonResponse = await firstValueFrom(
          this.httpService.post('http://localhost:5000/process/checkin', {
            image: recognitionData.image
          })
        );
      } catch (httpError) {
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

      // Step 2: Get face quality and features from Python
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

      // Step 3: Query database to get all face encodings for comparison
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
        
      } catch (dbError) {
        console.error('❌ Database query failed:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      if (!allFaceEncodings || allFaceEncodings.length === 0) {
        throw new Error('No face encodings found in database');
      }

      console.log(`📊 Found ${allFaceEncodings.length} face encodings in database`);

      // Step 4: Compare input face with all stored encodings
      console.log('🔍 Comparing face features with database...');
      console.log(`📊 Input features length: ${inputFaceFeatures.length}`);
      console.log(`📊 Input features sample: [${inputFaceFeatures.slice(0, 5).map(f => f.toFixed(3)).join(', ')}...]`);
      
      let bestMatch: any = null;
      let bestConfidence = 0;
      let recognitionMethod = 'feature_comparison';
      const allSimilarities: any[] = [];

      for (const encoding of allFaceEncodings) {
        if (encoding.employee && encoding.encoding) {
          try {
            console.log(`🔍 Processing encoding for ${encoding.employee.fullName}`);
            console.log(`🔍 Stored encoding type: ${typeof encoding.encoding}`);
            console.log(`🔍 Stored encoding length: ${encoding.encoding.length}`);
            
            // Use the helper method from face encoding service (same as check-in)
            const storedFeatures = await this.attendanceService['prismaService'].faceEncoding.findMany({
              include: { employee: true }
            }).then(async (encodings) => {
              // Find the current encoding and extract features
              const currentEncoding = encodings.find(e => e.id === encoding.id);
              if (currentEncoding && currentEncoding.encoding) {
                // Import the face encoding service to use the helper method
                const { FaceEncodingService } = await import('../../../face-encodings/services/face-encoding.service');
                const faceEncodingService = new FaceEncodingService(this.attendanceService['prismaService']);
                // Convert to Buffer if it's not already
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
              // Calculate similarity using cosine distance
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
            } else {
              console.warn(`⚠️ Feature length mismatch for ${encoding.employee.fullName}: stored=${storedFeatures.length}, input=${inputFaceFeatures.length}`);
              if (storedFeatures.length === 0) {
                console.warn(`⚠️ No features extracted from stored encoding`);
              }
            }
          } catch (compareError) {
            console.warn(`⚠️ Error comparing with ${encoding.employee.fullName}:`, compareError);
          }
        } else {
          console.warn(`⚠️ Skipping encoding - missing employee or encoding data`);
        }
      }

      // Sort similarities for debugging
      allSimilarities.sort((a, b) => b.confidence - a.confidence);
      console.log('📊 All similarities:', allSimilarities.map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));
      console.log('📊 Top 3 similarities:', allSimilarities.slice(0, 3).map(s => `${s.employee.fullName}: ${s.confidence.toFixed(3)}`));

      // Step 5: Check if we have a confident match
      const confidenceThreshold = 0.5; // Giảm threshold để dễ nhận diện hơn
      
      if (!bestMatch || bestConfidence < confidenceThreshold) {
        console.error(`❌ No confident match found. Best confidence: ${bestConfidence.toFixed(3)} (threshold: ${confidenceThreshold})`);
        console.error(`❌ Total encodings processed: ${allFaceEncodings.length}`);
        console.error(`❌ Valid comparisons made: ${allSimilarities.length}`);
        if (allSimilarities.length > 0) {
          console.error(`❌ Best similarity: ${allSimilarities[0].employee.fullName} (${allSimilarities[0].confidence.toFixed(3)})`);
        }
        
        if (bestMatch && bestConfidence > 0.3) {
          throw new Error(`Nhận diện kém (${(bestConfidence * 100).toFixed(1)}%). Vui lòng thử lại với ánh sáng tốt hơn.`);
        } else {
          throw new Error(`Không tìm thấy nhân viên. Vui lòng đăng ký khuôn mặt trước.`);
        }
      }

      console.log(`✅ Employee recognized: ${bestMatch.fullName} (confidence: ${bestConfidence.toFixed(3)})`);

      // Return only recognition info without creating attendance
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
    } catch (error) {
      console.error('💥 Error in face recognition only:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw new HttpException(
        `Error: Face recognition failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}