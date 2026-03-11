"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Trophy, Users, BarChart } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = 'https://qcm-students-production.up.railway.app';

type Submission = {
  id: string;
  student_name: string;
  score: number;
  total_questions: number;
  submitted_at: string;
};

type Quiz = {
  id: string;
  title: string;
  created_at: string;
};

export default function DashboardQuizResults() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('teacher_token');
    if (!token) {
      router.push('/teacher/login');
      return;
    }

    async function fetchData() {
      try {
        const [quizRes, subRes] = await Promise.all([
          axios.get(`${API_URL}/api/quiz/${id}`),
          axios.get(`${API_URL}/api/quiz/${id}/results`)
        ]);
        
        setQuiz(quizRes.data.quiz);
        setSubmissions(subRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchData();
  }, [id]);

  const exportCSV = () => {
    if (submissions.length === 0) return;
    
    const headers = ['Student Name', 'Score', 'Total Questions', 'Percentage', 'Submitted At'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + submissions.map(s => {
          const pass = Math.round((s.score / s.total_questions) * 100);
          return `"${s.student_name}",${s.score},${s.total_questions},${pass}%,${new Date(s.submitted_at).toLocaleString()}`;
        }).join('\n');
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${quiz?.title || 'quiz'}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>;
  if (!quiz) return <div className="text-center py-20 text-red-500 font-bold">Quiz not found</div>;

  const totalStudents = submissions.length;
  const avgScore = totalStudents > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score / s.total_questions) * 100, 0) / totalStudents)
    : 0;
  const highestScore = totalStudents > 0
    ? Math.max(...submissions.map(s => Math.round((s.score / s.total_questions) * 100)))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/teacher/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au Tableau de bord
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-slate-500 mt-1">Results and Analytics</p>
        </div>
        <button 
          onClick={exportCSV} 
          disabled={totalStudents === 0}
          className="btn-secondary"
        >
          Export CSV
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card flex items-center p-6 border-l-4 border-l-brand-500">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mr-4 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-6 border-l-4 border-l-green-500">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mr-4 shrink-0">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{avgScore}%</p>
          </div>
        </div>
        
        <div className="card flex items-center p-6 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mr-4 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Highest Score</p>
            <p className="text-2xl font-bold text-slate-900">{highestScore}%</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Student Results</h3>
        </div>
        
        {submissions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No submissions yet. Share the quiz link with your students.
            <div className="mt-4">
              <code className="bg-slate-100 px-3 py-2 rounded text-slate-800 select-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/quiz/${quiz.id}` : ''}
              </code>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const percentage = Math.round((sub.score / sub.total_questions) * 100);
                  let badgeColor = 'bg-yellow-100 text-yellow-800';
                  if (percentage >= 75) badgeColor = 'bg-green-100 text-green-800';
                  else if (percentage < 50) badgeColor = 'bg-red-100 text-red-800';
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {sub.student_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {sub.score} / {sub.total_questions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
