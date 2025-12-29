import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Download, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';

interface EIQuestion {
  id: number;
  dimension: string;
  question: string;
  scenario?: string;
  answers: string[];
  scores: number[];
}

interface EIResult {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  description: string;
  tips: string[];
}

interface FormData {
  nama: string;
  kelas: string;
  jenisKelamin: string;
  [key: string]: string | number;
}

const EI_QUESTIONS: EIQuestion[] = [
  // ===== SELF-AWARENESS (Mengenal Diri Sendiri) =====
  {
    id: 1,
    dimension: 'self-awareness',
    scenario: 'Kamu baru saja mendapat nilai ujian yang tidak memuaskan',
    question: 'Apa yang kamu rasakan dan bagaimana kamu merespons?',
    answers: [
      'Merasa sangat kecewa dan ingin menyalahkan guru',
      'Merasa kecewa tapi mencoba melihat nilai-nilai positif',
      'Merasa kecewa dan langsung mencari tahu apa yang salah',
      'Merasa sedikit kecewa dan fokus pada pembelajaran berikutnya',
      'Merasa sangat kecewa tapi bersemangat untuk perbaikan'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    dimension: 'self-awareness',
    scenario: 'Saat teman memberikan kritik tentang tingkah lakumu',
    question: 'Bagaimana kamu biasanya bereaksi?',
    answers: [
      'Merasa terserang dan marah',
      'Merasa tidak nyaman tapi mendengarkan',
      'Mendengarkan dan mulai merefleksikan diri',
      'Menerima dengan tenang dan mencari saran lebih lanjut',
      'Sangat terbuka untuk memahami perspektif mereka'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 3,
    dimension: 'self-awareness',
    question: 'Apa kekuatan terbesar yang kamu miliki?',
    answers: [
      'Tidak yakin dengan kekuatan saya',
      'Punya beberapa ide tapi tidak terlalu yakin',
      'Tahu beberapa kekuatan tapi tidak jelas sepenuhnya',
      'Cukup yakin dengan 2-3 kekuatan utama saya',
      'Sangat yakin dan bisa menjelaskan kekuatan saya'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 4,
    dimension: 'self-awareness',
    scenario: 'Ketika kamu merasa marah atau kesal',
    question: 'Apa yang kamu lakukan?',
    answers: [
      'Langsung meledak dan melakukan hal yang mungkin disesali',
      'Merasa kesal dan butuh waktu lama untuk tenang',
      'Menyadari emosi tapi kesulitan mengaturnya',
      'Menyadari emosi dan bisa mengatasinya dengan cukup baik',
      'Menyadari emosi dan segera mencari cara untuk tenang'
    ],
    scores: [1, 2, 3, 4, 5]
  },

  // ===== SELF-REGULATION (Mengelola Emosi Sendiri) =====
  {
    id: 5,
    dimension: 'self-regulation',
    scenario: 'Teman mengajak bermain game online saat kamu harus mengerjakan PR',
    question: 'Bagaimana kamu menangani situasi ini?',
    answers: [
      'Langsung bermain game dan lupa PR',
      'Tergoda bermain game tapi akhirnya PR selesai tergesa-gesa',
      'Merasa ragu tapi bisa menyelesaikan PR dulu',
      'Menunda bermain game demi menyelesaikan PR dengan baik',
      'Tegas mengatur waktu dan menyelesaikan keduanya dengan terencana'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 6,
    dimension: 'self-regulation',
    scenario: 'Kamu merasa sangat kesal dengan teman dan ingin berbicara kasar',
    question: 'Apa yang biasanya kamu lakukan?',
    answers: [
      'Langsung membentaknya tanpa pikir panjang',
      'Menahan diri tapi masih bicara dengan kasar',
      'Menahan diri dan mencoba bicara normal',
      'Mencoba menenangkan diri sebelum berbicara',
      'Pergi dulu, tenang, baru diskusi dengan tenang'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 7,
    dimension: 'self-regulation',
    question: 'Saat menghadapi tantangan atau tugas yang sulit, kamu:',
    answers: [
      'Langsung menyerah karena terlalu sulit',
      'Cepat menyerah setelah beberapa percobaan',
      'Berusaha beberapa kali tapi mudah putus asa',
      'Terus berusaha meski ada hambatan',
      'Sangat persistent dan cari cara kreatif untuk menyelesaikan'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 8,
    dimension: 'self-regulation',
    scenario: 'Kamu mengalami kegagalan atau kesalahan yang cukup besar',
    question: 'Bagaimana kamu merespons?',
    answers: [
      'Merasa sangat malu dan tidak ingin bertemu orang',
      'Merasa malu dan butuh waktu lama untuk move on',
      'Merasa sedih tapi bisa jalan kembali',
      'Bisa move on dengan cepat dan belajar dari kesalahan',
      'Langsung belajar dari kegagalan dan fokus improvement'
    ],
    scores: [1, 2, 3, 4, 5]
  },

  // ===== SOCIAL AWARENESS/EMPATHY (Memahami Perasaan Orang Lain) =====
  {
    id: 9,
    dimension: 'empathy',
    scenario: 'Teman terlihat sedih dan murung di sekolah',
    question: 'Apa yang kamu lakukan?',
    answers: [
      'Tidak memperhatikan dan fokus dengan aktivitas sendiri',
      'Memperhatikan tapi tidak tahu harus bilang apa',
      'Tanya dengan singkat apa yang terjadi',
      'Tanya dengan tulus dan mendengarkan dengan baik',
      'Tanya dengan tulus, mendengarkan, dan tawarkan dukungan'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 10,
    dimension: 'empathy',
    scenario: 'Teman mu sedang presentasi tapi gugup dan sering salah kata',
    question: 'Apa yang kamu lakukan?',
    answers: [
      'Tertawa atau membuat komentar negatif',
      'Diam saja tanpa memberikan respons',
      'Diam tapi memberikan pandangan yang mendukung',
      'Memberikan tepukan tangan untuk support',
      'Memberikan support dan tanyakan kabar setelahnya'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 11,
    dimension: 'empathy',
    question: 'Ketika teman curhat tentang masalah pribadi, kamu:',
    answers: [
      'Mengubah topik karena tidak tertarik',
      'Mendengarkan sekilas saja',
      'Mendengarkan tapi lebih fokus membalas cerita sendiri',
      'Mendengarkan dengan perhatian penuh',
      'Mendengarkan dengan empati dan memberi saran yang membantu'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 12,
    dimension: 'empathy',
    scenario: 'Ada teman yang sering dikerjain atau dijauhi oleh kelompok lain',
    question: 'Bagaimana sikapmu terhadapnya?',
    answers: [
      'Ikut menjauh atau bahkan ikut mengerjain',
      'Diam saja dan tidak terlibat',
      'Sesekali berbicara baik dengan mereka',
      'Berusaha berbicara baik dan ajak bergabung kadang',
      'Secara aktif berteman dan membela mereka saat dikerjain'
    ],
    scores: [1, 2, 3, 4, 5]
  },

  // ===== RELATIONSHIP MANAGEMENT (Mengelola Hubungan) =====
  {
    id: 13,
    dimension: 'relationship',
    scenario: 'Kamu dan teman dekat sedang berselisih pendapat yang cukup serius',
    question: 'Bagaimana kamu menangani konflik ini?',
    answers: [
      'Marah-marah dan tidak mau lagi berteman',
      'Diam dengan kesal dan biarkan waktu berjalan',
      'Coba bicara tapi mudah panas lagi',
      'Coba berbicara dengan tenang dan mencari solusi',
      'Langsung bicara dengan tenang, dengar pendapat mereka, cari solusi bersama'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 14,
    dimension: 'relationship',
    scenario: 'Kamu perlu meminta bantuan atau maaf kepada seseorang',
    question: 'Apakah kamu bisa melakukannya?',
    answers: [
      'Sangat sulit, merasa malu dan tertinggal',
      'Sulit tapi bisa jika sangat perlu',
      'Bisa tapi perlu waktu untuk berani',
      'Bisa dengan cukup mudah',
      'Sangat mudah dan tahu itu penting untuk hubungan'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 15,
    dimension: 'relationship',
    question: 'Dalam bekerja sama dengan teman/tim, kamu biasanya:',
    answers: [
      'Mendominasi atau egois dengan ide sendiri',
      'Cenderung tapi bisa mendengarkan pendapat lain',
      'Bisa mendengarkan tapi susah berkompromi',
      'Bisa mendengarkan dan mencari jalan tengah',
      'Sangat collaborative, terbuka, dan menghargai ide semua orang'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 16,
    dimension: 'relationship',
    scenario: 'Teman memiliki prestasi yang lebih baik dari kamu',
    question: 'Apa perasaanmu?',
    answers: [
      'Iri dan ingin menjauhkan diri atau mengerjain',
      'Iri tapi tetap berbicara normal',
      'Sedikit iri tapi bisa bangga untuk mereka',
      'Bangga untuk mereka dan ingin belajar dari mereka',
      'Sangat bangga dan minta tips/bantuan dari mereka'
    ],
    scores: [1, 2, 3, 4, 5]
  },

  // ===== MOTIVATION (Motivasi & Optimisme) =====
  {
    id: 17,
    dimension: 'motivation',
    question: 'Apa yang memotivasi kamu untuk belajar?',
    answers: [
      'Hanya karena dipaksa orang tua atau guru',
      'Takut nilainya jelek atau dimarahi',
      'Ingin mendapat nilai bagus dan naik kelas',
      'Ingin mendapat nilai bagus dan membanggakan keluarga',
      'Ingin belajar karena penasaran dan ingin berkembang'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 18,
    dimension: 'motivation',
    scenario: 'Kamu sedang menghadapi banyak masalah di sekolah dan rumah',
    question: 'Bagaimana sikapmu?',
    answers: [
      'Merasa putus asa dan tidak ada harapan',
      'Merasa sedih dan tertekan',
      'Merasa tertekan tapi yakin bisa dilewati',
      'Yakin bisa mengatasinya dengan bantuan orang lain',
      'Sangat yakin dan percaya ini adalah pembelajaran yang baik'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 19,
    dimension: 'motivation',
    question: 'Impian atau tujuan jangka panjang kamu adalah:',
    answers: [
      'Tidak ada, hidup aja',
      'Vague, tidak terlalu jelas',
      'Ada tapi belum terlalu spesifik',
      'Cukup jelas dan sudah mulai merencanakan',
      'Sangat jelas dan sudah punya action plan konkret'
    ],
    scores: [1, 2, 3, 4, 5]
  },
  {
    id: 20,
    dimension: 'motivation',
    scenario: 'Saat menghadapi kegagalan atau hasil yang tidak sesuai harapan',
    question: 'Apa yang kamu pikirkan?',
    answers: [
      'Saya memang bodoh dan tidak bisa',
      'Saya tidak cukup baik untuk ini',
      'Ini sulit tapi mungkin saya bisa berusaha lagi',
      'Saya bisa jika lebih giat dan strategi yang tepat',
      'Ini pembelajaran penting dan saya akan lebih baik lagi'
    ],
    scores: [1, 2, 3, 4, 5]
  },
];

const DIMENSION_INFO: Record<string, { label: string; description: string; minScore: number; maxScore: number }> = {
  'self-awareness': {
    label: '🪞 Kesadaran Diri',
    description: 'Kemampuan mengenali dan memahami emosi sendiri',
    minScore: 4,
    maxScore: 20
  },
  'self-regulation': {
    label: '🎯 Pengelolaan Diri',
    description: 'Kemampuan mengelola dan mengontrol emosi',
    minScore: 4,
    maxScore: 20
  },
  'empathy': {
    label: '💝 Empati',
    description: 'Kemampuan memahami perasaan orang lain',
    minScore: 4,
    maxScore: 20
  },
  'relationship': {
    label: '🤝 Hubungan Sosial',
    description: 'Kemampuan membangun dan memelihara hubungan baik',
    minScore: 4,
    maxScore: 20
  },
  'motivation': {
    label: '⚡ Motivasi',
    description: 'Kemampuan termotivasi dan bersikap optimis',
    minScore: 4,
    maxScore: 20
  }
};

interface EmotionalIntelligenceFormProps {
  onBack?: () => void;
  schoolMode?: SchoolMode;
}

export default function EmotionalIntelligenceForm({ onBack, schoolMode = 'smp' }: EmotionalIntelligenceFormProps) {
  const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
  const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [eiResults, setEiResults] = useState<EIResult[] | null>(null);

  const classOptions = generateClasses(schoolMode);

  const currentQuestion = EI_QUESTIONS[currentQuestionIndex];
  const totalQuestions = EI_QUESTIONS.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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

  const handleAnswer = async (scoreIndex: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentQuestion.scores[scoreIndex]
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Save results to Supabase
      setLoading(true);
      try {
        // Create formData with answers for submission
        const submitData = {
          nama: formData.nama,
          kelas: formData.kelas,
          jenisKelamin: formData.jenisKelamin,
          ...newAnswers
        };

        // Create a simplified questions array for EI assessment
        const eiQuestionsForSubmit = EI_QUESTIONS.map((q) => ({
          id: q.id,
          question: q.question,
          dimension: q.dimension
        }));

        // Save to Supabase
        await submitAssessmentResult('emotional_intelligence', submitData, eiQuestionsForSubmit as any);

        // Calculate and display results
        const results = calculateResultsWithAnswers(newAnswers);
        setEiResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error saving results:', error);
        alert('Terjadi kesalahan saat menyimpan hasil. Hasil masih ditampilkan di layar.');
        // Show results anyway even if save failed
        const results = calculateResultsWithAnswers(newAnswers);
        setEiResults(results);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setFormData({ nama: '', kelas: '', jenisKelamin: '' });
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('info');
    setShowResults(false);
    setEiResults(null);
  };

  const calculateResultsWithAnswers = (answersToUse: Record<number, number>): EIResult[] => {
    const results: EIResult[] = [];

    Object.keys(DIMENSION_INFO).forEach(dimension => {
      const dimensionQuestions = EI_QUESTIONS.filter(q => q.dimension === dimension);
      let totalScore = 0;
      let answeredCount = 0;

      dimensionQuestions.forEach(q => {
        if (answersToUse[q.id]) {
          totalScore += answersToUse[q.id];
          answeredCount++;
        }
      });

      const maxScore = dimensionQuestions.length * 5;
      const percentage = answeredCount > 0 ? (totalScore / maxScore) * 100 : 0;

      let level = '';
      let tips: string[] = [];

      if (percentage >= 80) {
        level = 'Sangat Baik';
        tips = ['Teruskan! Emosi Anda sudah berkembang dengan baik.', 'Jadilah mentor bagi teman yang masih berkembang.'];
      } else if (percentage >= 65) {
        level = 'Baik';
        tips = ['Anda sudah menunjukkan tanda-tanda positif.', 'Terus latih kemampuan ini agar semakin kuat.'];
      } else if (percentage >= 50) {
        level = 'Cukup';
        tips = ['Ada ruang besar untuk improvement.', 'Mulai dengan satu aspek kecil dan tingkatkan secara bertahap.'];
      } else {
        level = 'Perlu Dikembangkan';
        tips = ['Ini adalah area penting untuk fokus.', 'Minta bantuan guru BK atau mentor untuk pengembangan lebih lanjut.'];
      }

      results.push({
        dimension,
        score: totalScore,
        maxScore,
        percentage,
        level,
        description: DIMENSION_INFO[dimension].description,
        tips
      });
    });

    return results;
  };

  const getOverallLevel = (results: EIResult[]): { label: string; color: string; icon: string } => {
    if (results.length === 0) {
      return { label: 'Belum Tersedia', color: 'bg-gray-100 border-gray-300 text-gray-900', icon: '○' };
    }
    const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    if (avgPercentage >= 80) return { label: 'Sangat Baik', color: 'bg-green-100 border-green-300 text-green-900', icon: '⭐⭐⭐' };
    if (avgPercentage >= 65) return { label: 'Baik', color: 'bg-blue-100 border-blue-300 text-blue-900', icon: '⭐⭐' };
    if (avgPercentage >= 50) return { label: 'Cukup', color: 'bg-yellow-100 border-yellow-300 text-yellow-900', icon: '⭐' };
    return { label: 'Perlu Dikembangkan', color: 'bg-red-100 border-red-300 text-red-900', icon: '◐' };
  };

  const handleExportResults = () => {
    const results = eiResults || calculateResultsWithAnswers(answers);
    let csvContent = 'Hasil Assessment Kecerdasan Emosi\n\n';
    csvContent += `Nama: ${formData.nama}\nKelas: ${formData.kelas}\nJenis Kelamin: ${formData.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}\n\n`;
    csvContent += 'Dimensi,Skor,Skor Maksimal,Persentase,Level\n';

    results.forEach(result => {
      csvContent += `${DIMENSION_INFO[result.dimension].label},${result.score},${result.maxScore},${result.percentage.toFixed(1)}%,${result.level}\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `EI-Assessment-${formData.nama}-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Show info step
  if (step === 'info') {
    return (
      <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
        )}

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Kecerdasan Emosi</h1>
          <p className="text-gray-600 mb-8">
            Silakan isi data diri Anda terlebih dahulu sebelum mengisi assessment
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Masukkan nama lengkap"
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
                {classOptions.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
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

            <button
              onClick={handleStartQuestions}
              className="btn-primary w-full py-3"
            >
              Mulai Asesmen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show questions and results
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            padding: 15mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment Kecerdasan Emosi</h1>
          <p className="text-gray-600">Pahami kecerdasan emosi dan identifikasi area pengembangan diri Anda</p>
        </div>

        {!showResults ? (
          <div className="card p-8 shadow-xl">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
                <span className="text-sm font-semibold text-pink-600">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Dimension Badge */}
            <div className="mb-8">
              <div className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {DIMENSION_INFO[currentQuestion.dimension].label}
              </div>

              {currentQuestion.scenario && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 font-semibold">📖 Skenario:</p>
                  <p className="text-gray-800 mt-2">{currentQuestion.scenario}</p>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.question}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                {DIMENSION_INFO[currentQuestion.dimension].description}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${answers[currentQuestion.id] === currentQuestion.scores[index]
                    ? 'border-pink-500 bg-pink-50 text-pink-900 font-semibold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === currentQuestion.scores[index]
                      ? 'border-pink-500 bg-pink-500'
                      : 'border-gray-300'
                      }`}>
                      {answers[currentQuestion.id] === currentQuestion.scores[index] && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span>{answer}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => {
                  if (answers[currentQuestion.id] !== undefined) {
                    handleAnswer(currentQuestion.answers.indexOf(
                      currentQuestion.answers[currentQuestion.answers.findIndex((_, i) => currentQuestion.scores[i] === answers[currentQuestion.id])]
                    ));
                  }
                }}
                disabled={!answers[currentQuestion.id] || loading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${!answers[currentQuestion.id] || loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                  }`}
              >
                {loading ? 'Menyimpan...' : currentQuestionIndex === totalQuestions - 1 ? 'Selesai' : 'Berikutnya →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="card p-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Heart size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Assessment Selesai!</h2>
                  <p className="text-pink-100">Hasil assessment kecerdasan emosi Anda telah dianalisis</p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="card p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Data Peserta</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-semibold text-gray-900">{formData.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kelas</p>
                  <p className="font-semibold text-gray-900">{formData.kelas}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Kelamin</p>
                  <p className="font-semibold text-gray-900">{formData.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className={`card p-8 border-2 ${getOverallLevel(eiResults || []).color}`}>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Kecerdasan Emosi Keseluruhan</p>
                <div className="text-5xl font-bold mb-2" style={{
                  color: getOverallLevel(eiResults || []).color.includes('green') ? '#059669' :
                    getOverallLevel(eiResults || []).color.includes('blue') ? '#2563eb' :
                      getOverallLevel(eiResults || []).color.includes('yellow') ? '#d97706' : '#dc2626'
                }}>
                  {getOverallLevel(eiResults || []).icon}
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {getOverallLevel(eiResults || []).label}
                </p>
              </div>
            </div>

            {/* Actions: Print/PDF */}
            <div className="flex justify-center gap-4 mb-2 print:hidden">
              <button
                onClick={() => {
                  alert("Untuk mengunduh PDF: \n1. Jendela cetak akan terbuka\n2. Pada bagian 'Tujuan' atau 'Destination', pilih 'Save as PDF' atau 'Simpan sebagai PDF'\n3. Klik Simpan/Save");
                  window.print();
                }}
                className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm font-medium"
              >
                <Download size={20} />
                Unduh PDF / Cetak
              </button>
            </div>

            {/* Results by Dimension */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Hasil Per Dimensi</h3>
              <div className="space-y-4">
                {(eiResults || calculateResultsWithAnswers(answers)).map((result) => (
                  <div key={result.dimension} className={`card p-6 border-2 ${result.percentage >= 80 ? 'bg-green-50 border-green-200' :
                    result.percentage >= 65 ? 'bg-blue-50 border-blue-200' :
                      result.percentage >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">
                          {DIMENSION_INFO[result.dimension].label}
                        </h3>
                        <p className="text-sm opacity-80">
                          {result.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm opacity-75">Skor</p>
                        <p className="text-2xl font-bold">{result.score}</p>
                        <p className="text-xs opacity-75">dari {result.maxScore}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Persentase</p>
                        <p className="text-2xl font-bold">{result.percentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Level</p>
                        <p className="text-lg font-bold">{result.level}</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-3 mb-3">
                      <div
                        className="bg-current h-3 rounded-full transition-all duration-500"
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>

                    {/* Tips */}
                    <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">💡 Tips Pengembangan:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {result.tips.map((tip, idx) => (
                          <li key={idx}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Recommendations */}
            <div className="card p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
              <div className="flex gap-3 mb-4">
                <AlertCircle className="text-pink-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">🌟 Rekomendasi Pengembangan Diri</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>✓ Praktikkan mindfulness atau meditasi 5 menit setiap hari</li>
                    <li>✓ Tulis jurnal emosi untuk lebih mengenal diri sendiri</li>
                    <li>✓ Ajak teman bicara tentang perasaan dan dengarkan mereka juga</li>
                    <li>✓ Tanyakan feedback dari orang terpercaya tentang bagaimana kamu berinteraksi</li>
                    <li>✓ Ikuti workshop atau program pengembangan kecerdasan emosi di sekolah</li>
                    <li>✓ Konsultasi dengan guru BK atau counselor untuk guidance lebih dalam</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Ulang Assessment
              </button>
              <button
                onClick={handleExportResults}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Unduh Hasil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
