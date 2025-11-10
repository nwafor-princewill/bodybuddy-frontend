import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

interface AIBodyAnalyzerProps {
  onAnalysisComplete: (measurements: BodyMeasurements) => void;
  onClose: () => void;
}

// UPDATED: Match backend snake_case
export interface BodyMeasurements {
  waist_circumference: number;
  shoulder_width: number;
  progress_score: number;
  ai_processed: boolean;
  landmarks: any[];
}

const AIBodyAnalyzer: React.FC<AIBodyAnalyzerProps> = ({ onAnalysisComplete, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);

  useEffect(() => {
    initializePose();
  }, []);

  const initializePose = () => {
    const newPose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    newPose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    newPose.onResults(onPoseResults);
    setPose(newPose);
  };

  const onPoseResults = (results: any) => {
    const canvasCtx = canvasRef.current?.getContext('2d');
    const video = videoRef.current;
    
    if (!canvasCtx || !video) return;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    
    // Draw video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
    
    // Draw pose landmarks and connections
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 2
      });

      // Calculate measurements
      const bodyMeasurements = calculateBodyMeasurements(results.poseLandmarks);
      setMeasurements(bodyMeasurements);
    }
    
    canvasCtx.restore();
  };

  const calculateBodyMeasurements = (landmarks: any[]): BodyMeasurements => {
    if (!landmarks || landmarks.length < 25) {
      return { 
        waist_circumference: 0, 
        shoulder_width: 0, 
        progress_score: 0, 
        ai_processed: false,
        landmarks: [] 
      };
    }

    // Get key landmarks
    const leftShoulder = landmarks[11]; // Left shoulder
    const rightShoulder = landmarks[12]; // Right shoulder
    const leftHip = landmarks[23]; // Left hip
    const rightHip = landmarks[24]; // Right hip

    // Calculate shoulder width (pixel distance between shoulders)
    const shoulderWidthPx = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) + 
      Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    // Calculate waist width (pixel distance between hips)
    const waistWidthPx = Math.sqrt(
      Math.pow(rightHip.x - leftHip.x, 2) + 
      Math.pow(rightHip.y - leftHip.y, 2)
    );

    // Convert pixel measurements to approximate real-world measurements
    // These are rough estimates - would need calibration for accuracy
    const shoulderWidthCm = shoulderWidthPx * 150; // Scale factor
    const waistCircumferenceCm = waistWidthPx * 120; // Scale factor

    // Calculate progress score (placeholder algorithm)
    const progressScore = Math.max(0, Math.min(100, 
      100 - (waistCircumferenceCm / 10) + (shoulderWidthCm / 5)
    ));

    return {
      waist_circumference: Math.round(waistCircumferenceCm * 10) / 10,
      shoulder_width: Math.round(shoulderWidthCm * 10) / 10,
      progress_score: Math.round(progressScore),
      ai_processed: true,
      landmarks: landmarks
    };
  };

  const startAnalysis = async () => {
    if (!pose || !videoRef.current) return;

    setIsAnalyzing(true);
    
    try {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await pose.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      
      await camera.start();
    } catch (error) {
      console.error('Error starting camera:', error);
      setIsAnalyzing(false);
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (measurements) {
      onAnalysisComplete(measurements);
    }
  };

  const saveMeasurements = () => {
    if (measurements) {
      onAnalysisComplete(measurements);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">AI Body Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64"
                width={640}
                height={480}
              />
            </div>

            {/* Controls */}
            <div className="flex space-x-4">
              {!isAnalyzing ? (
                <button
                  onClick={startAnalysis}
                  className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start AI Analysis
                </button>
              ) : (
                <button
                  onClick={stopAnalysis}
                  className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Analysis
                </button>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Pro Tip:</strong> Stand straight about 2 meters from camera. 
                Wear fitted clothing for best results. Ensure good lighting.
              </p>
            </div>
          </div>

          {/* Measurements Display */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Body Measurements</h3>
            
            {measurements ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-blue-600 text-sm font-semibold">Waist</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {measurements.waist_circumference}cm
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-green-600 text-sm font-semibold">Shoulders</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {measurements.shoulder_width}cm
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-purple-600 text-sm font-semibold">Progress Score</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {measurements.progress_score}/100
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Landmarks Detected</h4>
                  <p className="text-sm text-gray-600">
                    {measurements.landmarks.length} body points tracked
                  </p>
                </div>

                <button
                  onClick={saveMeasurements}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Measurements
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">
                  Start AI analysis to see your body measurements...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBodyAnalyzer;