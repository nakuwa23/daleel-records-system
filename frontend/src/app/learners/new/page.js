"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, createLearner } from "@/lib/api";

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

  useEffect(() => {
    if (!getAccessToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const learner = await createLearner(form);
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
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-teal-tint hover:text-white">
          ←
        </button>
        <span className="text-xl font-semibold text-white">Register learner</span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-surface border border-border-warm rounded-2xl p-6">
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