import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { AUM_CATEGORIES, assessmentQuestions } from '@/lib/assessmentQuestions';
import { 
  AKPD_CATEGORIES, 
  AKPD_QUESTIONS_BY_GRADE, 
  getAKPDQuestionsByGrade,
  type AKPDQuestion 
} from '@/lib/akpdQuestions';
import {
  getAssessmentQuestions,
  saveAssessmentQuestions,
} from '@/lib/assessmentQuestionsDB';

interface EditableQuestion {
  id: string;
  category: string;
  text: string;
  gradeLevel?: string;
  // Generic helper for different shapes
  [key: string]: any;
}

interface QuestionEditorProps {
  onBack: () => void;
  assessmentType: string;
}

// Grade levels for SMP
const GRADE_LEVELS = ['VII', 'VIII', 'IX'];

export default function QuestionEditor({ onBack, assessmentType }: QuestionEditorProps) {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('VII');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if this is AKPD assessment (needs grade level selector)
  const isAKPD = assessmentType === 'akpd';

  useEffect(() => {
    if (!authLoading) {
      loadQuestions();
    }
  }, [assessmentType, authLoading, selectedGradeLevel]);

  const loadQuestions = async () => {
    try {
      setError(null);
      
      let loadedQuestions: any[];
      
      if (isAKPD) {
        // For AKPD, load grade-specific questions
        loadedQuestions = getAKPDQuestionsByGrade(selectedGradeLevel);
      } else {
        loadedQuestions = await getAssessmentQuestions(assessmentType);
      }

      // Normalize the loaded questions
      const normalizedQuestions = (loadedQuestions as any[]).map(q => ({
        ...q,
        text: Array.isArray(q.text) ? q.text.join('\n') : q.text
      }));

      setQuestions(normalizedQuestions);

      // Set initial category
      if (normalizedQuestions.length > 0) {
        // Collect unique categories
        const categories = Array.from(new Set(normalizedQuestions.map((q: any) => q.categoryId || q.category)));
        if (categories.length > 0) setSelectedCategory(categories[0]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questions';
      setError(errorMessage);
      console.error('Error loading questions:', err);
    }
  };

  const getCategories = () => {
    if (assessmentType === 'aum') {
      return AUM_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        label: c.label,
      }));
    } else if (assessmentType === 'akpd') {
      // For AKPD, derive categories from loaded questions
      const uniqueCategories = Array.from(new Set(questions.map(q => q.category)));
      return uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        label: cat
      }));
    } else {
      // Dynamic categories from questions
      const uniqueCategories = Array.from(new Set(questions.map(q => q.category)));
      return uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        label: cat
      }));
    }
  };

  const getCategoryLabel = () => {
    // Basic label finder
    const categories = getCategories();
    // Try to match by ID or Name (since generic ones might use name as ID)
    const category = categories.find((c) => c.id === selectedCategory || c.name === selectedCategory);
    return category?.label || selectedCategory;
  };

  // Filter logic handled loosely to support both ID and Name matching
  const categoryQuestions = questions.filter((q) =>
    q.categoryId === selectedCategory || q.category === selectedCategory
  );

  const handleEditQuestion = (id: string, text: string | string[]) => {
    setEditingId(id);
    setEditText(typeof text === 'string' ? text : JSON.stringify(text));
  };

  const handleSaveQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: editText } : q))
    );
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveAll = async () => {
    if (!user?.id) {
      setError('Error: User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // For AKPD, we need to save with grade level info
      const questionsToSave = isAKPD 
        ? questions.map(q => ({ ...q, gradeLevel: selectedGradeLevel }))
        : questions;
      
      const result = await saveAssessmentQuestions(
        isAKPD ? `akpd_${selectedGradeLevel}` : assessmentType, 
        questionsToSave, 
        user.id
      );

      if (result?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result?.error || 'Failed to save questions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 font-medium"
      >
        <ChevronLeft size={20} />
        Kembali ke Daftar Asesmen
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Soal: {(assessmentType || 'Asesmen').toUpperCase()}</h1>
        <p className="text-gray-600">
          Sesuaikan pertanyaan asesmen dengan kebutuhan sekolah Anda.
        </p>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Grade Level Selector for AKPD */}
      {isAKPD && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Pilih Tingkat Kelas
          </h2>
          <div className="flex flex-wrap gap-3">
            {GRADE_LEVELS.map((grade) => {
              const gradeQuestions = AKPD_QUESTIONS_BY_GRADE[grade] || [];
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGradeLevel(grade)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all text-base flex flex-col items-center min-w-[100px] ${
                    selectedGradeLevel === grade
                      ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg transform scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-300'
                  }`}
                >
                  <span className="text-lg">Kelas {grade}</span>
                  <span className={`text-xs ${selectedGradeLevel === grade ? 'text-primary-100' : 'text-gray-400'}`}>
                    {gradeQuestions.length} soal
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💡 Setiap tingkat kelas memiliki pertanyaan yang berbeda sesuai dengan kebutuhan perkembangannya.
          </p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pilih Kategori
        </h2>
        <div className="flex flex-wrap gap-2">
          {getCategories().map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedCategory === category.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {getCategoryLabel()}
                {isAKPD && <span className="ml-2 text-primary-600">(Kelas {selectedGradeLevel})</span>}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Total: {categoryQuestions.length} pertanyaan
              </p>
            </div>
            {saved && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                Tersimpan!
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {categoryQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isAKPD 
                ? `Tidak ada pertanyaan untuk kategori ini di Kelas ${selectedGradeLevel}.`
                : 'Tidak ada pertanyaan untuk kategori ini.'
              }
            </div>
          ) : (
            categoryQuestions.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-primary-50 transition-colors group">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-bold text-gray-400 flex-shrink-0 w-8 pt-1">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    {editingId === question.id ? (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-4 border border-primary-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium text-gray-800"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveQuestion(question.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm shadow-sm"
                          >
                            <Save size={16} />
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-gray-800 leading-relaxed text-lg font-medium">{question.text}</p>
                        <button
                          onClick={() => handleEditQuestion(question.id, question.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1 bg-primary-50 rounded-lg shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )))}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 italic">
              {isAKPD 
                ? `*Perubahan akan disimpan untuk Kelas ${selectedGradeLevel}`
                : '*Jangan lupa simpan semua perubahan ke database'
              }
            </p>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white hover:from-primary-700 hover:to-primary-900'
                }`}
            >
              <Save size={20} />
              {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
