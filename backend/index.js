require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const { extractTextFromBuffer } = require('./services/parserService');
const { generateQuestions } = require('./services/aiService');
const { supabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// In-memory mock database for when Supabase is not configured
const mockDB = {
  quizzes: [],
  questions: [],
  submissions: []
};

// Set up Multer for handling file uploads (in memory)
const upload = multer({ 
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AI Quiz Generator API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// === MOCK AUTHENTICATION ===
app.post('/api/auth/teacher', (req, res) => {
  const { password } = req.body;
  if (password === 'teacher123*') {
    return res.json({ success: true, token: 'fake-teacher-token' });
  }
  return res.status(401).json({ error: 'Mot de passe incorrect' });
});

app.post('/api/auth/student', (req, res) => {
  const { password } = req.body;
  if (password === 'student123') {
    return res.json({ success: true, token: 'fake-student-token' });
  }
  return res.status(401).json({ error: 'Mot de passe incorrect' });
});

// Endpoint: Generate Quiz from Document
app.post('/api/generate-quiz', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    const { title, teacher_id } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    // 1. Extract text from document
    const text = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Failed to extract text from document.' });
    }

    // 2. Generate questions via AI
    const questionsText = await generateQuestions(text);
    if (!questionsText || questionsText.length === 0) {
      return res.status(500).json({ error: 'AI failed to generate questions.' });
    }

    let quizId = `temp_${Date.now()}`;
    
    // 3. Store Quiz in Database (if supabase is configured)
    if (supabase) {
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert([{ title: title || file.originalname, teacher_id: teacher_id || null, status: 'draft' }])
        .select()
        .single();

      if (quizError) throw quizError;
      
      quizId = quizData.id;

      // 4. Store Questions
      const questionsToInsert = questionsText.map(q => ({
        quiz_id: quizId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;
    } else {
      // Use mockDB
      const newQuiz = { id: quizId, title: title || file.originalname, teacher_id: teacher_id || null, status: 'draft', created_at: new Date().toISOString() };
      mockDB.quizzes.push(newQuiz);
      
      const questionsToInsert = questionsText.map((q, index) => ({
        id: `temp_q_${Date.now()}_${index}`,
        quiz_id: quizId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
      }));
      mockDB.questions.push(...questionsToInsert);
    }

    res.json({
      message: 'Quiz generated successfully',
      quiz_id: quizId,
      questions: questionsText // Return questions for testing if DB not active
    });

  } catch (error) {
    console.error('API Error /api/generate-quiz:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Endpoint: Get specific quiz by ID
app.get('/api/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      // Fetch quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;

      // Fetch questions (omit correct_answer for student view, though keeping here and filtering in route)
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, question, options') // excluded correct_answer
        .eq('quiz_id', id);

      if (qError) throw qError;

      res.json({ quiz, questions });
    } else {
      const quiz = mockDB.quizzes.find(q => q.id === id);
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });
      
      const questions = mockDB.questions
        .filter(q => q.quiz_id === id)
        .map(q => ({ id: q.id, question: q.question, options: q.options }));
        
      res.json({ quiz, questions });
    }

  } catch (error) {
    console.error('API Error /api/quiz/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Grade and submit a quiz
app.post('/api/quiz/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, answers } = req.body; // answers is { question_id: "selected_option" }

    if (!student_name || !answers) {
      return res.status(400).json({ error: "Missing student name or answers" });
    }

    let questions;
    let score = 0;
    let totalQuestions = 0;
    let submissionData;

    if (supabase) {
      // Fetch correct answers for scoring
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('quiz_id', id);

      if (qError) throw qError;
      questions = qData;
      totalQuestions = questions.length;

      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          score += 1;
        }
      });

      // Save submission
      const { data: submission, error: subError } = await supabase
        .from('submissions')
        .insert([{
          quiz_id: id,
          student_name,
          answers,
          score,
          total_questions: totalQuestions
        }])
        .select()
        .single();

      if (subError) throw subError;
      submissionData = submission;
    } else {
      questions = mockDB.questions.filter(q => q.quiz_id === id);
      totalQuestions = questions.length;
      
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          score += 1;
        }
      });
      
      submissionData = {
        id: `sub_${Date.now()}`,
        quiz_id: id,
        student_name,
        answers,
        score,
        total_questions: totalQuestions,
        submitted_at: new Date().toISOString()
      };
      mockDB.submissions.push(submissionData);
    }

    res.json({
      message: "Submission successful",
      score: submissionData.score,
      total: submissionData.total_questions,
      submission_id: submissionData.id
    });

  } catch (error) {
    console.error('API Error /api/quiz/:id/submit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Get Teacher Quizzes
app.get('/api/quizzes', async (req, res) => {
  try {
    // In a real app we'd filter by teacher_id from auth token
    if (supabase) {
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(quizzes);
    } else {
      res.json([...mockDB.quizzes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }
  } catch (error) {
    console.error('API Error /api/quizzes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Get Published Quizzes (For Students)
app.get('/api/quizzes/published', async (req, res) => {
  try {
    if (supabase) {
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(quizzes);
    } else {
      const published = mockDB.quizzes.filter(q => q.status === 'published');
      res.json(published.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }
  } catch (error) {
    console.error('API Error /api/quizzes/published:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Update Quiz and Questions (Publishing)
app.put('/api/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions, status } = req.body;

    if (supabase) {
      // 1. Update quiz title and status
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({ title, status: status || 'published' })
        .eq('id', id);
      if (quizError) throw quizError;

      // 2. Delete old questions
      const { error: delError } = await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', id);
      if (delError) throw delError;

      // 3. Insert new questions
      const questionsToInsert = questions.map(q => ({
        quiz_id: id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
      }));
      const { error: qError } = await supabase
        .from('questions')
        .insert(questionsToInsert);
      if (qError) throw qError;

      res.json({ message: 'Quiz updated and published successfully' });
    } else {
      // Update mockDB
      const quizIndex = mockDB.quizzes.findIndex(q => q.id === id);
      if (quizIndex === -1) return res.status(404).json({ error: 'Quiz not found' });
      
      mockDB.quizzes[quizIndex].title = title || mockDB.quizzes[quizIndex].title;
      mockDB.quizzes[quizIndex].status = status || 'published';

      // Remove old questions
      mockDB.questions = mockDB.questions.filter(q => q.quiz_id !== id);

      // Add new questions
      const newQuestions = questions.map((q, i) => ({
        id: `temp_q_${Date.now()}_${i}`,
        quiz_id: id,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer
      }));
      mockDB.questions.push(...newQuestions);

      res.json({ message: 'Quiz updated and published successfully' });
    }
  } catch (error) {
    console.error('API Error /api/quiz/:id (update):', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Get specific quiz results
app.get('/api/quiz/:id/results', async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('quiz_id', id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      res.json(submissions);
    } else {
      const submissions = mockDB.submissions
        .filter(s => s.quiz_id === id)
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      res.json(submissions);
    }
  } catch (error) {
    console.error('API Error /api/quiz/:id/results:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} at 0.0.0.0`);
});
