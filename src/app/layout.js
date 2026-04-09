import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import ClientRouteProtection from "./components/ClientRouteProtection";
import { NotificationProvider } from "@/context/NotificationContext";
import GlobalNavigationLoader from "./components/ui/GlobalNavigationLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Student Portal",
  description: "Connect with your student network",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Student Portal",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 0,
  viewportFit: "cover",
};

import PageTransition from "./components/ui/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-center"
          containerStyle={{
            top: 80,
            left: 0,
            right: 0,
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#fff",
              borderRadius: "20px",
              padding: "12px 20px",
              fontSize: "13px",
              fontWeight: "900",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              zIndex: 99999,
              maxWidth: "calc(100vw - 2rem)",
              wordBreak: "break-word",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
              style: {
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
              style: {
                border: "1px solid rgba(239, 68, 68, 0.3)",
              },
            },
          }}
        />
        <ThemeProvider>
          <Suspense fallback={null}>
            <GlobalNavigationLoader />
          </Suspense>
          <NotificationProvider>
            <ClientRouteProtection>
              <PageTransition>
                {children}
              </PageTransition>
            </ClientRouteProtection>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
