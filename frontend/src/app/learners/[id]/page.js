"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAccessToken, getLearner, getLearnerRecords } from "@/lib/api";

export default function LearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id;

  const [ready, setReady] = useState(false);
  const [learner, setLearner] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    getLearner(learnerId)
      .then(setLearner)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    getLearnerRecords(learnerId)
      .then((data) => setRecords(Array.isArray(data) ? data : data.results || []))
      .catch(() => {});
  }, [router, learnerId]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/learners")} className="text-teal-tint hover:text-white">
          ←
        </button>
        <span className="text-xl font-semibold text-white">Learner profile</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading && <p className="text-slate">Loading...</p>}

        {error && (
          <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {learner && (
          <>
            <div className="bg-surface border border-border-warm rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-teal-tint flex items-center justify-center text-teal-primary text-2xl font-semibold">
                  {learner.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-ink">{learner.full_name}</h1>
                  <p className="text-sm text-slate">{learner.place_of_origin || "Origin unknown"}</p>
                </div>
              </div>

              <dl className="space-y-3">
                <Row label="Date of birth / age" value={learner.date_or_estimated_age || "—"} />
                <Row label="Parent name" value={learner.parent_name || "—"} />
                <Row label="Parent contact" value={learner.parent_contact || "—"} />
                <Row label="Photo source" value={learner.photo_source || "—"} />
              </dl>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/records/new?learner=${learner.learner_id}`)}
                className="flex-1 bg-amber-accent text-ink font-medium py-3 rounded-lg hover:bg-amber-hover transition-colors"
              >
                Issue a record
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-ink mb-3">Academic records</h2>
              {records.length === 0 ? (
                <p className="text-slate text-sm">No records issued yet.</p>
              ) : (
                <div className="space-y-3">
                  {records.map((r) => (
                    <button
                      key={r.record_id}
                      onClick={() => router.push(`/records/${r.record_id}`)}
                      className="w-full text-left bg-surface border border-border-warm rounded-xl p-4 hover:border-teal-primary transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-ink">{r.level_completed} · {r.academic_year}</p>
                        <p className="text-sm text-slate">
                          {r.completion_outcome.charAt(0) + r.completion_outcome.slice(1).toLowerCase()}
                          {" · "}{r.status}
                        </p>
                      </div>
                      <span className="text-teal-primary text-sm">Present →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border-warm pb-2 last:border-0">
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}