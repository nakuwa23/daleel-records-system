"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRole } from "@/lib/api";
import AppHeader from "@/components/AppHeader";

const REGISTER_LEARNER = { title: "Register learner", desc: "Create a new learner profile", href: "/learners/new" };
const ISSUE_RECORD = { title: "Issue record", desc: "Create and sign an academic record", href: "/records/new" };
const VERIFY_RECORD = { title: "Verify record", desc: "Check a presented record's authenticity", href: "/verify" };
const LEARNERS = { title: "Learners", desc: "Browse and search learner profiles", href: "/learners" };

const ACTIONS_BY_ROLE = {
  ISSUER_STAFF: [REGISTER_LEARNER, ISSUE_RECORD, LEARNERS],
  VERIFIER_STAFF: [VERIFY_RECORD],
  ADMINISTRATOR: [REGISTER_LEARNER, ISSUE_RECORD, VERIFY_RECORD, LEARNERS],
};

const ROLE_LABELS = {
  ISSUER_STAFF: "Issuer staff",
  VERIFIER_STAFF: "Verifier staff",
  ADMINISTRATOR: "Administrator",
};

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("");

  // Protect the page: if not logged in, send to login.
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    } else {
      setRole(getRole());
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  const actions = ACTIONS_BY_ROLE[role] || [REGISTER_LEARNER, ISSUE_RECORD, VERIFY_RECORD, LEARNERS];

  return (
    <div className="min-h-screen bg-sand">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">Welcome back</h1>
        <p className="text-slate mb-8">
          {ROLE_LABELS[role] ? `${ROLE_LABELS[role]} · What would you like to do?` : "What would you like to do?"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((a) => (
            <button
              key={a.href}
              onClick={() => router.push(a.href)}
              className="text-left bg-surface border border-border-warm rounded-2xl p-6 hover:border-teal-primary transition-colors"
            >
              <p className="text-lg font-medium text-ink mb-1">{a.title}</p>
              <p className="text-sm text-slate">{a.desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}