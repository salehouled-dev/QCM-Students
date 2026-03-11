"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, Calendar, ArrowRight, Loader2, FileText, LogOut } from 'lucide-react';
import axios from 'axios';

// The standard base URL for local testing, can be moved to env later
const API_URL = 'https://qcm-students-production.up.railway.app';

type Quiz = {
  id: string;
  title: string;
  created_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      // Check for auth token
      const token = localStorage.getItem('teacher_token');
      if (!token) {
        router.push('/teacher/login');
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/quizzes`);
        setQuizzes(res.data);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacher_token');
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Enseignant</h1>
          <p className="text-slate-600 mt-1">Gérez vos QCM générés et consultez les résultats de vos étudiants.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/teacher/upload" className="btn-primary py-3 gap-2 shadow-brand-500/25 shadow-lg">
            <Plus className="w-5 h-5" />
            Créer un nouveau QCM
          </Link>
          <button onClick={handleLogout} className="btn-secondary py-3 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-6 text-brand-500">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun QCM trouvé</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Vous n'avez pas encore généré de QCM. Téléchargez un document pour commencer à suivre la progression de vos élèves.
          </p>
          <Link href="/teacher/upload" className="btn-primary">
            Générer mon premier QCM
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card group hover:border-brand-300 hover:shadow-md border border-transparent">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-brand-50 text-brand-700 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1" title={quiz.title}>
                {quiz.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Calendar className="w-4 h-4" />
                <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/teacher/dashboard/quiz/${quiz.id}`} className="flex-1 btn-secondary justify-center py-2 px-3 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200">
                  <Users className="w-4 h-4 mr-2" /> Résultats
                </Link>
                <Link href={`/student/quiz/${quiz.id}`} target="_blank" className="flex-1 btn-primary justify-center py-2 px-3 text-xs">
                  Aperçu QCM <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
