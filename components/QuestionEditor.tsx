import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { AUM_CATEGORIES } from '@/lib/assessmentQuestions';
import { AKPD_CATEGORIES } from '@/lib/akpdQuestions';
import {
  getAUMQuestionsWithSupabase,
  getAKPDQuestionsWithSupabase,
  saveAUMQuestions,
  saveAKPDQuestions,
} from '@/lib/assessmentQuestionsDB';

interface EditableQuestion {
  id: string;
  category: string;
  text: string;
}

interface QuestionEditorProps {
  onBack: () => void;
}

export default function QuestionEditor({ onBack }: QuestionEditorProps) {
  const { user } = useAuth();
  const [assessmentType, setAssessmentType] = useState<'aum' | 'akpd'>('aum');
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('pribadi');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authorization check - only super admin and teacher can edit
  const isAuthorized = user?.role === 'teacher' || user?.isSuperAdmin;

  useEffect(() => {
    loadQuestions();
  }, [assessmentType]);

  const loadQuestions = async () => {
    try {
      setError(null);
      if (assessmentType === 'aum') {
        const aumQuestions = await getAUMQuestionsWithSupabase();
        setQuestions(aumQuestions);
        setSelectedCategory('pribadi');
      } else {
        const akpdQuestions = await getAKPDQuestionsWithSupabase();
        setQuestions(akpdQuestions);
        if (AKPD_CATEGORIES.length > 0) {
          setSelectedCategory(AKPD_CATEGORIES[0]);
        }
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
    } else {
      return AKPD_CATEGORIES.map((name) => ({
        id: name,
        name: name,
        label: name,
      }));
    }
  };

  const getCategoryLabel = () => {
    const categories = getCategories();
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.label || selectedCategory;
  };

  const categoryQuestions = questions.filter((q) => q.category === selectedCategory);

  const handleEditQuestion = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
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
      let result;
      if (assessmentType === 'aum') {
        result = await saveAUMQuestions(questions as any, user.id);
      } else {
        result = await saveAKPDQuestions(questions as any, user.id);
      }

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

  if (!isAuthorized) {
    return (
      <div className="px-6 md:px-8 py-8">
        <div className="card p-12 text-center bg-red-50 border-2 border-red-200">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">
            Hanya super admin dan teacher yang dapat mengedit pertanyaan asesmen.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
      >
        <ChevronLeft size={20} />
        Kembali ke Pengaturan
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ubah Soal Pertanyaan</h1>
        <p className="text-gray-600">
          Edit pertanyaan untuk disesuaikan dengan kebutuhan sekolah
        </p>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Assessment Type Selector */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Asesmen</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setAssessmentType('akpd')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              assessmentType === 'akpd'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            AKPD (Angket Kebutuhan Peserta Didik)
          </button>
          <button
            onClick={() => setAssessmentType('aum')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              assessmentType === 'aum'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            AUM (Alat Ungkap Masalah)
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pilih {assessmentType === 'aum' ? 'Bidang' : 'Kategori'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {getCategories().map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg font-medium transition-all text-sm ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {getCategoryLabel()}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Jumlah soal: {categoryQuestions.length}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {categoryQuestions.map((question, index) => (
            <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4 mb-3">
                <span className="text-lg font-bold text-gray-400 flex-shrink-0 w-8">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  {editingId === question.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveQuestion(question.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save size={16} />
                          Simpan
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 mb-3">{question.text}</p>
                      <button
                        onClick={() => handleEditQuestion(question.id, question.text)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit Pertanyaan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium w-full justify-center ${
              loading
                ? 'bg-blue-400 text-white cursor-not-allowed opacity-75'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
          {saved && (
            <p className="text-green-600 text-sm mt-3 text-center font-medium">
              ✓ Perubahan berhasil disimpan ke database
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="card p-6 mt-6 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informasi</h3>
        <ul className="text-sm text-blue-900 space-y-1">
          <li>• Perubahan akan disimpan ke database Supabase secara terpusat</li>
          <li>• Edit pertanyaan dengan mengklik tombol "Edit Pertanyaan"</li>
          <li>• Klik "Simpan Semua Perubahan" untuk menyimpan semua perubahan</li>
          <li>• Hanya super admin dan teacher yang dapat mengedit pertanyaan asesmen</li>
        </ul>
      </div>
    </div>
  );
}
