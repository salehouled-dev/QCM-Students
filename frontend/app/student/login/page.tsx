"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = 'https://qcm-students-production.up.railway.app';

export default function StudentLogin() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/api/auth/student`, { password });
      if (res.data.success) {
        localStorage.setItem('student_token', res.data.token);
        localStorage.setItem('student_name', name);
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
      </Link>
      
      <div className="card text-center py-10 px-8 shadow-xl">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Espace Étudiant</h1>
        <p className="text-slate-600 mb-8">Identifiez-vous pour consulter et passer vos évaluations.</p>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Votre nom complet</label>
            <input 
              id="name"
              type="text" 
              className="input-field" 
              placeholder="ex: Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mot de passe de la classe</label>
            <input 
              id="password"
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || password.length === 0 || name.length < 2}
            className="btn-primary w-full justify-center bg-blue-600 hover:bg-blue-700 ring-blue-500"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {loading ? 'Connexion...' : 'Accéder aux QCM'}
          </button>
        </form>
      </div>
    </div>
  );
}
