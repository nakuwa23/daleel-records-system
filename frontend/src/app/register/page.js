"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, getInstitutions } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ISSUER_STAFF");
  const [institutionMode, setInstitutionMode] = useState("create");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionLocation, setInstitutionLocation] = useState("");
  const [institutions, setInstitutions] = useState([]);
  const [institutionId, setInstitutionId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionMode === "join" && institutions.length === 0) {
      getInstitutions()
        .then((data) => {
          setInstitutions(data);
          if (data.length > 0) setInstitutionId(data[0].institution_id);
        })
        .catch(() => setError("Could not load institutions to join."));
    }
  }, [institutionMode, institutions.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        username,
        password,
        role,
        institution_mode: institutionMode,
        ...(institutionMode === "create"
          ? { institution_name: institutionName, institution_location: institutionLocation }
          : { institution_id: institutionId }),
      };
      await register(payload);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-sand">
      <nav className="bg-teal-primary px-6 md:px-10 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-accent flex items-center justify-center text-ink font-semibold">
            D
          </div>
          <span className="text-xl font-semibold text-white">Daleel</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-surface rounded-2xl border border-border-warm p-8">
        <h1 className="text-xl font-semibold text-ink mb-1">Create an account</h1>
        <p className="text-sm text-slate mb-6">Set up staff access for your institution</p>

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
            className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
            required
          />

          <label className="block text-sm text-slate mb-1">Your role</label>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setRole("ISSUER_STAFF")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                role === "ISSUER_STAFF"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Issuer staff
            </button>
            <button
              type="button"
              onClick={() => setRole("VERIFIER_STAFF")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                role === "VERIFIER_STAFF"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Verifier staff
            </button>
          </div>

          <label className="block text-sm text-slate mb-1">Institution</label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setInstitutionMode("create")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                institutionMode === "create"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Create new
            </button>
            <button
              type="button"
              onClick={() => setInstitutionMode("join")}
              className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                institutionMode === "join"
                  ? "bg-teal-primary text-white border-teal-primary"
                  : "bg-surface text-slate border-border-warm"
              }`}
            >
              Join existing
            </button>
          </div>

          {institutionMode === "create" ? (
            <>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Institution name"
                className="w-full border border-border-warm rounded-lg px-3 py-2 mb-3 text-ink focus:outline-none focus:border-teal-primary"
                required
              />
              <input
                type="text"
                value={institutionLocation}
                onChange={(e) => setInstitutionLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink focus:outline-none focus:border-teal-primary"
              />
            </>
          ) : (
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full border border-border-warm rounded-lg px-3 py-2 mb-4 text-ink bg-surface focus:outline-none focus:border-teal-primary"
              required
            >
              {institutions.length === 0 && <option value="">No institutions available yet</option>}
              {institutions.map((inst) => (
                <option key={inst.institution_id} value={inst.institution_id}>
                  {inst.name}
                  {inst.location ? ` — ${inst.location}` : ""}
                </option>
              ))}
            </select>
          )}

          {error && (
            <p className="text-sm text-status-invalid bg-status-invalid-tint rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (institutionMode === "join" && institutions.length === 0)}
            className="w-full bg-amber-accent hover:bg-amber-hover text-ink font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-slate text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-primary hover:text-teal-hover">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
