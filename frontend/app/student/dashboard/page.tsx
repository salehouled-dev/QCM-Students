"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenTool, Calendar, LogOut, Loader2, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = 'https://qcm-students-production.up.railway.app';

type Quiz = {
  id: string;
  title: string;
  created_at: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    const name = localStorage.getItem('student_name');
    if (!token || !name) {
      router.push('/student/login');
      return;
    }
    setStudentName(name);

    async function fetchPublishedQuizzes() {
      try {
        const res = await axios.get(`${API_URL}/api/quizzes/published`);
        setQuizzes(res.data);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPublishedQuizzes();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_name');
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Espace Étudiant</h1>
          <p className="text-slate-600 mt-1">Bienvenue {studentName}, voici les QCM disponibles.</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary py-3 gap-2 shrink-0 border-slate-200 hover:bg-slate-100 text-slate-700">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-6 text-blue-500">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun QCM disponible</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Votre enseignant n'a pas encore publié de QCM. Veuillez vérifier plus tard !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="card group hover:border-blue-300 hover:shadow-md border border-transparent transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <PenTool className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1" title={quiz.title}>
                {quiz.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Calendar className="w-4 h-4" />
                <span>Publié le {new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
              <Link href={`/student/quiz/${quiz.id}`} className="btn-primary w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 ring-blue-500">
                Commencer l'évaluation
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
