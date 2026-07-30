"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, isAdmin, getRole } from "@/lib/api";

const NAV_LINKS = {
  dashboard: { label: "Dashboard", href: "/dashboard" },
  learners: { label: "Learners", href: "/learners" },
  verify: { label: "Verify", href: "/verify" },
  analytics: { label: "Analytics", href: "/analytics" },
};

// Which links each role sees
const NAV_KEYS_BY_ROLE = {
  ADMINISTRATOR: ["dashboard", "learners", "verify", "analytics"],
  ISSUER_STAFF: ["dashboard", "learners"],
  VERIFIER_STAFF: ["dashboard", "verify"],
};

export default function AppHeader({ onBack, actions }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = isAdmin() ? "ADMINISTRATOR" : getRole();
  const navLinks = (NAV_KEYS_BY_ROLE[role] || ["dashboard"]).map((key) => NAV_LINKS[key]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="bg-teal-primary px-3 sm:px-6 py-3 flex items-center gap-1">
      {onBack && (
        <button onClick={onBack} className="shrink-0 text-teal-tint hover:text-white mr-1 sm:mr-2">
          ←
        </button>
      )}

      <Link href="/dashboard" className="shrink-0 flex items-center gap-2 mr-2 sm:mr-4">
        <div className="w-7 h-7 rounded-lg bg-amber-accent flex items-center justify-center text-sm font-semibold text-ink">
          D
        </div>
        <span className="hidden sm:inline text-lg font-semibold text-white">Daleel</span>
      </Link>

      <nav className="flex gap-1 flex-1 min-w-0 overflow-x-auto">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 whitespace-nowrap text-sm px-2 sm:px-3 py-2.5 border-b-2 transition-colors ${
                active
                  ? "border-amber-accent text-white"
                  : "border-transparent text-teal-tint hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {actions && <div className="shrink-0 ml-1">{actions}</div>}
      <button
        onClick={handleLogout}
        className="shrink-0 whitespace-nowrap text-sm text-teal-tint hover:text-white transition-colors ml-2 sm:ml-3"
      >
        Log out
      </button>
    </header>
  );
}
