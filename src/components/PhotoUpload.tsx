import React, { useRef, useState } from 'react';

interface PhotoUploadProps {
  onPhotosTaken: (photos: { front: string; side: string; back: string }) => void;
  onClose: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosTaken, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'back'>('front');
  const [photos, setPhotos] = useState<{ front: string; side: string; back: string }>({
    front: '',
    side: '',
    back: ''
  });
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const photoDataUrl = canvasRef.current.toDataURL('image/jpeg');
        
        setPhotos(prev => ({
          ...prev,
          [currentView]: photoDataUrl
        }));

        // Move to next view or finish
        if (currentView === 'front') {
          setCurrentView('side');
        } else if (currentView === 'side') {
          setCurrentView('back');
        } else {
          onPhotosTaken(photos);
          stopCamera();
        }
      }
    }
  };

  const retakePhoto = (view: 'front' | 'side' | 'back') => {
    setPhotos(prev => ({
      ...prev,
      [view]: ''
    }));
    setCurrentView(view);
    if (!stream) {
      startCamera();
    }
  };

  const getViewInstructions = () => {
    switch (currentView) {
      case 'front': return 'Stand straight facing the camera';
      case 'side': return 'Turn sideways to show your profile';
      case 'back': return 'Turn around to show your back';
      default: return '';
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Progress Photos</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-semibold text-center capitalize">
            {currentView} View
          </p>
          <p className="text-gray-600 text-center text-sm">
            {getViewInstructions()}
          </p>
        </div>

        {/* Camera Preview */}
        {!photos[currentView] ? (
          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-96 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
            <img
              src={photos[currentView]}
              alt={`${currentView} view`}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Photo Thumbnails */}
        <div className="flex justify-center space-x-4 mb-6">
          {(['front', 'side', 'back'] as const).map((view) => (
            <div key={view} className="text-center">
              <div
                className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${
                  currentView === view ? 'border-green-500' : 'border-gray-300'
                } ${
                  photos[view] ? 'bg-green-50' : 'bg-gray-100'
                }`}
              >
                {photos[view] ? (
                  <img
                    src={photos[view]}
                    alt={`${view} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {view.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 capitalize">{view}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!photos[currentView] ? (
            <button
              onClick={takePhoto}
              className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
            >
              Capture {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </button>
          ) : (
            <button
              onClick={() => retakePhoto(currentView)}
              className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retake {currentView}
            </button>
          )}
          
          {Object.values(photos).every(photo => photo) && (
            <button
              onClick={() => onPhotosTaken(photos)}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit All Photos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;