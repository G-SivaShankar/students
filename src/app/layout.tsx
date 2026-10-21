import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import AppShell from "./AppShell";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Management",
  description: "Manage student records and enrollment status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}