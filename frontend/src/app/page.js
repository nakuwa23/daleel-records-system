"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sand">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white px-6 md:px-10 py-4 flex items-center justify-between border-b border-border-warm">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-primary flex items-center justify-center text-white font-semibold">
            D
          </div>
          <span className="text-xl font-semibold text-ink">Daleel</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm text-slate hover:text-ink">How it works</a>
          <a href="#why" className="text-sm text-slate hover:text-ink">Why Daleel</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-ink hover:text-teal-primary">Sign in</Link>
          <Link
            href="/login"
            className="bg-amber-accent text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-hover transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/hero_1.jpg"
          alt="Students learning in a classroom"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A3B2E]/75 via-[#0F6E56]/70 to-[#0A4A3A]/75" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <span
            className="animate-fade-up inline-block bg-amber-accent text-ink text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full mb-6"
            style={{ animationDelay: "0ms" }}
          >
            PORTABLE · VERIFIABLE · OFFLINE
          </span>
          <h1
            className="animate-fade-up text-4xl md:text-6xl font-semibold text-white leading-tight tracking-tight mb-2"
            style={{ animationDelay: "100ms" }}
          >
            Records that follow
          </h1>
          <h1
            className="animate-fade-up text-4xl md:text-6xl font-semibold text-amber-accent leading-tight tracking-tight mb-6"
            style={{ animationDelay: "150ms" }}
          >
            the learner
          </h1>
          <p
            className="animate-fade-up text-base md:text-lg text-teal-tint max-w-xl mx-auto mb-9 leading-relaxed"
            style={{ animationDelay: "250ms" }}
          >
            The academic records system for displaced and migrant learners. Issue tamper-proof
            records, carry them anywhere, and verify them at any institution — even with
            no internet.
          </p>
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-3 justify-center"
            style={{ animationDelay: "350ms" }}
          >
            <Link
              href="/login"
              className="bg-amber-accent text-ink font-semibold px-7 py-3.5 rounded-lg hover:bg-amber-hover hover:-translate-y-0.5 transition-all"
            >
              Get started
            </Link>
            <a
              href="#how"
              className="bg-white/10 border border-white/30 text-white font-medium px-7 py-3.5 rounded-lg hover:bg-white/20 hover:-translate-y-0.5 transition-all"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink text-center mb-3">How Daleel works</h2>
        <p className="text-slate text-center mb-12 max-w-lg mx-auto">
          Three steps, from issuing a record to verifying it anywhere.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "1", t: "Register", d: "Create a photo-based learner profile — no formal ID required." },
            { n: "2", t: "Issue & sign", d: "Records are cryptographically signed, making tampering detectable." },
            { n: "3", t: "Verify anywhere", d: "Any institution confirms authenticity in seconds, online or offline." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="bg-surface border border-border-warm rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-teal-tint text-teal-primary font-semibold flex items-center justify-center mb-4">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{s.t}</h3>
                <p className="text-sm text-slate leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why Daleel */}
      <section id="why" className="bg-white py-20 border-y border-border-warm">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-ink text-center mb-12">Why Daleel</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Survives displacement", d: "When a school is lost to conflict, the learner's record isn't — it travels with them." },
              { t: "Tamper-proof", d: "Each record carries a cryptographic signature, so any alteration is immediately detectable." },
              { t: "Works offline", d: "Verification needs no internet — vital where connectivity is unreliable or absent." },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 100}>
                <h3 className="text-lg font-semibold text-ink mb-2">{f.t}</h3>
                <p className="text-sm text-slate leading-relaxed">{f.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-4">
            Give every learner a record that lasts
          </h2>
          <p className="text-slate mb-8 max-w-lg mx-auto">
            Start issuing verifiable academic records that follow the learner, wherever they go.
          </p>
          <Link
            href="/login"
            className="inline-block bg-teal-primary text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-teal-hover hover:-translate-y-0.5 transition-all"
          >
            Get started
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white/70">
        <div className="max-w-5xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-accent flex items-center justify-center text-ink font-semibold">
                D
              </div>
              <span className="text-white text-lg font-semibold">Daleel</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Portable, tamper-proof academic records that follow displaced and migrant
              learners wherever they go.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#how" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#why" className="hover:text-white transition-colors">Why Daleel</a></li>
              <li><Link href="/verify" className="hover:text-white transition-colors">Verify a record</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Get started</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col-reverse md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/50">© 2026 Daleel. Built for learners on the move.</p>
            <p className="text-xs text-white/50">Made for institutions, camps, and communities worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}