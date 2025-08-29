import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import {
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  FaceSmileIcon,
  EyeIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";

const CheckIn: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<
    "idle" | "scanning" | "processing" | "success" | "error"
  >("idle");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Auto-start scanning when both states are true
  useEffect(() => {
    if (isActive && cameraActive) {
      console.log("🎯 Both states are true, starting auto scanning");
      startAutoScanning();
    }
  }, [isActive, cameraActive]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setIsActive(true);

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setError("Lỗi camera xảy ra");
          setScanningStatus("error");
        };
      }
    } catch (error) {
      setError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.");
      setScanningStatus("error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }
    setCameraActive(false);
    setIsActive(false);
    stopAutoScanning();
  };

  const startAutoScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setScanningStatus("scanning");

    // Scan every 2 seconds for faces
    scanIntervalRef.current = setInterval(() => {
      if (isActive && !isProcessing) {
        scanForFace();
      }
    }, 2000);
  };

  const stopAutoScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanningStatus("idle");
  };

  const scanForFace = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return;
    }

    const now = Date.now();
    // Prevent scanning too frequently
    if (now - lastScanTimeRef.current < 3000) {
      return;
    }
    lastScanTimeRef.current = now;

    try {
      setScanningStatus("scanning");

      // Capture frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);

      // Simulate face detection
      const hasFace = await detectFaceInImage(imageData);

      if (hasFace) {
        setFaceDetected(true);
        setScanningStatus("processing");

        // Auto-check-in
        await performAutoCheckIn(imageData);
      } else {
        setFaceDetected(false);
        setScanningStatus("scanning");
      }
    } catch (error) {
      setScanningStatus("error");
    }
  };

  const detectFaceInImage = async (imageData: string): Promise<boolean> => {
    try {
      // Method 1: Try to use Face-API.js if available
      if (typeof window !== "undefined" && (window as any).faceapi) {
        try {
          const faceapi = (window as any).faceapi;
          const img = await faceapi.bufferToImage(imageData);
          const detections = await faceapi.detectAllFaces(img);
          return detections.length > 0;
        } catch (faceApiError) {
          // Fallback to enhanced detection
        }
      }

      // Method 2: Enhanced canvas-based face detection
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(false);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Enhanced face detection with multiple algorithms
          let faceScore = 0;
          let totalPixels = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Algorithm 1: Enhanced skin tone detection
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              Math.abs(r - g) > 15 &&
              r > g &&
              r > b
            ) {
              faceScore += 1.0;
            }

            // Algorithm 2: Look for darker areas (eyes, eyebrows, hair)
            if (r < 80 && g < 80 && b < 80) {
              faceScore += 0.5;
            }

            // Algorithm 3: Look for brighter areas (cheeks, forehead)
            if (r > 200 && g > 150 && b > 100) {
              faceScore += 0.3;
            }

            // Algorithm 4: Look for natural skin variations
            if (
              r > 120 &&
              g > 80 &&
              b > 60 &&
              Math.abs(r - g) > 10 &&
              Math.abs(r - b) > 20
            ) {
              faceScore += 0.2;
            }
          }

          // Calculate face probability with lower threshold
          const faceRatio = faceScore / totalPixels;
          const hasFace = faceRatio > 0.12; // Lower threshold for better detection

          resolve(hasFace);
        };

        img.onerror = () => {
          resolve(false);
        };
      });
    } catch (error) {
      return false;
    }
  };

  const performAutoCheckIn = async (imageData: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanningStatus("processing");

    try {
      const result = await apiService.checkInWithFace(
        imageData,
        new Date().toISOString()
      );

      setLastResult(result);
      setScanningStatus("success");
      setError(null);

      // Auto-reset after 5 seconds
      setTimeout(() => {
        setScanningStatus("scanning");
        setLastResult(null);
      }, 5000);
    } catch (error: any) {
      // Xử lý các trường hợp lỗi cụ thể
      let errorMessage = "Điểm danh thất bại";

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;

        // Kiểm tra các trường hợp cụ thể
        if (
          backendMessage.includes("already checked in") ||
          backendMessage.includes("đã điểm danh") ||
          backendMessage.includes("already exists")
        ) {
          errorMessage = "Bạn đã điểm danh rồi! Không cần điểm danh lại.";
        } else if (
          backendMessage.includes("face not found") ||
          backendMessage.includes("không tìm thấy khuôn mặt") ||
          backendMessage.includes("Nhận diện kém")
        ) {
          errorMessage = backendMessage; // Sử dụng message từ backend
        } else if (
          backendMessage.includes("employee not found") ||
          backendMessage.includes("không tìm thấy nhân viên")
        ) {
          errorMessage =
            "Không tìm thấy thông tin nhân viên. Vui lòng đăng ký khuôn mặt trước.";
        } else {
          // Sử dụng message từ backend nếu có
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        // Xử lý lỗi network hoặc lỗi khác
        if (
          error.message.includes("Network Error") ||
          error.message.includes("timeout")
        ) {
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setScanningStatus("error");

      // Auto-reset error after 5 seconds
      setTimeout(() => {
        setScanningStatus("scanning");
        setError(null);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = () => {
    switch (scanningStatus) {
      case "idle":
        return "bg-gray-500";
      case "scanning":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (scanningStatus) {
      case "idle":
        return "Đang khởi động...";
      case "scanning":
        return "Đang quét khuôn mặt...";
      case "processing":
        return "Đang xử lý điểm danh...";
      case "success":
        return "Điểm danh thành công!";
      case "error":
        return "Có lỗi xảy ra";
      default:
        return "Đang khởi động...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hệ thống điểm danh tự động
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chỉ cần đưa mặt vào camera - hệ thống sẽ tự động quét và điểm danh!
            Không cần thao tác gì thêm.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Camera Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CameraIcon className="h-6 w-6" />
                Camera tự động
              </CardTitle>
              <CardDescription className="text-blue-100">
                Camera đang hoạt động và tự động quét khuôn mặt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}
                ></div>
                <span className="font-medium text-gray-700">
                  {getStatusText()}
                </span>
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={startCamera}
                  disabled={cameraActive}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Khởi động camera
                </Button>
                <Button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  variant="outline"
                  className="flex-1"
                >
                  Dừng camera
                </Button>
              </div>

              {/* Video Display */}
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-80 bg-gray-900 rounded-lg"
                  style={{ transform: "scaleX(-1)" }}
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Face Detection Overlay */}
                {faceDetected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-green-500 bg-opacity-20 border-4 border-green-500 rounded-full p-8 animate-pulse">
                      <FaceSmileIcon className="h-16 w-16 text-green-500" />
                    </div>
                  </div>
                )}

                {/* Scanning Overlay */}
                {scanningStatus === "scanning" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-blue-500 bg-opacity-20 border-4 border-blue-500 rounded-full p-8 animate-pulse">
                      <EyeIcon className="h-16 w-16 text-blue-500" />
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {scanningStatus === "processing" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-yellow-500 bg-opacity-20 border-4 border-yellow-500 rounded-full p-8 animate-spin">
                      <ArrowPathIcon className="h-16 w-16 text-yellow-500" />
                    </div>
                  </div>
                )}

                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center text-gray-500">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Camera không hoạt động</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <BoltIcon className="h-4 w-4" />
                  Hướng dẫn sử dụng
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Đưa mặt vào khung camera</li>
                  <li>• Giữ nguyên tư thế trong 2-3 giây</li>
                  <li>• Hệ thống tự động quét và điểm danh</li>
                  <li>• Không cần thao tác gì thêm!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-6 w-6" />
                Trạng thái hệ thống
              </CardTitle>
              <CardDescription className="text-green-100">
                Theo dõi hoạt động và kết quả điểm danh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* System Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Trạng thái camera:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cameraActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cameraActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Phát hiện khuôn mặt:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      faceDetected
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {faceDetected ? "Đã phát hiện" : "Chưa phát hiện"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Trạng thái quét:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scanningStatus === "success"
                        ? "bg-green-100 text-green-800"
                        : scanningStatus === "error"
                        ? "bg-red-100 text-red-800"
                        : scanningStatus === "processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : scanningStatus === "scanning"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusText()}
                  </span>
                </div>
              </div>

              {/* Last Result */}
              {lastResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Kết quả điểm danh gần nhất
                  </h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>
                      <span className="font-medium">Nhân viên:</span>{" "}
                      {lastResult.recognition_info?.employee_name}
                    </div>
                    <div>
                      <span className="font-medium">Thời gian:</span>{" "}
                      {new Date().toLocaleString("vi-VN")}
                    </div>
                    <div>
                      <span className="font-medium">Độ tin cậy:</span>{" "}
                      {(lastResult.recognition_info?.confidence * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>
              )}

              {/* Link to registration */}
              <div className="border-t pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Chưa có khuôn mặt trong hệ thống?
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open("/admin/face-recognition", "_blank")
                  }
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Đăng ký khuôn mặt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <ExclamationTriangleIcon className="h-6 w-6" />
                Có lỗi xảy ra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                className="mt-4"
              >
                Đóng
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
