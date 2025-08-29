import logging
import numpy as np
from flask import Flask, request, jsonify
import cv2
import base64
from PIL import Image
import io
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

def base64_to_image(base64_string: str):
    """Convert base64 string to OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to OpenCV format (BGR)
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        return opencv_image
    except Exception as e:
        logger.error(f"Error converting base64 to image: {e}")
        return None

def detect_faces(image):
    """Detect faces in image using OpenCV"""
    try:
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Load pre-trained face detection model
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        logger.info(f"Detected {len(faces)} faces")
        return faces
    except Exception as e:
        logger.error(f"Error in face detection: {e}")
        return []

def analyze_enhanced_face_quality(image_b64: str) -> float:
    """Analyze face quality with enhanced metrics"""
    try:
        image = base64_to_image(image_b64)
        if image is None:
            return 0.0
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = detect_faces(image)
        if len(faces) == 0:
            logger.warning("No faces detected for quality analysis")
            return 0.0
        
        # Get the largest face
        largest_face = max(faces, key=lambda x: x[2] * x[3])
        x, y, w, h = largest_face
        
        # Extract face region
        face_region = gray[y:y+h, x:x+w]
        
        # Quality metrics
        quality_scores = []
        
        # 1. Size score (larger faces are better)
        size_score = min(1.0, (w * h) / (100 * 100))  # Normalize to 100x100
        quality_scores.append(size_score)
        
        # 2. Position score (center faces are better)
        img_center_x, img_center_y = image.shape[1] // 2, image.shape[0] // 2
        face_center_x, face_center_y = x + w // 2, y + h // 2
        
        distance_from_center = np.sqrt((face_center_x - img_center_x)**2 + (face_center_y - img_center_y)**2)
        max_distance = np.sqrt((image.shape[1] // 2)**2 + (image.shape[0] // 2)**2)
        position_score = max(0.0, 1.0 - (distance_from_center / max_distance))
        quality_scores.append(position_score)
        
        # 3. Sharpness score using Laplacian variance
        laplacian_var = cv2.Laplacian(face_region, cv2.CV_64F).var()
        sharpness_score = min(1.0, laplacian_var / 500.0)  # Normalize to typical range
        quality_scores.append(sharpness_score)
        
        # 4. Contrast score
        contrast_score = np.std(face_region) / 128.0  # Normalize to 0-1
        quality_scores.append(min(1.0, contrast_score))
        
        # Calculate overall quality as average
        overall_quality = np.mean(quality_scores)
        
        logger.info(f"Quality scores - Size: {size_score:.3f}, Position: {position_score:.3f}, Sharpness: {sharpness_score:.3f}, Contrast: {contrast_score:.3f}, Overall: {overall_quality:.3f}")
        
        return float(overall_quality)
        
    except Exception as e:
        logger.error(f"Error in enhanced face quality analysis: {e}")
        return 0.0

def extract_face_features(image_b64: str) -> List[float]:
    """Extract real face features for recognition"""
    try:
        image = base64_to_image(image_b64)
        if image is None:
            return []
        
        # Detect faces
        faces = detect_faces(image)
        if len(faces) == 0:
            logger.warning("No faces detected for feature extraction")
            return []
        
        # Get the largest face
        largest_face = max(faces, key=lambda x: x[2] * x[3])
        x, y, w, h = largest_face
        
        # Extract face region
        face_region = image[y:y+h, x:x+w]
        
        # Resize to standard size for consistent features
        face_region = cv2.resize(face_region, (128, 128))
        
        # Convert to grayscale
        gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        features = []
        
        # 1. Histogram features (more detailed)
        hist = cv2.calcHist([gray_face], [0], None, [32], [0, 256])
        hist_normalized = hist.flatten() / (hist.sum() + 1e-8)
        features.extend(hist_normalized.tolist())
        
        # 2. Edge density features (multiple scales)
        for scale in [1, 2, 4]:
            resized = cv2.resize(gray_face, (128//scale, 128//scale))
            edges = cv2.Canny(resized, 50, 150)
            edge_density = np.sum(edges > 0) / (resized.shape[0] * resized.shape[1])
            features.append(float(edge_density))
        
        # 3. Texture features using Gabor filters
        angles = [0, 45, 90, 135]
        for angle in angles:
            kernel = cv2.getGaborKernel((21, 21), 8.0, np.radians(angle), 10.0, 0.5, 0, ktype=cv2.CV_32F)
            filtered = cv2.filter2D(gray_face, cv2.CV_8UC3, kernel)
            texture_score = np.mean(filtered) / 255.0
            features.append(float(texture_score))
        
        # 4. Local Binary Pattern approximation
        lbp_features = []
        for i in range(0, 128, 16):
            for j in range(0, 128, 16):
                block = gray_face[i:i+16, j:j+16]
                if block.shape == (16, 16):
                    # Simple texture measure
                    grad_x = cv2.Sobel(block, cv2.CV_64F, 1, 0, ksize=3)
                    grad_y = cv2.Sobel(block, cv2.CV_64F, 0, 1, ksize=3)
                    gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
                    lbp_features.append(float(np.mean(gradient_magnitude) / 255.0))
        
        features.extend(lbp_features[:16])  # Limit to 16 features
        
        # 5. Brightness and contrast features
        brightness = np.mean(gray_face) / 255.0
        contrast = np.std(gray_face) / 255.0
        features.extend([float(brightness), float(contrast)])
        
        # 6. Shape features
        # Calculate face aspect ratio and position
        aspect_ratio = w / (h + 1e-8)
        features.append(float(aspect_ratio))
        
        # 7. Color features (from original color image)
        face_color = face_region
        # Convert to different color spaces
        hsv = cv2.cvtColor(face_color, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(face_color, cv2.COLOR_BGR2LAB)
        
        # HSV features
        h_mean, s_mean, v_mean = np.mean(hsv, axis=(0, 1))
        features.extend([float(h_mean/179.0), float(s_mean/255.0), float(v_mean/255.0)])
        
        # LAB features
        l_mean, a_mean, b_mean = np.mean(lab, axis=(0, 1))
        features.extend([float(l_mean/255.0), float(a_mean/255.0), float(b_mean/255.0)])
        
        logger.info(f"Extracted {len(features)} real features from face")
        return features
        
    except Exception as e:
        logger.error(f"Error in face feature extraction: {e}")
        return []

def calculate_face_similarity(features1: List[float], features2: List[float]) -> float:
    """Calculate similarity between two face feature vectors"""
    try:
        if len(features1) != len(features2):
            logger.warning(f"Feature length mismatch: {len(features1)} vs {len(features2)}")
            return 0.0
        
        # Convert to numpy arrays
        f1 = np.array(features1, dtype=np.float32)
        f2 = np.array(features2, dtype=np.float32)
        
        # Normalize features
        f1_norm = f1 / (np.linalg.norm(f1) + 1e-8)
        f2_norm = f2 / (np.linalg.norm(f2) + 1e-8)
        
        # Calculate cosine similarity
        similarity = np.dot(f1_norm, f2_norm)
        
        # Convert to similarity score (0-1)
        similarity_score = (similarity + 1) / 2
        
        logger.info(f"Face similarity calculated: {similarity_score:.3f}")
        return float(similarity_score)
        
    except Exception as e:
        logger.error(f"Error calculating face similarity: {e}")
        return 0.0

def calculate_overall_quality(video_frames: List[str]) -> float:
    """Calculate overall quality from multiple video frames"""
    try:
        if not video_frames:
            return 0.0
        
        qualities = []
        for i, frame in enumerate(video_frames[:5]):  # Use first 5 frames
            quality = analyze_enhanced_face_quality(frame)
            qualities.append(quality)
            logger.info(f"Frame {i+1} quality: {quality:.3f}")
        
        overall_quality = np.mean(qualities)
        logger.info(f"Overall video quality: {overall_quality:.3f}")
        
        return float(overall_quality)
        
    except Exception as e:
        logger.error(f"Error calculating overall quality: {e}")
        return 0.0

def create_enhanced_face_encoding(employee_id: str, employee_name: str, video_frames: List[str]) -> str:
    """Create enhanced face encoding from video frames with real features"""
    try:
        if not video_frames:
            raise ValueError("No video frames provided")
        
        # Calculate overall quality
        overall_quality = calculate_overall_quality(video_frames)
        
        # Use the best frame for encoding (highest quality)
        best_frame = None
        best_quality = 0
        
        for i, frame in enumerate(video_frames[:5]):  # Check first 5 frames
            quality = analyze_enhanced_face_quality(frame)
            if quality > best_quality:
                best_quality = quality
                best_frame = frame
        
        if not best_frame:
            raise ValueError("No suitable frame found for encoding")
        
        # Extract real features from best frame
        real_features = extract_face_features(best_frame)
        
        if len(real_features) == 0:
            raise ValueError("Failed to extract features from best frame")
        
        # Create encoding data with real features - SIMPLIFIED FORMAT
        encoding_data = {
            "employee_id": employee_id,
            "employee_name": employee_name,
            "quality": best_quality,
            "frame_count": len(video_frames),
            "features": real_features,  # Store real features as array
            "feature_count": len(real_features),
            "timestamp": "2025-08-17T06:53:41Z",
            "encoding_type": "enhanced_features"
        }
        
        # Convert to JSON string first, then base64
        import json
        encoding_json = json.dumps(encoding_data, separators=(',', ':'))  # Compact JSON
        encoding_b64 = base64.b64encode(encoding_json.encode('utf-8')).decode('utf-8')
        
        logger.info(f"Created enhanced encoding for {employee_name} with {len(real_features)} real features, quality: {best_quality:.3f}")
        logger.info(f"JSON encoding length: {len(encoding_json)} characters")
        logger.info(f"Base64 encoding length: {len(encoding_b64)} characters")
        
        return encoding_b64
        
    except Exception as e:
        logger.error(f"Error creating enhanced face encoding: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Face Recognition Processing Service",
        "version": "2.0.0",
        "description": "Enhanced face processing tool for employee management system"
    })

@app.route('/process/register', methods=['POST'])
def process_face_registration():
    """Process face registration from video frames"""
    try:
        logger.info("Processing face registration request")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Accept both snake_case and camelCase field names
        employee_id = data.get('employeeId') or data.get('employee_id')
        employee_name = data.get('employeeName') or data.get('employee_name')
        video_frames = data.get('videoFrames') or data.get('video_frames', [])
        
        logger.info(f"Received data - employee_id: {employee_id}, employee_name: {employee_name}, video_frames: {len(video_frames)}")
        
        if not employee_id or not employee_name:
            logger.error(f"Missing required fields - employee_id: {employee_id}, employee_name: {employee_name}")
            return jsonify({"success": False, "error": "Missing employeeId or employeeName"}), 400
        
        if not video_frames:
            return jsonify({"success": False, "error": "No video frames provided"}), 400
        
        logger.info(f"Processing registration for {employee_name} (ID: {employee_id}) with {len(video_frames)} frames")
        
        # Create enhanced face encoding
        encoding = create_enhanced_face_encoding(employee_id, employee_name, video_frames)
        
        # Calculate quality metrics
        overall_quality = calculate_overall_quality(video_frames)
        
        # Prepare response
        response_data = {
            "success": True,
            "encoding": encoding,
            "quality_score": overall_quality,
            "debug_info": {
                "service_version": "2.0.0",
                "frames_processed": len(video_frames),
                "quality_threshold_passed": overall_quality >= 0.3,
                "processing_timestamp": "2025-08-17T06:53:41Z"
            }
        }
        
        # Convert numpy types before JSON serialization
        response_data = convert_numpy_types(response_data)
        
        logger.info(f"Registration successful for {employee_name}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in face registration: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/process/recognize', methods=['POST'])
def process_face_recognition():
    """Process face recognition from image"""
    try:
        logger.info("Processing face recognition request")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        image = data.get('image')
        if not image:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        logger.info(f"Processing recognition for image of size {len(image)} characters")
        
        # Analyze face quality
        face_quality = analyze_enhanced_face_quality(image)
        
        # Extract face features
        face_features = extract_face_features(image)
        
        # Detect faces
        cv_image = base64_to_image(image)
        faces_detected = len(detect_faces(cv_image)) if cv_image is not None else 0
        
        # Prepare response
        response_data = {
            "success": True,
            "face_detected": faces_detected > 0,
            "faces_count": faces_detected,
            "face_quality": face_quality,
            "face_features": face_features,
            "debug_info": {
                "service_version": "2.0.0",
                "image_size": len(image),
                "quality_threshold_passed": face_quality >= 0.3,
                "features_extracted": len(face_features),
                "processing_timestamp": "2025-08-17T06:53:41Z"
            }
        }
        
        # Convert numpy types before JSON serialization
        response_data = convert_numpy_types(response_data)
        
        logger.info(f"Recognition successful - Faces: {faces_detected}, Quality: {face_quality:.3f}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in face recognition: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/process/checkin', methods=['POST'])
def process_face_checkin():
    """Process face check-in and return features for matching"""
    try:
        logger.info("Processing face check-in request")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Accept both snake_case and camelCase field names
        image = data.get('image') or data.get('image_data')
        if not image:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        logger.info(f"Processing check-in for image of size {len(image)} characters")
        
        # Analyze face quality
        face_quality = analyze_enhanced_face_quality(image)
        
        # Extract face features
        face_features = extract_face_features(image)
        
        # Detect faces
        cv_image = base64_to_image(image)
        faces_detected = len(detect_faces(cv_image)) if cv_image is not None else 0
        
        if faces_detected == 0:
            return jsonify({
                "success": False,
                "error": "No face detected in image"
            }), 400
        
        if face_quality < 0.3:
            return jsonify({
                "success": False,
                "error": f"Face quality too low: {face_quality:.2f} (minimum: 0.3)"
            }), 400
        
        # Prepare response with features for matching
        response_data = {
            "success": True,
            "face_detected": True,
            "faces_count": faces_detected,
            "face_quality": face_quality,
            "face_features": face_features,
            "debug_info": {
                "service_version": "2.0.0",
                "image_size": len(image),
                "quality_threshold_passed": face_quality >= 0.3,
                "features_extracted": len(face_features),
                "processing_timestamp": "2025-08-17T06:53:41Z"
            }
        }
        
        # Convert numpy types before JSON serialization
        response_data = convert_numpy_types(response_data)
        
        logger.info(f"Check-in processing successful - Faces: {faces_detected}, Quality: {face_quality:.3f}, Features: {len(face_features)}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in face check-in: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("Starting Enhanced Face Recognition Processing Service...")
    logger.info("Service will run on http://localhost:5000")
    logger.info("Endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /process/register - Process face registration")
    logger.info("  POST /process/recognize - Process face recognition")
    
    app.run(host='0.0.0.0', port=5000, debug=True) 