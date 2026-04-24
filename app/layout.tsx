import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
import { AuthProvider } from "@/components/auth-provider";
import { ContactsProvider } from "@/components/contacts-provider";

export const metadata: Metadata = {
  title: "Keeply",
  description: "Keeply is a simple personal networking app for students and early-career professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ContactsProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </ContactsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
