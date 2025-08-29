# Face Recognition Attendance System

A comprehensive facial recognition system for attendance tracking with video-based registration, advanced recognition algorithms, and NestJS backend integration.

## Features

- 🎥 **Video-based Registration**: Register faces using multiple video frames for better accuracy
- 🔍 **Advanced Recognition**: High-accuracy face recognition with confidence scoring
- 🔗 **NestJS Integration**: Seamless integration with NestJS backend for attendance management
- 📊 **Real-time Processing**: Fast recognition suitable for real-time attendance systems
- 🛡️ **Robust Error Handling**: Comprehensive error handling and validation
- 📈 **Quality Assessment**: Face quality scoring for better registration results

## System Requirements

- Python 3.8 or higher
- OpenCV compatible camera (for interactive features)
- At least 4GB RAM recommended
- Windows, macOS, or Linux

## Installation

1. **Clone or navigate to the face_attendance directory**:

   ```bash
   cd face_attendance
   ```

2. **Create and activate virtual environment**:

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Create environment configuration** (optional):
   ```bash
   # Copy and modify the example configuration
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

## Quick Start

### 1. Start the API Server

```bash
python main.py
```

The API server will start on `http://localhost:5000` by default.

### 2. Test the System

```bash
python main.py --test
```

### 3. Interactive Registration

```bash
python main.py --register
```

### 4. Interactive Recognition

```bash
python main.py --recognize
```

## API Endpoints

### Registration

#### Video-based Registration

```http
POST /register/video
Content-Type: application/json

{
  "employee_id": "EMP001",
  "employee_name": "John Doe",
  "video_frames": ["base64_frame1", "base64_frame2", ...],
  "sync_to_backend": true
}
```

#### Image-based Registration (Legacy)

```http
POST /register/images
Content-Type: application/json

{
  "employee_id": "EMP001",
  "employee_name": "John Doe",
  "images": ["base64_image1", "base64_image2", ...]
}
```

### Recognition

#### Recognize Faces

```http
POST /recognize
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

#### Verify Identity

```http
POST /verify
Content-Type: application/json

{
  "employee_id": "EMP001",
  "image": "base64_encoded_image"
}
```

### Attendance

#### Check-in with Face Recognition

```http
POST /attendance/check-in
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

### Management

#### Get System Statistics

```http
GET /stats
```

#### Health Check

```http
GET /health
```

#### Reload Face Data

```http
POST /reload
```

#### Remove Employee Face Data

```http
DELETE /employees/{employee_id}/face
```

## NestJS Backend Integration

The system automatically integrates with your NestJS backend for:

- Storing face encodings in the database
- Creating attendance records
- Synchronizing employee data

### Configuration

Set the NestJS backend URL in your environment:

```bash
export NESTJS_BASE_URL=http://localhost:3000
```

### Backend Endpoints Used

- `POST /face-encodings` - Store face encodings
- `POST /attendances` - Create attendance records

## Usage Examples

### Python Client Example

```python
import requests
import base64

# Register a face from video frames
def register_employee(employee_id, employee_name, video_frames_b64):
    response = requests.post('http://localhost:5000/register/video', json={
        'employee_id': employee_id,
        'employee_name': employee_name,
        'video_frames': video_frames_b64,
        'sync_to_backend': True
    })
    return response.json()

# Recognize faces in an image
def recognize_faces(image_b64):
    response = requests.post('http://localhost:5000/recognize', json={
        'image': image_b64
    })
    return response.json()

# Check-in attendance
def check_in_attendance(image_b64):
    response = requests.post('http://localhost:5000/attendance/check-in', json={
        'image': image_b64
    })
    return response.json()
```

### JavaScript/Frontend Example

```javascript
// Register employee with video frames
async function registerEmployee(employeeId, employeeName, videoFrames) {
  const response = await fetch("http://localhost:5000/register/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      employee_id: employeeId,
      employee_name: employeeName,
      video_frames: videoFrames,
      sync_to_backend: true,
    }),
  });
  return await response.json();
}

// Check attendance
async function checkAttendance(imageBase64) {
  const response = await fetch("http://localhost:5000/attendance/check-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageBase64,
    }),
  });
  return await response.json();
}
```

## Configuration Options

| Environment Variable         | Default                 | Description                           |
| ---------------------------- | ----------------------- | ------------------------------------- |
| `NESTJS_BASE_URL`            | `http://localhost:3000` | NestJS backend URL                    |
| `RECOGNITION_THRESHOLD`      | `0.5`                   | Face recognition threshold            |
| `CONFIDENCE_THRESHOLD`       | `0.6`                   | Minimum confidence for recognition    |
| `MIN_FACES_FOR_REGISTRATION` | `3`                     | Minimum faces needed for registration |
| `MAX_FACES_FOR_REGISTRATION` | `15`                    | Maximum faces to use for registration |
| `API_HOST`                   | `0.0.0.0`               | API server host                       |
| `API_PORT`                   | `5000`                  | API server port                       |

## File Structure

```
face_attendance/
├── src/
│   ├── api.py                    # Main Flask API
│   ├── video_registration.py     # Video-based registration
│   ├── advanced_recognition.py   # Advanced recognition system
│   ├── register.py              # Legacy registration
│   ├── recognition.py           # Legacy recognition
│   └── encoding.py              # Face encoding utilities
├── embeddings/                  # Face encoding storage
├── metadata/                    # Registration metadata
├── images/                      # Test images
├── main.py                      # Main entry point
├── config.py                    # Configuration management
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure your camera is not being used by another application
2. **Face not detected**: Ensure good lighting and face is clearly visible
3. **Low recognition accuracy**: Try re-registering with more video frames
4. **Backend connection failed**: Check if NestJS backend is running and accessible

### Performance Tips

1. **Registration**: Use 5-10 video frames with good lighting and different angles
2. **Recognition**: Ensure consistent lighting conditions
3. **Camera quality**: Higher resolution cameras generally provide better results
4. **Processing**: Close unnecessary applications to free up system resources

## Development

### Adding New Features

1. **New API endpoints**: Add to `src/api.py`
2. **Recognition algorithms**: Extend `src/advanced_recognition.py`
3. **Registration methods**: Extend `src/video_registration.py`

### Testing

Run the test suite:

```bash
python main.py --test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the employee management system and follows the same licensing terms.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check system requirements and dependencies
4. Ensure proper configuration
