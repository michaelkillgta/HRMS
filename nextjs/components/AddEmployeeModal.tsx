'use client';

import { useState, useRef, useEffect } from 'react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('65000');
  const [doj, setDoj] = useState(new Date().toISOString().split('T')[0]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setIsCameraActive(false);
      setCameraError('Camera access denied or unavailable. Please use file upload.');
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
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = 400;
      canvas.height = 400;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const sx = ((video.videoWidth || 480) - size) / 2;
        const sy = ((video.videoHeight || 480) - size) / 2;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setPhotoPreview(dataUrl);
      }
    } catch {}
    stopCamera();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
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
            setPhotoPreview(canvas.toDataURL('image/jpeg', 0.88));
          }
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      setError('Please fill in Name, Email, and Role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || '+91 98000 00000',
          dept,
          role,
          salary: Number(salary) || 50000,
          ctc: (Number(salary) || 50000) * 12,
          doj,
          avatar: photoPreview || undefined,
          faceProfileEnrolled: Boolean(photoPreview)
        })
      });

      const data = await res.json();
      if (res.ok) {
        stopCamera();
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to add employee');
      }
    } catch {
      setError('Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Onboard New Employee</h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.65rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            {cameraError && (
              <div style={{ padding: '0.6rem', marginBottom: '1rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px', fontSize: '0.8rem' }}>
                ⚠️ {cameraError}
              </div>
            )}

            {/* Photo / Selfie Section */}
            <div style={{
              background: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.2rem',
                flexShrink: 0,
                border: photoPreview ? '2px solid #10b981' : '2px solid #cbd5e1'
              }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  name ? name.slice(0, 2).toUpperCase() : 'NEW'
                )}
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                  Photo & Biometric Face Enrollment
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                  Optional now, can be updated later. Used for facial attendance verification.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                    style={{ fontSize: '0.75rem' }}
                  >
                    📁 Upload Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={isCameraActive ? stopCamera : startCamera}
                    style={{
                      fontSize: '0.75rem',
                      background: isCameraActive ? '#fee2e2' : '#eff6ff',
                      color: isCameraActive ? '#991b1b' : '#1d4ed8',
                      border: isCameraActive ? '1px solid #fecaca' : '1px solid #bfdbfe'
                    }}
                  >
                    {isCameraActive ? '✕ Close Camera' : '📸 Take Selfie'}
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => setPhotoPreview(null)}
                      style={{ fontSize: '0.75rem', color: '#dc2626' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {isCameraActive && (
                <div style={{ width: '100%', marginTop: '0.5rem', background: '#0f172a', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '6px', overflow: 'hidden' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '110px',
                      height: '130px',
                      border: '2px dashed #38bdf8',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleCaptureSelfie}
                      style={{ fontSize: '0.78rem' }}
                    >
                      📸 Snap Snapshot
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={stopCamera}
                      style={{ fontSize: '0.78rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Legal Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ananya Roy"
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
                  placeholder="ananya.roy@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

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
                  <option value="Operations">Operations</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Designation / Role *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Product Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Gross Salary (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="65000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Joining</label>
              <input
                type="date"
                className="form-input"
                value={doj}
                onChange={(e) => setDoj(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving to Database...' : 'Add to Workforce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
