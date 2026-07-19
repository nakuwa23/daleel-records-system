"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, issueRecord, getLearner } from "@/lib/api";

export default function NewRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const learnerId = searchParams.get("learner");

  const [ready, setReady] = useState(false);
  const [learner, setLearner] = useState(null);
  const [levelCompleted, setLevelCompleted] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [outcome, setOutcome] = useState("PROMOTED");
  const [subjects, setSubjects] = useState([{ name: "", score: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    if (learnerId) {
      getLearner(learnerId).then(setLearner).catch(() => {});
    }
  }, [router, learnerId]);

  function updateSubject(index, field, value) {
    setSubjects((subs) =>
      subs.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addSubject() {
    setSubjects((subs) => [...subs, { name: "", score: "" }]);
  }

  function removeSubject(index) {
    setSubjects((subs) => subs.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!learnerId) {
      setError("No learner selected. Open a learner and choose 'Issue a record'.");
      return;
    }

    // Build the subject_results object from the pairs.
    const subject_results = {};
    for (const s of subjects) {
      if (s.name.trim()) {
        subject_results[s.name.trim()] = Number(s.score) || s.score;
      }
    }

    setSaving(true);
    try {
      const result = await issueRecord({
        learner_id: learnerId,
        level_completed: levelCompleted,
        academic_year: academicYear,
        subject_results,
        completion_outcome: outcome,
      });
      setIssued(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  // Success state — record issued and signed
  if (issued) {
    return (
      <div className="min-h-screen bg-sand">
        <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
          <span className="text-xl font-semibold text-white">Record issued</span>
        </header>
        <main className="max-w-lg mx-auto px-6 py-8">
          <div className="bg-surface border border-border-warm rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-status-authentic-tint flex items-center justify-center mx-auto mb-4">
              <span className="text-status-authentic text-3xl">✓</span>
            </div>
            <h1 className="text-xl font-semibold text-ink mb-1">Record signed &amp; issued</h1>
            <p className="text-sm text-slate mb-6">
              {issued.record.level_completed} · {issued.record.academic_year} · {issued.record.status}
            </p>
            <div className="bg-sand rounded-lg p-4 text-left mb-6">
              <p className="text-xs text-slate mb-1">Cryptographic signature</p>
              <p className="text-xs font-mono text-ink break-all">
                {issued.qr_payload.signature.slice(0, 48)}...
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/learners/${learnerId}`)}
                className="flex-1 bg-teal-primary text-white font-medium py-2.5 rounded-lg hover:bg-teal-hover transition-colors"
              >
                Back to learner
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-teal-tint hover:text-white">←</button>
        <span className="text-xl font-semibold text-white">Issue record</span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        {learner && (
          <div className="flex items-center gap-3 bg-teal-tint rounded-xl p-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-primary flex items-center justify-center text-white font-semibold">
              {learner.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-ink">{learner.full_name}</p>
              <p className="text-xs text-slate">{learner.place_of_origin}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface border border-border-warm rounded-2xl p-6">
          <label className="block text-sm text-slate mb-1">Level completed</label>
          <input
            type="text"
            value={levelCompleted}
            onChange={(e) => setLevelCompleted(e.target.value)}
            placeholder="e.g. Primary 4"
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          <label className="block text-sm text-slate mb-1">Academic year</label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2025"
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          <label className="block text-sm text-slate mb-2">Subject results</label>
          <div className="space-y-2 mb-2">
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateSubject(i, "name", e.target.value)}
                  placeholder="Subject"
                  className="flex-1 border border-border-warm rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-teal-primary"
                />
                <input
                  type="text"
                  value={s.score}
                  onChange={(e) => updateSubject(i, "score", e.target.value)}
                  placeholder="Score"
                  className="w-20 border border-border-warm rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-teal-primary"
                />
                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(i)}
                    className="text-slate px-2 hover:text-status-invalid"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSubject}
            className="text-sm text-teal-primary hover:text-teal-hover mb-4"
          >
            + Add subject
          </button>

          <label className="block text-sm text-slate mb-1">Outcome</label>
          <div className="flex gap-2 mb-6">
            {["PROMOTED", "PASSED", "FAILED", "OTHER"].map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOutcome(o)}
                className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                  outcome === o
                    ? "bg-teal-primary text-white border-teal-primary"
                    : "bg-surface text-slate border-border-warm"
                }`}
              >
                {o.charAt(0) + o.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-amber-accent text-ink font-medium py-3 rounded-lg hover:bg-amber-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Signing record..." : "Issue & sign record"}
          </button>
        </form>
      </main>
    </div>
  );
}