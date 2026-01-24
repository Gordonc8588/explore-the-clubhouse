"use client";

import { useState, useEffect } from "react";
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
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  type LucideIcon,
} from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  isGroup: true;
  defaultExpanded: boolean;
  items: NavLink[];
};

type NavItem = NavLink | NavGroup;

const sidebarLinks: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/day", label: "Daily View", icon: Calendar },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/clubs", label: "Clubs", icon: Users },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
  {
    label: "Marketing",
    icon: Mail,
    isGroup: true,
    defaultExpanded: true,
    items: [
      { href: "/admin/marketing/subscribers", label: "Subscribers", icon: Users },
      { href: "/admin/marketing/newsletters", label: "Newsletters", icon: Send },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-nav-expanded");
    if (saved) {
      setExpandedGroups(JSON.parse(saved));
    } else {
      // Set default expanded states
      const defaults: Record<string, boolean> = {};
      sidebarLinks.forEach((link) => {
        if ("isGroup" in link && link.isGroup) {
          defaults[link.label] = link.defaultExpanded;
        }
      });
      setExpandedGroups(defaults);
    }
  }, []);

  // Toggle group expansion
  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => {
      const updated = { ...prev, [groupLabel]: !prev[groupLabel] };
      localStorage.setItem("admin-nav-expanded", JSON.stringify(updated));
      return updated;
    });
  };

  // Don't apply admin layout to login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
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
              // Handle groups
              if ("isGroup" in link && link.isGroup) {
                const Icon = link.icon;
                const isExpanded = expandedGroups[link.label] ?? link.defaultExpanded;
                const isAnyChildActive = link.items.some((item) =>
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                );

                return (
                  <li key={link.label}>
                    <button
                      onClick={() => toggleGroup(link.label)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 font-body text-sm font-medium transition-colors ${
                        isAnyChildActive
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu items */}
                    {isExpanded && (
                      <ul className="mt-1 space-y-1">
                        {link.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg py-3 pl-12 pr-4 font-body text-sm font-medium transition-colors ${
                                  isActive
                                    ? "bg-white/20 text-white"
                                    : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                <ItemIcon className="h-5 w-5" />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              // Handle regular flat links
              // TypeScript now knows this is a NavLink
              if (!("href" in link)) return null;

              const Icon = link.icon;
              const href = link.href;
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
              The Clubhouse Admin
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
