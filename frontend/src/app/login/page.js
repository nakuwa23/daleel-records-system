"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-border-warm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-accent flex items-center justify-center text-lg font-semibold text-ink">
            D
          </div>
          <span className="text-2xl font-semibold text-ink">Daleel</span>
        </div>

        <h1 className="text-xl font-semibold text-ink mb-1">Sign in</h1>
        <p className="text-sm text-slate mb-6">Access your institution's records</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm text-slate mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          <label className="block text-sm text-slate mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-6 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          {error && (
            <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-primary hover:bg-teal-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}