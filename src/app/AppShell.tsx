"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/students", label: "Students" },
  { href: "/students/new", label: "Add student" },
  { href: "/students/status", label: "Status" },
];

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link className="brand" href="/students" aria-label="Student Management home">
            <span className="brand-mark">S</span>
            <span>Student Management</span>
          </Link>
          <nav className="primary-nav" aria-label="Main navigation">
            {navigation.map(({ href, label }) => {
              const active = pathname === href ||
                (href === "/students" && pathname.startsWith("/students/") &&
                  pathname !== "/students/new" && pathname !== "/students/status");

              return (
                <Link
                  className={`nav-link${active ? " active" : ""}`}
                  href={href}
                  key={href}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}