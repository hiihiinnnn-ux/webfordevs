import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalAI Dev Platform — Learn & Build with Local AI",
  description:
    "Discover tools, models, and frameworks for running AI on your machine. Search the catalog, follow guides, and save favorites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
          <footer className="footer container">
            <p>
              Built for developers exploring local AI — REST API at{" "}
              <code>/api</code>
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
