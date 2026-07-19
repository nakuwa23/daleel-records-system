"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, logout } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Protect the page: if not logged in, send to login.
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!ready) return null;

  const actions = [
    { title: "Register learner", desc: "Create a new learner profile", href: "/learners/new" },
    { title: "Issue record", desc: "Create and sign an academic record", href: "/records/new" },
    { title: "Verify record", desc: "Check a presented record's authenticity", href: "/verify" },
    { title: "Learners", desc: "Browse and search learner profiles", href: "/learners" },
  ];

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-teal-primary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-accent flex items-center justify-center text-base font-semibold text-ink">
            D
          </div>
          <span className="text-xl font-semibold text-white">Daleel</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-teal-tint hover:text-white transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-ink mb-1">Welcome back</h1>
        <p className="text-slate mb-8">What would you like to do?</p>

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