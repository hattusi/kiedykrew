import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KiedyKrew – punkty krwiodawstwa w Polsce",
  description: "Wyszukiwarka punktów krwiodawstwa. Godziny otwarcia, dostępne terminy, zapotrzebowanie na grupy krwi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <a href="/" className="flex items-center gap-2.5">
                <span className="text-2xl">🩸</span>
                <span className="text-xl font-bold text-blood-600">KiedyKrew</span>
              </a>
              <nav className="flex items-center gap-6 text-sm">
                <a href="/stations" className="text-gray-600 hover:text-gray-900 font-medium">Punkty</a>
                <a href="/?q=" className="text-gray-600 hover:text-gray-900 font-medium">Szukaj</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
          <p>
            KiedyKrew nie jest oficjalnym systemem RCKiK. Dane są agregowane z publicznych źródeł.{" "}
            <strong>Rezerwację wizyt wykonuj wyłącznie przez oficjalne strony punktów krwiodawstwa.</strong>
          </p>
        </footer>
      </body>
    </html>
  );
}
