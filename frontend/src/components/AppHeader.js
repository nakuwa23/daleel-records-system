"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, isAdmin } from "@/lib/api";

const BASE_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Learners", href: "/learners" },
  { label: "Verify", href: "/verify" },
];

export default function AppHeader({ onBack, actions }) {
  const pathname = usePathname();
  const router = useRouter();
  const navLinks = isAdmin()
    ? [...BASE_NAV_LINKS, { label: "Analytics", href: "/analytics" }]
    : BASE_NAV_LINKS;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="bg-teal-primary px-6 py-3 flex items-center gap-1">
      {onBack && (
        <button onClick={onBack} className="text-teal-tint hover:text-white mr-2">
          ←
        </button>
      )}

      <nav className="flex gap-1 flex-1">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-2.5 border-b-2 transition-colors ${
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

      {actions}
      <button
        onClick={handleLogout}
        className="text-sm text-teal-tint hover:text-white transition-colors ml-3"
      >
        Log out
      </button>
    </header>
  );
}
