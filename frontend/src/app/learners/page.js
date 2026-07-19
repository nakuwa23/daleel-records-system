"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getLearners } from "@/lib/api";

export default function LearnersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    getLearners()
      .then((data) => setLearners(Array.isArray(data) ? data : data.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (!ready) return null;

  const filtered = learners.filter((l) =>
    l.full_name.toLowerCase().includes(query.toLowerCase()) ||
    (l.place_of_origin || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-teal-tint hover:text-white">
          ←
        </button>
        <span className="text-xl font-semibold text-white flex-1">Learners</span>
        <button
          onClick={() => router.push("/learners/new")}
          className="bg-amber-accent text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-hover transition-colors"
        >
          + Register
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or origin..."
          className="w-full border border-border-warm rounded-lg px-4 py-2.5 mb-6 text-ink bg-surface focus:outline-none focus:border-teal-primary"
        />

        {loading && <p className="text-slate">Loading learners...</p>}

        {error && (
          <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-slate text-center py-10">
            {query ? "No learners match your search." : "No learners registered yet."}
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((l) => (
            <button
              key={l.learner_id}
              onClick={() => router.push(`/learners/${l.learner_id}`)}
              className="w-full text-left bg-surface border border-border-warm rounded-xl p-4 hover:border-teal-primary transition-colors flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-teal-tint flex items-center justify-center text-teal-primary font-semibold">
                {l.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink">{l.full_name}</p>
                <p className="text-sm text-slate">
                  {l.place_of_origin || "Origin unknown"}
                  {l.date_or_estimated_age ? ` · ${l.date_or_estimated_age}` : ""}
                </p>
              </div>
              <span className="text-slate">→</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}