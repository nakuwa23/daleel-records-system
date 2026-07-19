"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { getAccessToken, getRecord } from "@/lib/api";

export default function RecordPresentPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id;

  const [ready, setReady] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    getRecord(recordId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, recordId]);

  if (!ready) return null;

  const record = data?.record;
  const qrPayload = data?.qr_payload;
  // The QR encodes the full signed payload as JSON — everything a verifier needs.
  const qrValue = qrPayload ? JSON.stringify(qrPayload) : "";

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-teal-tint hover:text-white">←</button>
        <span className="text-xl font-semibold text-white">Present record</span>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        {loading && <p className="text-slate">Loading...</p>}

        {error && (
          <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {record && qrPayload && (
          <div className="bg-surface border border-border-warm rounded-2xl p-6 text-center">
            <p className="text-sm text-slate mb-1">Show this code to the receiving school</p>
            <h1 className="text-lg font-semibold text-ink mb-6">
              {record.level_completed} · {record.academic_year}
            </h1>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl border border-border-warm">
                <QRCodeSVG value={qrValue} size={220} level="M" />
              </div>
            </div>

            <div className="bg-sand rounded-lg p-4 text-left">
              <Row label="Outcome" value={record.completion_outcome.charAt(0) + record.completion_outcome.slice(1).toLowerCase()} />
              <Row label="Status" value={record.status} />
              <Row label="Subjects" value={Object.keys(record.subject_results || {}).length + " recorded"} />
            </div>

            <p className="text-xs text-slate mt-4">
              This code contains the record and its cryptographic signature. A verifying
              institution can confirm its authenticity; even offline.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border-warm last:border-0">
      <span className="text-sm text-slate">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}