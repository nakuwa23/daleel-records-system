"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import AppHeader from "@/components/AppHeader";
import {
  verifyRecordSmart,
  refreshInstitutionDirectory,
  flushOfflineVerificationQueue,
  getQueueCount,
  getInstitutionsSyncedAt,
} from "@/lib/verification";

const OUTCOME_STYLES = {
  PROMOTED: "bg-status-authentic-tint text-status-authentic",
  PASSED: "bg-status-authentic-tint text-status-authentic",
  FAILED: "bg-status-invalid-tint text-status-invalid",
  OTHER: "bg-status-offline-tint text-status-offline",
};

export default function VerifyPage() {
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState("");
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [directorySyncedAt, setDirectorySyncedAt] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    setReady(true);
    setOnline(navigator.onLine);
    setDirectorySyncedAt(getInstitutionsSyncedAt());
    getQueueCount().then(setPendingCount).catch(() => {});

    if (navigator.onLine) {
      refreshInstitutionDirectory()
        .then(() => setDirectorySyncedAt(getInstitutionsSyncedAt()))
        .catch(() => {});
      trySync();
    }

    function handleOnline() {
      setOnline(true);
      refreshInstitutionDirectory()
        .then(() => setDirectorySyncedAt(getInstitutionsSyncedAt()))
        .catch(() => {});
      trySync();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function trySync() {
    setSyncing(true);
    try {
      await flushOfflineVerificationQueue();
    } catch {
      // stay queued — we'll retry on the next reconnect
    } finally {
      setPendingCount(await getQueueCount().catch(() => 0));
      setSyncing(false);
    }
  }

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
      const res = await verifyRecordSmart(payload);
      setResult(res);
      if (res.pendingSync) {
        setPendingCount(await getQueueCount().catch(() => 0));
      }
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
      <AppHeader />

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Connectivity + sync status */}
        <div className="flex items-center justify-between gap-3 mb-4 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
              online
                ? "bg-status-authentic-tint text-status-authentic"
                : "bg-status-offline-tint text-status-offline"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-status-authentic" : "bg-status-offline"}`} />
            {online ? "Online" : "Offline — verifying from cached issuer keys"}
          </span>

          {pendingCount > 0 && (
            <button
              onClick={trySync}
              disabled={!online || syncing}
              className="text-slate hover:text-teal-primary disabled:opacity-50"
            >
              {syncing ? "Syncing…" : `${pendingCount} pending sync${online ? " · Sync now" : ""}`}
            </button>
          )}
        </div>

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
            {result.mode === "OFFLINE" && (
              <p className="text-xs text-status-offline bg-status-offline-tint inline-block rounded-full px-2.5 py-1 mt-3">
                Verified offline from cached issuer keys
                {result.pendingSync ? " — will sync when back online" : ""}
              </p>
            )}
            <button
              onClick={() => { setResult(null); }}
              className="mt-4 text-sm text-teal-primary hover:text-teal-hover"
            >
              Verify another
            </button>
          </div>
        )}

        {/* Report card: only rendered for a signature-verified record */}
        {result?.authentic && result.record && (
          <div className="bg-surface border border-border-warm rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div className="h-1.5 bg-teal-primary" />

            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 bg-sand/60 border-b border-border-warm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-teal-tint text-teal-primary flex items-center justify-center text-lg overflow-hidden">
                  {result.learner_photo ? (
                    <img
                      src={result.learner_photo}
                      alt={result.learner_name || "Learner"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "✓"
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate uppercase tracking-wide">Academic report</p>
                  <h3 className="text-lg font-semibold text-ink">
                    {result.record.levelCompleted} · {result.record.academicYear}
                  </h3>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                  OUTCOME_STYLES[result.record.completionOutcome] ||
                  "bg-teal-tint text-teal-primary"
                }`}
              >
                {result.record.completionOutcome}
              </span>
            </div>

            <div className="px-6 pt-5">
              <dl className="grid grid-cols-2 gap-3 mb-5 bg-sand rounded-xl p-4 text-sm">
                <div>
                  <dt className="text-xs text-slate uppercase tracking-wide mb-0.5">Learner</dt>
                  <dd className="text-ink font-medium">
                    {result.learner_name || result.record.learnerId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate uppercase tracking-wide mb-0.5">
                    Issuing institution
                  </dt>
                  <dd className="text-ink font-medium">{result.issuer_name || "—"}</dd>
                </div>
              </dl>

              <div className="overflow-x-auto rounded-xl border border-border-warm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-sand text-slate">
                      <th className="py-2.5 px-4 font-medium text-xs uppercase tracking-wide">
                        Subject
                      </th>
                      <th className="py-2.5 px-4 font-medium text-xs uppercase tracking-wide text-right">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.record.subjectResults || {}).map(
                      ([subject, score], i) => (
                        <tr
                          key={subject}
                          className={`border-t border-border-warm ${i % 2 ? "bg-sand/40" : "bg-surface"}`}
                        >
                          <td className="py-2.5 px-4 text-ink whitespace-nowrap">{subject}</td>
                          <td className="py-2.5 px-4 text-ink text-right font-semibold tabular-nums">
                            {score}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-slate px-6 py-4">
              <span className="text-teal-primary">✓</span>
              Verified against the issuing institution&apos;s digital signature
            </p>
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

            {!online && !directorySyncedAt && (
              <p className="text-xs text-status-offline bg-status-offline-tint rounded-lg px-3 py-2 mt-3">
                No issuer directory cached yet — connect once while online so this device can
                verify records offline.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
