import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({subsets:['latin']})
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VEHIQL",
  description: "Find Your Dream Car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <Header/>
        <main className="min-h-screen">
        {children}
        </main>
        <Toaster richColors/>
        <footer className="bg-blue-50 py-12">
          <div className="text-gray-600 text-center">
            <p> Copyright@ Gappoche</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
