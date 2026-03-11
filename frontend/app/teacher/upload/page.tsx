"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('teacher_token');
    if (!token) {
      router.push('/teacher/login');
    }
  }, [router]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.ppt') && !selectedFile.name.endsWith('.pptx')) {
      setError('Type de fichier invalide. Veuillez importer un document PDF ou PowerPoint.');
      return;
    }
    
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Fichier trop volumineux. La taille maximale est de 20 Mo.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier à importer.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name.split('.')[0]); // Default title is filename

    try {
      const res = await axios.post(`${API_URL}/api/generate-quiz`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const quizId = res.data.quiz_id;
      // Redirect to the generated quiz teacher edit view
      router.push(`/teacher/quiz/${quizId}/edit`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Échec de la génération du QCM. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/teacher/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour au Tableau de bord
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Générer un QCM</h1>
        <p className="mt-2 text-slate-600">Importez votre document pédagogique et laissez l'IA faire le reste.</p>
      </div>

      <div className="card shadow-lg shadow-brand-500/5">
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
          } ${file ? 'border-green-500 bg-green-50/50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">{file.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                onClick={() => setFile(null)}
                className="mt-4 text-sm text-red-600 font-medium hover:text-red-700 underline"
              >
                Supprimer le fichier
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-white text-slate-400 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Cliquez ou glissez un fichier ici</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6">Supporte les documents PDF, PPT, PPTX jusqu'à 20 Mo.</p>
              
              <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
                <span>Parcourir les fichiers</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.ppt,.pptx" />
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="btn-primary w-full sm:w-auto px-8 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Générer le QCM'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
