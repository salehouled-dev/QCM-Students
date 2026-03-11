import { ArrowRight, BookOpen, Layers, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 relative">
          Bienvenue sur votre 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700 block mt-2">
            Plateforme d'Évaluation
          </span>
        </h1>
        <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Accédez à votre espace dédié.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/teacher/login" className="btn-primary text-lg px-8 py-4 gap-2 rounded-xl group relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Espace Enseignant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </Link>
          <Link href="/student/login" className="btn-secondary text-lg px-8 py-4 rounded-xl">
            Espace Étudiant
          </Link>
        </div>
      </div>
    </div>
  );
}
