"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { getAccessToken, verifyRecord } from "@/lib/api";

export default function VerifyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);  
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState("");
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScan() {
    setError("");
    setResult(null);
    setScanning(true);

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },  
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop().catch(() => {});
          setScanning(false);
          await handlePayload(decodedText);
        },
        () => {} 
      );
    } catch (err) {
      setError("Could not access camera. Try 'Enter code manually' below.");
      setScanning(false);
    }
  }

  async function stopScan() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  }

  async function handlePayload(text) {
    try {
      const payload = JSON.parse(text);
      const res = await verifyRecord(payload);
      setResult(res);
    } catch (err) {
      setError("That code isn't a valid Daleel record.");
    }
  }

  async function handleManualSubmit() {
    setError("");
    setResult(null);
    await handlePayload(manualText);
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-teal-tint hover:text-white">←</button>
        <span className="text-xl font-semibold text-white">Verify a record</span>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Result display */}
        {result && (
          <div
            className={`rounded-2xl p-6 text-center mb-6 border ${
              result.authentic
                ? "bg-status-authentic-tint border-status-authentic"
                : "bg-status-invalid-tint border-status-invalid"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl ${
                result.authentic ? "text-status-authentic" : "text-status-invalid"
              }`}
            >
              {result.authentic ? "✓" : "✕"}
            </div>
            <h2
              className={`text-xl font-semibold mb-1 ${
                result.authentic ? "text-status-authentic" : "text-status-invalid"
              }`}
            >
              {result.authentic ? "Authentic record" : "Not authentic"}
            </h2>
            <p className="text-sm text-slate">{result.detail}</p>
            <button
              onClick={() => { setResult(null); }}
              className="mt-4 text-sm text-teal-primary hover:text-teal-hover"
            >
              Verify another
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Scanner area */}
        {!result && (
          <div className="bg-surface border border-border-warm rounded-2xl p-6">
            {!manualMode ? (
              <>
                <div id="qr-reader" className="rounded-lg overflow-hidden mb-4" />
                {!scanning ? (
                  <button
                    onClick={startScan}
                    className="w-full bg-teal-primary text-white font-medium py-3 rounded-lg hover:bg-teal-hover transition-colors"
                  >
                    Start camera
                  </button>
                ) : (
                  <button
                    onClick={stopScan}
                    className="w-full bg-surface border border-border-warm text-slate font-medium py-3 rounded-lg"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => setManualMode(true)}
                  className="w-full text-sm text-slate hover:text-teal-primary mt-3"
                >
                  Enter code manually
                </button>
              </>
            ) : (
              <>
                <label className="block text-sm text-slate mb-1">Paste the record code</label>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={6}
                  className="w-full border border-border-warm rounded-lg px-3 py-2 mb-3 text-ink text-xs font-mono focus:outline-none focus:border-teal-primary"
                  placeholder='{"record": {...}, "signature": "...", "issuerId": "..."}'
                />
                <button
                  onClick={handleManualSubmit}
                  className="w-full bg-amber-accent text-ink font-medium py-3 rounded-lg hover:bg-amber-hover transition-colors"
                >
                  Verify record
                </button>
                <button
                  onClick={() => setManualMode(false)}
                  className="w-full text-sm text-slate hover:text-teal-primary mt-3"
                >
                  Use camera instead
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}