import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  CameraIcon,
  UserIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowPathIcon as RefreshCwIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../services/api";
import { Employee } from "../types";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const FaceRecognition: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const authStore = useAuthStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiService.getEmployees(1, 100);
      setEmployees(response.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };

        videoRef.current.onerror = (e) => {
          console.error("Video error:", e);
          setError("Lỗi camera xảy ra");
        };
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setError("Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.");
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
  };

  const forceRefreshCamera = () => {
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const startRecording = () => {
    if (!cameraActive) {
      setError("Vui lòng khởi động camera trước");
      return;
    }

    setIsRecording(true);
    setRecordedFrames([]);
    setResult(null);
    setError(null);

    const captureInterval = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        setRecordedFrames((prev) => [...prev, frame]);
      }
    }, 200); // Capture every 200ms

    // Stop recording after 3 seconds
    setTimeout(() => {
      clearInterval(captureInterval);
      setIsRecording(false);
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const registerFace = async () => {
    if (!selectedEmployee || recordedFrames.length === 0) {
      setError("Vui lòng chọn nhân viên và ghi video trước");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const employee = employees.find((emp) => emp.id === selectedEmployee);
      if (!employee) {
        throw new Error("Không tìm thấy nhân viên");
      }

      const response = await fetch(
        `http://localhost:3000/face-encodings/process-registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            employeeId: selectedEmployee,
            employeeName: employee.fullName,
            videoFrames: recordedFrames,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại");
      }

      const data = await response.json();
      setResult({
        success: true,
        message: "Đăng ký khuôn mặt thành công!",
        data: data,
      });

      // Clear recorded frames after successful registration
      setRecordedFrames([]);
    } catch (error: any) {
      setError(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đăng ký khuôn mặt
            </h1>
            <p className="text-gray-600 mt-2">
              Đăng ký khuôn mặt cho nhân viên để sử dụng hệ thống điểm danh tự
              động
            </p>
          </div>
        </div>

        {/* Quick Check-in Link */}
        <Link
          to="/checkin"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ClockIcon className="h-4 w-4" />
          Điểm danh nhanh
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CameraIcon className="h-5 w-5" />
              Điều khiển camera
            </CardTitle>
            <CardDescription>
              Điều khiển camera và ghi video cho đăng ký khuôn mặt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  cameraActive ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium">
                Camera: {cameraActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>

            {/* Camera Controls */}
            <div className="flex gap-2">
              <Button
                onClick={startCamera}
                disabled={cameraActive}
                className="flex-1"
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
              <Button onClick={forceRefreshCamera} variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Video Display */}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg"
                style={{ transform: "scaleX(-1)" }}
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center text-gray-500">
                    <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera không hoạt động</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex gap-2">
              <Button
                onClick={startRecording}
                disabled={!cameraActive || isRecording}
                className="flex-1"
              >
                <VideoCameraIcon className="h-4 w-4 mr-2" />
                {isRecording ? "Đang ghi..." : "Bắt đầu ghi"}
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording}
                variant="outline"
                className="flex-1"
              >
                Dừng ghi
              </Button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  Đang ghi... {recordedFrames.length} khung hình đã chụp
                </span>
              </div>
            )}

            {recordedFrames.length > 0 && (
              <div className="text-sm text-gray-600">
                Đã chụp {recordedFrames.length} khung hình
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Đăng ký khuôn mặt
            </CardTitle>
            <CardDescription>
              Chọn nhân viên và đăng ký khuôn mặt vào hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn nhân viên để đăng ký
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn một nhân viên...</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} ({employee.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Register Face Button */}
            <Button
              onClick={registerFace}
              disabled={
                !selectedEmployee || recordedFrames.length === 0 || isLoading
              }
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserIcon className="h-4 w-4 mr-2" />
              )}
              Đăng ký khuôn mặt
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Chỉ nhân viên đã đăng ký khuôn mặt mới có thể điểm danh
                </li>
                <li>• Đảm bảo ánh sáng đủ sáng khi ghi video</li>
                <li>• Nhìn thẳng vào camera và giữ nguyên tư thế</li>
                <li>
                  • Sau khi đăng ký, nhân viên có thể điểm danh tại trang điểm
                  danh công khai
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircleIcon className="h-5 w-5" />
              Thành công
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">{result.message}</p>

            {result.data?.recognition_info && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nhân viên:</span>{" "}
                    {result.data.recognition_info.employee_name}
                  </div>
                  <div>
                    <span className="font-medium">Độ tin cậy:</span>{" "}
                    {(result.data.recognition_info.confidence * 100).toFixed(1)}
                    %
                  </div>
                  <div>
                    <span className="font-medium">Chất lượng khuôn mặt:</span>{" "}
                    {(result.data.recognition_info.face_quality * 100).toFixed(
                      1
                    )}
                    %
                  </div>
                  <div>
                    <span className="font-medium">Phương pháp:</span>{" "}
                    {result.data.recognition_info.recognition_method}
                  </div>
                </div>

                {result.data.recognition_info.debug_info && (
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium text-green-800">
                      Thông tin gỡ lỗi
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(
                          result.data.recognition_info.debug_info,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={clearResult} variant="outline">
                Xóa kết quả
              </Button>
              <Link
                to="/checkin"
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Thử điểm danh ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
            <Button onClick={clearResult} variant="outline" className="mt-4">
              Xóa lỗi
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FaceRecognition;
