"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Ticket,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: () => `/admin/day/${getTodayDateString()}`, label: "Daily View", icon: Calendar },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/clubs", label: "Clubs", icon: Users },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't apply admin layout to login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    // Clear any auth state here when real auth is implemented
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-cloud">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-bark/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-forest transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/admin"
            className="font-display text-lg font-bold text-white"
          >
            Admin Panel
          </Link>
          <button
            type="button"
            className="text-white/80 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-4 px-3">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const href = typeof link.href === "function" ? link.href() : link.href;
              const isActive =
                pathname === href ||
                (link.label === "Daily View" && pathname.startsWith("/admin/day")) ||
                (href !== "/admin" && link.label !== "Daily View" && pathname.startsWith(href));
              return (
                <li key={link.label}>
                  <Link
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer - back to site link */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 p-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 font-body text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            Back to main site
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cloud bg-white px-4 shadow-[var(--shadow-sm)] lg:px-6">
          {/* Mobile menu button and title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-bark hover:text-meadow lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-display text-lg font-bold text-bark sm:text-xl">
              Explore the Clubhouse Admin
            </h1>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-cloud px-4 py-2 font-body text-sm font-medium text-stone transition-colors hover:bg-sage/20 hover:text-bark"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
