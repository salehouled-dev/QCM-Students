"use client";

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="card text-center py-16 px-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Évaluation terminée !</h1>
          <p className="text-xl text-slate-600 mb-10">
            Merci, vos réponses ont bien été enregistrées et envoyées à votre professeur.
          </p>
          
          <div className="mx-auto max-w-sm rounded-2xl p-8 mb-10 bg-blue-50 text-blue-800">
            <p className="font-medium">
              Votre résultat détaillé sera consultable directement avec votre enseignant.
            </p>
          </div>
          
          <Link href="/student/dashboard" className="btn-primary">
            Retourner à mon Espace
          </Link>
        </div>
      </div>
    </div>
  );
}
