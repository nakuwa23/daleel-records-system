"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, isAdmin, getAnalytics } from "@/lib/api";
import AppHeader from "@/components/AppHeader";

const OUTCOME_ORDER = ["PROMOTED", "PASSED", "FAILED", "OTHER"];
const OUTCOME_LABELS = { PROMOTED: "Promoted", PASSED: "Passed", FAILED: "Failed", OTHER: "Other" };
const OUTCOME_COLORS = {
  PROMOTED: "var(--color-status-authentic)",
  PASSED: "var(--color-status-authentic)",
  FAILED: "var(--color-status-invalid)",
  OTHER: "var(--color-status-offline)",
};

const RECORD_STATUS_ORDER = ["DRAFT", "SIGNED", "SYNCED"];
const RECORD_STATUS_LABELS = { DRAFT: "Draft", SIGNED: "Signed", SYNCED: "Synced" };
const RECORD_STATUS_COLORS = {
  DRAFT: "var(--color-slate)",
  SIGNED: "var(--color-teal-hover)",
  SYNCED: "var(--color-teal-primary)",
};

const RESULT_ORDER = ["AUTHENTIC", "INVALID"];
const RESULT_LABELS = { AUTHENTIC: "Authentic", INVALID: "Invalid" };
const RESULT_COLORS = {
  AUTHENTIC: "var(--color-status-authentic)",
  INVALID: "var(--color-status-invalid)",
};

const MODE_ORDER = ["ONLINE", "OFFLINE"];
const MODE_LABELS = { ONLINE: "Online", OFFLINE: "Offline" };
const MODE_COLORS = {
  ONLINE: "var(--color-teal-primary)",
  OFFLINE: "var(--color-amber-accent)",
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    if (!isAdmin()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message));
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-sand">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">Analytics</h1>
        <p className="text-slate mb-8">
          {data?.scope === "platform"
            ? `Platform-wide · across ${data.totals.institutions} institutions`
            : data?.institution
            ? `${data.institution.name}'s activity`
            : "Loading..."}
        </p>

        {error && (
          <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatTile label="Learners" value={data.totals.learners} />
              <StatTile label="Records issued" value={data.totals.records} />
              <StatTile label="Verifications" value={data.totals.verifications} />
              {data.scope === "platform" && (
                <StatTile label="Institutions" value={data.totals.institutions} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <StackedBar
                title="Records by outcome"
                data={data.records_by_outcome}
                order={OUTCOME_ORDER}
                labels={OUTCOME_LABELS}
                colors={OUTCOME_COLORS}
              />
              <StackedBar
                title="Records by status"
                data={data.records_by_status}
                order={RECORD_STATUS_ORDER}
                labels={RECORD_STATUS_LABELS}
                colors={RECORD_STATUS_COLORS}
              />
              <StackedBar
                title="Verifications by result"
                data={data.verifications_by_result}
                order={RESULT_ORDER}
                labels={RESULT_LABELS}
                colors={RESULT_COLORS}
              />
              <StackedBar
                title="Verifications by mode"
                data={data.verifications_by_mode}
                order={MODE_ORDER}
                labels={MODE_LABELS}
                colors={MODE_COLORS}
              />
            </div>

            {data.scope === "platform" && data.top_institutions?.length > 0 && (
              <div className="space-y-4">
                <InstitutionsBarChart institutions={data.top_institutions} />
                <TopInstitutionsTable institutions={data.top_institutions} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="bg-surface border border-border-warm rounded-2xl p-5">
      <p className="text-3xl font-semibold text-ink mb-1">{value}</p>
      <p className="text-sm text-slate">{label}</p>
    </div>
  );
}

function StackedBar({ title, data, order, labels, colors }) {
  const entries = order.map((key) => [key, data?.[key] || 0]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const segments = entries.filter(([, value]) => value > 0);

  return (
    <div className="bg-surface border border-border-warm rounded-2xl p-5">
      <h3 className="text-sm font-medium text-slate mb-4">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-slate">No data yet.</p>
      ) : (
        <>
          <div className="h-3 rounded-full overflow-hidden flex bg-surface">
            {segments.map(([key, value], i) => (
              <div
                key={key}
                className={i < segments.length - 1 ? "h-full mr-0.5" : "h-full"}
                style={{ width: `${(value / total) * 100}%`, backgroundColor: colors[key] }}
                title={`${labels[key]}: ${value}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {entries.map(([key, value]) => (
              <div key={key} className="flex items-center gap-1.5 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[key] }}
                />
                <span className="text-ink">{labels[key]}</span>
                <span className="text-slate">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InstitutionsBarChart({ institutions }) {
  const max = Math.max(1, ...institutions.map((inst) => inst.record_count));

  return (
    <div className="bg-surface border border-border-warm rounded-2xl p-5">
      <h3 className="text-sm font-medium text-slate mb-6">Top institutions by records issued</h3>
      <div className="flex items-end gap-2 h-48 border-b border-border-warm">
        {institutions.map((inst) => (
          <div key={inst.institution_id} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end">
            <span className="text-xs text-slate mb-1">{inst.record_count}</span>
            <div
              className="w-6 rounded-t bg-teal-primary"
              style={{ height: `${(inst.record_count / max) * 100}%` }}
              title={`${inst.name}: ${inst.record_count}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {institutions.map((inst) => (
          <div key={inst.institution_id} className="flex-1 min-w-0 text-center">
            <span className="text-xs text-slate truncate block" title={inst.name}>
              {inst.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopInstitutionsTable({ institutions }) {
  return (
    <div className="bg-surface border border-border-warm rounded-2xl p-5 overflow-x-auto">
      <h3 className="text-sm font-medium text-slate mb-4">Top institutions</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate border-b border-border-warm">
            <th className="pb-2 font-medium">Institution</th>
            <th className="pb-2 font-medium text-right">Learners</th>
            <th className="pb-2 font-medium text-right">Records</th>
            <th className="pb-2 font-medium text-right">Verifications</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((inst) => (
            <tr key={inst.institution_id} className="border-b border-border-warm last:border-0">
              <td className="py-2 text-ink">{inst.name}</td>
              <td className="py-2 text-right text-ink">{inst.learner_count}</td>
              <td className="py-2 text-right text-ink">{inst.record_count}</td>
              <td className="py-2 text-right text-ink">{inst.verification_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
