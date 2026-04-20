import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ContactsProvider } from "@/components/contacts-provider";

export const metadata: Metadata = {
  title: "Networking CRM",
  description: "A simple personal networking CRM for students and early-career professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ContactsProvider>
          <AppShell>{children}</AppShell>
        </ContactsProvider>
      </body>
    </html>
  );
}
