'use client';

import { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmployeeModal({
  isOpen,
  employee,
  onClose,
  onSuccess
}: EditEmployeeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'active' | 'on-leave' | 'probation' | 'resigned' | 'inactive'>('active');
  const [salary, setSalary] = useState('65000');
  const [doj, setDoj] = useState('');
  const [relievingDate, setRelievingDate] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Camera / Selfie capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDept(employee.dept || 'Engineering');
      setRole(employee.role || '');
      setStatus(employee.status || 'active');
      setSalary(String(employee.salary || '50000'));
      setDoj(employee.doj || '');
      setRelievingDate(employee.relievingDate || '');
      setPhotoPreview(employee.avatar && employee.avatar.length > 4 ? employee.avatar : null);
      setError('');
      setFeedbackMsg(null);
    }
  }, [employee]);

  // Clean up camera stream on unmount or modal close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen || !employee) return null;

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setIsCameraActive(false);
      setCameraError('Unable to access camera. Please check camera permissions in your browser or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureSelfie = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = 400;
      canvas.height = 400;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop square from center of video frame
        const sx = ((video.videoWidth || 480) - size) / 2;
        const sy = ((video.videoHeight || 480) - size) / 2;

        // Mirror horizontal to match selfie perspective
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPhotoPreview(dataUrl);
        setFeedbackMsg('Selfie captured successfully! Click "Save Profile Changes" below to remember it.');
      }
    } catch {
      setError('Failed to capture snapshot from webcam');
    } finally {
      setIsCapturing(false);
      stopCamera();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          // Scale down image to max 400x400 to keep JSON DB ultra-fast and performant
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setPhotoPreview(optimizedDataUrl);
            setFeedbackMsg('Photo selected! Click "Save Profile Changes" below to remember it.');
          }
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFeedbackMsg('Photo removed. Initials will be used.');
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      setError('Please provide Name, Email, and Role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const initials = name.trim().split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
      const savedAvatar = photoPreview || initials;
      const isEnrolled = Boolean(photoPreview && photoPreview.startsWith('data:image'));

      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          name,
          email,
          phone,
          dept,
          role,
          status,
          salary: Number(salary) || 50000,
          ctc: (Number(salary) || 50000) * 12,
          doj,
          relievingDate: relievingDate || '',
          avatar: savedAvatar,
          faceProfileEnrolled: isEnrolled
        })
      });

      const data = await res.json();
      if (res.ok) {
        stopCamera();
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to update employee details');
      }
    } catch {
      setError('Network communication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Employee Profile</h2>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              ID: {employee.empCode} · Updating Record in Persistent Database
            </p>
          </div>
          <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.65rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            {feedbackMsg && (
              <div style={{ padding: '0.6rem 0.85rem', marginBottom: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✓</span>
                <span>{feedbackMsg}</span>
              </div>
            )}

            {cameraError && (
              <div style={{ padding: '0.6rem', marginBottom: '1rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px', fontSize: '0.8rem' }}>
                ⚠️ {cameraError}
              </div>
            )}

            {/* Photo & Biometric Selfie Card */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                {/* Avatar Preview */}
                <div style={{
                  position: 'relative',
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: employee.color || '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: photoPreview ? '2px solid #10b981' : '2px solid #e2e8f0'
                }}>
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    employee.avatar && employee.avatar.length > 4 ? (
                      <img
                        src={employee.avatar}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      employee.avatar || employee.name?.slice(0, 2).toUpperCase() || 'EM'
                    )
                  )}
                  {photoPreview && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(16, 185, 129, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.55rem',
                      textAlign: 'center',
                      fontWeight: 700,
                      padding: '2px 0'
                    }}>
                      SAVED
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Biometric Face & Profile Photo
                    </label>
                    {photoPreview ? (
                      <span style={{ fontSize: '0.7rem', color: '#166534', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 600 }}>
                        ✓ Biometric Enrolled
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 500 }}>
                        Initials Badge
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 0.65rem 0' }}>
                    Upload an ID portrait or snap a selfie with your camera. Remembered in database for facial attendance matching.
                  </p>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      📁 Upload Photo
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={isCameraActive ? stopCamera : startCamera}
                      style={{
                        fontSize: '0.78rem',
                        backgroundColor: isCameraActive ? '#fee2e2' : '#eff6ff',
                        color: isCameraActive ? '#991b1b' : '#1d4ed8',
                        border: isCameraActive ? '1px solid #fecaca' : '1px solid #bfdbfe',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {isCameraActive ? '✕ Close Camera' : '📸 Take Selfie'}
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleRemovePhoto}
                        style={{ fontSize: '0.75rem', color: '#dc2626', borderColor: '#fecaca', padding: '0.25rem 0.5rem' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Selfie Camera Viewport */}
              {isCameraActive && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.85rem',
                  background: '#0f172a',
                  borderRadius: '10px',
                  border: '2px solid #3b82f6',
                  color: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                      Live Camera Viewfinder
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Look directly into the camera
                    </span>
                  </div>

                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '220px',
                    backgroundColor: '#000000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)' // Mirror selfie feed
                      }}
                    />

                    {/* Oval face guide reticle */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '130px',
                      height: '150px',
                      border: '2px dashed #38bdf8',
                      borderRadius: '50%',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                      pointerEvents: 'none'
                    }} />

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.65)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      color: '#e2e8f0',
                      pointerEvents: 'none'
                    }}>
                      Align face inside circle
                    </div>
                  </div>

                  {/* Snap Button Controls */}
                  <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCaptureSelfie}
                      disabled={isCapturing}
                      style={{
                        padding: '0.45rem 1.25rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#2563eb'
                      }}
                    >
                      📸 Snap Selfie Photo
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={stopCamera}
                      style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', background: '#334155', color: '#ffffff', border: 'none' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Corporate Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role *</label>
                <input
                  type="text"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Employment Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="probation">Probation</option>
                  <option value="resigned">Resigned</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Date of Joining</label>
                <input
                  type="date"
                  className="form-input"
                  value={doj}
                  onChange={(e) => setDoj(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Relieving (if departed)</label>
                <input
                  type="date"
                  className="form-input"
                  value={relievingDate}
                  onChange={(e) => setRelievingDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Gross Salary (₹)</label>
              <input
                type="number"
                className="form-input"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving to Database...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
