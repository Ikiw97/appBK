import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { getAUMQuestionsWithCustom, AUM_CATEGORIES } from '@/lib/assessmentQuestions';
import { calculateAUMResult, AUMResult } from '@/lib/aumResultCalculator';
import { submitAssessmentResult } from '@/lib/supabaseClient';
import AUMResultView from './AUMResultView';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';

interface AUMAssessmentFormProps {
  onBack: () => void;
  schoolMode: SchoolMode;
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

export default function AUMAssessmentForm({ onBack, schoolMode }: AUMAssessmentFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aumResult, setAumResult] = useState<AUMResult | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('pribadi');

  const classOptions = generateClasses(schoolMode);
  const questions = getAUMQuestionsWithCustom();
  const categoryQuestions = questions.filter((q) => q.categoryId === currentCategory);
  const currentQuestionInCategory = categoryQuestions[currentQuestionIndex];

  useEffect(() => {
    // Calculate total progress across all questions
    const totalProgress = (questions.filter((q) => {
      const key = `question_${questions.indexOf(q)}`;
      return formData[key];
    }).length / questions.length) * 100;
  }, [formData, questions]);

  const handleInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStartQuestions = () => {
    if (!formData.nama.trim() || !formData.kelas.trim() || !formData.jenisKelamin.trim()) {
      alert('Mohon isi nama, kelas, dan jenis kelamin terlebih dahulu');
      return;
    }
    setStep('questions');
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      alert('Pilih jawaban terlebih dahulu');
      return;
    }

    const questionIndex = questions.indexOf(currentQuestionInCategory);
    setFormData((prev) => ({
      ...prev,
      [`question_${questionIndex}`]: selectedAnswer,
    }));

    // Move to next question
    if (currentQuestionIndex < categoryQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Move to next category
      const currentCategoryIndex = AUM_CATEGORIES.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentCategoryIndex < AUM_CATEGORIES.length - 1) {
        const nextCategory = AUM_CATEGORIES[currentCategoryIndex + 1];
        setCurrentCategory(nextCategory.id);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
      } else {
        // All done
        handleSubmitAUM();
      }
    }
  };

  const handleSubmitAUM = async () => {
    setLoading(true);
    try {
      const result = calculateAUMResult(formData.nama as string, formData.kelas as string, formData.jenisKelamin as string, formData as Record<string, string>);
      setAumResult(result);

      // Save to Supabase
      await submitAssessmentResult('aum', formData, questions);
      setStep('result');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Terjadi kesalahan saat menyimpan hasil asesmen');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      const prevQuestionIndex = questions.indexOf(categoryQuestions[currentQuestionIndex - 1]);
      const prevAnswer = formData[`question_${prevQuestionIndex}`];
      setSelectedAnswer(prevAnswer ? String(prevAnswer) : null);
    } else {
      // Move to previous category
      const currentCategoryIndex = AUM_CATEGORIES.findIndex(
        (cat) => cat.id === currentCategory
      );
      if (currentCategoryIndex > 0) {
        const prevCategory = AUM_CATEGORIES[currentCategoryIndex - 1];
        setCurrentCategory(prevCategory.id);
        const prevCategoryQuestions = questions.filter(
          (q) => q.categoryId === prevCategory.id
        );
        const newQuestionIndex = prevCategoryQuestions.length - 1;
        setCurrentQuestionIndex(newQuestionIndex);
        const prevQuestionObj = prevCategoryQuestions[newQuestionIndex];
        const globalQuestionIndex = questions.indexOf(prevQuestionObj);
        const prevAnswer = formData[`question_${globalQuestionIndex}`];
        setSelectedAnswer(prevAnswer ? String(prevAnswer) : null);
      }
    }
  };

  const getTotalProgress = () => {
    const answeredCount = questions.filter((q) => {
      const key = `question_${questions.indexOf(q)}`;
      return formData[key];
    }).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  const getCurrentCategoryProgress = () => {
    const categoryIndex = AUM_CATEGORIES.findIndex((cat) => cat.id === currentCategory);
    const totalCategories = AUM_CATEGORIES.length;
    return Math.round(((categoryIndex + 1) / totalCategories) * 100);
  };

  if (step === 'result' && aumResult) {
    return <AUMResultView result={aumResult} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container max-w-2xl">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Kembali ke Daftar Asesmen
        </button>

        {step === 'info' && (
          <div className="card p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Asesmen AUM (Alat Ungkap Masalah)
            </h1>
            <p className="text-gray-600 mb-8">
              Silakan isi informasi dasar Anda sebelum memulai asesmen. Asesmen ini terdiri dari 70 pertanyaan yang terbagi menjadi 7 bidang.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.nama}
                  onChange={(e) => handleInfoChange('nama', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Kelas
                </label>
                <select
                  className="input-field"
                  value={formData.kelas}
                  onChange={(e) => handleInfoChange('kelas', e.target.value)}
                >
                  <option value="">Pilih Kelas</option>
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Jenis Kelamin
                </label>
                <select
                  className="input-field"
                  value={formData.jenisKelamin}
                  onChange={(e) => handleInfoChange('jenisKelamin', e.target.value)}
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>ℹ️ Informasi:</strong> Asesmen ini akan menanyakan Anda tentang berbagai aspek kehidupan meliputi bidang pribadi, sosial, belajar, karier, keluarga, agama, dan nilai & moral.
                </p>
              </div>

              <button
                onClick={handleStartQuestions}
                className="btn-primary w-full text-lg py-3 mt-8"
              >
                Mulai Asesmen
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && currentQuestionInCategory && (
          <div className="card p-8">
            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium text-gray-700">
                  Progress Keseluruhan
                </h2>
                <span className="text-sm font-medium text-blue-600">{getTotalProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
            </div>

            {/* Category Progress */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🧩 {AUM_CATEGORIES.find((c) => c.id === currentCategory)?.label}
                </h3>
                <p className="text-sm text-gray-600">
                  Pertanyaan {currentQuestionIndex + 1} dari {categoryQuestions.length}
                </p>
              </div>

              {/* Category Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AUM_CATEGORIES.map((category) => {
                  const isCurrentCategory = category.id === currentCategory;
                  const categoryQs = questions.filter((q) => q.categoryId === category.id);
                  const answeredInCategory = categoryQs.filter((q) => {
                    const key = `question_${questions.indexOf(q)}`;
                    return formData[key];
                  }).length;
                  const isComplete = answeredInCategory === categoryQs.length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCurrentCategory(category.id);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${
                        isCurrentCategory
                          ? 'bg-blue-600 text-white'
                          : isComplete
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {currentQuestionInCategory.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestionInCategory.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={loading}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 border-2 rounded-full flex-shrink-0 flex items-center justify-center ${
                          selectedAnswer === option
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAnswer === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentCategory === 'pribadi' && currentQuestionIndex === 0 || loading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                <ChevronLeft size={18} className="inline mr-2" />
                Sebelumnya
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Lanjutkan
                <ChevronRight size={18} className="inline ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
