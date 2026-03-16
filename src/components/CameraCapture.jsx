import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, X } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      stopCamera();
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setError(null);
      } catch { if (!cancelled) setError('Camera access denied.'); }
    }
    start();
    return () => { cancelled = true; stopCamera(); };
  }, [facingMode, stopCamera]);

  function capture() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob((b) => {
      stopCamera();
      onCapture(new File([b], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  }

  if (error) return (
    <div className="border border-rule rounded-sm p-8 text-center">
      <p className="text-danger text-[13px] mb-3">{error}</p>
      <button onClick={onClose} className="text-[13px] text-ink-tertiary hover:text-ink">Close</button>
    </div>
  );

  return (
    <div className="border border-rule rounded-sm overflow-hidden bg-ink relative">
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[55vh] object-contain" />
      <div className="absolute bottom-0 inset-x-0 p-5 flex items-center justify-center gap-5">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
          <X className="w-4 h-4 text-white" />
        </button>
        <button onClick={capture} className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform">
          <Camera className="w-5 h-5 text-ink" />
        </button>
        <button onClick={() => setFacingMode((p) => p === 'environment' ? 'user' : 'environment')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
