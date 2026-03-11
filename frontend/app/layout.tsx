import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Générateur de QCM IA',
  description: 'Générez automatiquement des QCM à partir de documents pédagogiques grâce à l\'IA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex shrink-0 items-center">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Q</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900">QuizGen AI</span>
                </a>
              </div>
              <div className="flex gap-4">
                <a href="/student/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors py-2">
                  Espace Étudiant
                </a>
                <a href="/teacher/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors py-2">
                  Espace Enseignant
                </a>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 mt-16">{children}</main>
        <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
             2026 QuizGen IA. Tous droits réservés.
          </div>
        </footer>
      </body>
    </html>
  );
}
