"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, createLearner } from "@/lib/api";
import AppHeader from "@/components/AppHeader";

export default function NewLearnerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    place_of_origin: "",
    date_or_estimated_age: "",
    parent_name: "",
    parent_contact: "",
    photo_source: "LIVE",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ageMode, setAgeMode] = useState("estimate");

  const [photoMode, setPhotoMode] = useState("live");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!getAccessToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  useEffect(() => {
    if (photoMode !== "live" || photoFile) return;

    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError("");
      })
      .catch(() => setCameraError("Camera access is unavailable. You can upload a photo instead."));

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [photoMode, photoFile]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setPhotoFile(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  function retakePhoto() {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  }

  function switchPhotoMode(mode) {
    retakePhoto();
    setPhotoMode(mode);
    update("photo_source", mode === "live" ? "LIVE" : "UPLOAD");
    if (mode === "upload") fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const learner = await createLearner(form, photoFile);
      router.push(`/learners`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-sand">
      <AppHeader />

      <main className="max-w-lg mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-surface border border-border-warm rounded-2xl p-6">
          <label className="block text-sm text-slate mb-1">Photo</label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => switchPhotoMode("live")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                photoMode === "live"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Live capture
            </button>
            <button
              type="button"
              onClick={() => switchPhotoMode("upload")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                photoMode === "upload"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Upload photo
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {photoMode === "live" ? (
            photoPreview ? (
              <div className="mb-4">
                <img src={photoPreview} alt="Captured learner photo" className="w-full rounded-lg mb-2" />
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="w-full text-sm py-2 rounded-lg border border-border-warm text-slate"
                >
                  Retake
                </button>
              </div>
            ) : (
              <div className="mb-4">
                {cameraError ? (
                  <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-2">
                    {cameraError}
                  </p>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg mb-2 bg-ink" />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full text-sm py-2 rounded-lg bg-teal-primary text-white"
                    >
                      Capture
                    </button>
                  </>
                )}
              </div>
            )
          ) : (
            <div className="mb-4">
              {photoPreview && (
                <img src={photoPreview} alt="Uploaded learner photo" className="w-full rounded-lg mb-2" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm py-2 rounded-lg border border-border-warm text-slate"
              >
                {photoPreview ? "Choose a different photo" : "Choose photo"}
              </button>
            </div>
          )}

          <label className="block text-sm text-slate mb-1">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          <label className="block text-sm text-slate mb-1">Place of origin</label>
          <input
            type="text"
            value={form.place_of_origin}
            onChange={(e) => update("place_of_origin", e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
          />

          <label className="block text-sm text-slate mb-1">Date of birth or estimated age</label>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setAgeMode("exact"); update("date_or_estimated_age", ""); }}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                ageMode === "exact"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Exact date
            </button>
            <button
              type="button"
              onClick={() => { setAgeMode("estimate"); update("date_or_estimated_age", ""); }}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                ageMode === "estimate"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Estimated age
            </button>
          </div>

          {ageMode === "exact" ? (
            <input
              type="date"
              value={form.date_or_estimated_age}
              onChange={(e) => update("date_or_estimated_age", e.target.value)}
              className="w-full border border-border-warm rounded-lg px-3 py-2 mb-1 text-ink focus:outline-none focus:border-teal-primary"
            />
          ) : (
            <input
              type="text"
              value={form.date_or_estimated_age}
              onChange={(e) => update("date_or_estimated_age", e.target.value)}
              placeholder="e.g. ~12 years, or approx. 2013"
              className="w-full border border-border-warm rounded-lg px-3 py-2 mb-1 text-ink focus:outline-none focus:border-teal-primary"
            />
          )}
          <p className="text-xs text-slate mb-4">Use an exact date if known, or an estimate if not.</p>

          <label className="block text-sm text-slate mb-1">Parent name</label>
          <input
            type="text"
            value={form.parent_name}
            onChange={(e) => update("parent_name", e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
          />

          <label className="block text-sm text-slate mb-1">Parent contact</label>
          <input
            type="text"
            value={form.parent_contact}
            onChange={(e) => update("parent_contact", e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-6 text-ink focus:outline-none focus:border-teal-primary"
          />

          {error && (
            <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-accent hover:bg-amber-hover text-ink font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? "Registering..." : "Register learner"}
          </button>
        </form>
      </main>
    </div>
  );
}