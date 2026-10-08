'use client';

import { useState, useRef, useEffect } from 'react';

export default function FaceAttendanceModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Initializing camera...');
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;

    async function initCameraAndModels() {
      try {
        setStatusText('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setStatusText('Loading face recognition models...');
        // Dynamically load face-api if not already loaded on window
        if (!window.faceapi) {
          await new Promise((resolve, reject) => {
            const sc = document.createElement('script');
            sc.src = '/faceapi/face-api.js';
            sc.onload = resolve;
            sc.onerror = () => reject(new Error('Failed to load /faceapi/face-api.js'));
            document.head.appendChild(sc);
          });
        }

        const nets = window.faceapi.nets;
        await Promise.all([
          nets.tinyFaceDetector.loadFromUri('/faceapi/model'),
          nets.faceLandmark68TinyNet.loadFromUri('/faceapi/model'),
          nets.faceRecognitionNet.loadFromUri('/faceapi/model')
        ]);

        if (active) {
          setLoading(false);
          setStatusText('Look straight at the camera to check-in');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Camera or model error');
          setLoading(false);
        }
      }
    }

    initCameraAndModels();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setStatusText('Verifying face...');

    try {
      const options = new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
      const detections = await window.faceapi.detectSingleFace(videoRef.current, options);

      if (!detections) {
        alert('No face detected. Please ensure good lighting and face the camera.');
        setStatusText('Face not found. Try again.');
        return;
      }

      setStatusText('Face verified successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 800);
    } catch (e) {
      alert('Verification error: ' + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop show">
      <div className="modal">
        <div className="modal-header">
          <h3>Facial Recognition Check-In</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          {error ? (
            <div className="alert alert-warning">{error}</div>
          ) : (
            <>
              <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '220px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
                />
              </div>
              <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {statusText}
              </p>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleCapture}
            disabled={loading || !!error}
          >
            Verify & Punch
          </button>
        </div>
      </div>
    </div>
  );
}
