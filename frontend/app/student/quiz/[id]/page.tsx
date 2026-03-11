"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://qcm-students-production.up.railway.app';

type Question = {
  id: string;
  question: string;
  options: string[];
};

type Quiz = {
  id: string;
  title: string;
};

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({}); // question_id -> option
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('student_token');
    const name = localStorage.getItem('student_name');
    if (!token || !name) {
      router.push('/student/login');
      return;
    }
    setStudentName(name);

    async function fetchQuiz() {
      try {
        const res = await axios.get(`${API_URL}/api/quiz/${id}`);
        if (!res.data.quiz) throw new Error("Quiz not found");
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
      } catch (err: any) {
        console.error(err);
        setError('Impossible de charger le QCM. Il a peut-être été supprimé.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchQuiz();
  }, [id, router]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < questions.length) {
      alert("Veuillez répondre à toutes les questions avant de valider.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/quiz/${id}/submit`, {
        student_name: studentName,
        answers: answers
      });
      // Navigate to success page, bypassing the result screen
      router.push(`/student/quiz/${id}/success`);
    } catch (err: any) {
      console.error(err);
      setError('Échec de la validation du QCM. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand-600" /></div>;
  if (error || !quiz) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800">{error || "QCM introuvable"}</h2>
    </div>
  );

  if (!started) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20">
        <div className="card text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{quiz.title}</h1>
          <p className="text-slate-600 mb-8">{questions.length} questions dans cette évaluation.</p>
          
          <div className="max-w-sm mx-auto mb-8 text-center text-slate-700 font-medium">
            Connecté en tant que : <span className="text-brand-600 font-bold">{studentName}</span>
          </div>
          
          <button 
            onClick={() => setStarted(true)} 
            className="btn-primary w-full max-w-sm"
          >
            Commencer le QCM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 p-6 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-20 z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Élève : <span className="font-medium text-slate-700">{studentName}</span></p>
        </div>
        <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-medium text-sm border border-brand-100 shrink-0">
          Progression : {Object.keys(answers).length} / {questions.length}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="card">
            <h3 className="text-lg font-medium text-slate-900 mb-6 flex gap-3">
              <span className="shrink-0 bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span>{q.question}</span>
            </h3>
            
            <div className="space-y-3 pl-11">
              {q.options.map((option, optIdx) => {
                const isSelected = answers[q.id] === option;
                return (
                  <label 
                    key={optIdx} 
                    className={`block w-full p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500' 
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 shrink-0 transition-colors ${
                        isSelected ? 'border-brand-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>}
                      </div>
                      <span className={`text-base ${isSelected ? 'text-brand-900 font-medium' : 'text-slate-700'}`}>
                        {option}
                      </span>
                    </div>
                    {/* Hidden radio input for accessibility */}
                    <input 
                      type="radio" 
                      name={`question_${q.id}`} 
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(q.id, option)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-6 pb-20">
          <button 
            type="submit" 
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="btn-primary px-10 py-4 text-lg w-full sm:w-auto shadow-brand-500/30 shadow-lg"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Validation...</>
            ) : 'Valider vos réponses'}
          </button>
        </div>
      </form>
    </div>
  );
}
