import React, { useState } from 'react';
import { ChevronRight, Brain, Heart, Users, BookMarked, Zap, TrendingUp, ClipboardList, Sparkles, ArrowRight } from 'lucide-react';
import AssessmentForm from './AssessmentForm';
import AKPDAssessmentForm from './AKPDAssessmentForm';
import EmotionalIntelligenceForm from './EmotionalIntelligenceForm';
import LearningStyleAssessmentForm from './LearningStyleAssessmentForm';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { useAuth } from '@/lib/authContextSupabase';
import type { SchoolMode } from '@/lib/classHelper';

const ASSESSMENTS = [
  {
    id: 'akpd',
    title: 'Angket Kebutuhan Peserta Didik (AKPD)',
    description: '50 pertanyaan untuk mengidentifikasi kebutuhan dan masalah siswa',
    icon: ClipboardList,
    category: 'Utama',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    id: 'aum',
    title: 'Alat Ungkap Masalah (AUM)',
    description: '70 pertanyaan komprehensif untuk mengidentifikasi berbagai masalah kehidupan siswa',
    icon: Brain,
    category: 'Utama',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    id: 'personality_career',
    title: 'Asesmen Kepribadian dan Preferensi Karir',
    description: 'Identifikasi kepribadian dan preferensi karir Anda',
    icon: Brain,
    category: 'Karir',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    id: 'sma_smk',
    title: 'Asesmen Minat Melanjutkan SMA atau SMK',
    description: 'Tentukan pilihan pendidikan yang tepat',
    icon: BookMarked,
    category: 'Karir',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    id: 'mbti',
    title: 'MBTI Sederhana',
    description: 'Klasifikasi tipe kepribadian Myers-Briggs',
    icon: Brain,
    category: 'Kepribadian',
    color: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    id: 'kecerdasan_majemuk',
    title: 'Asesmen Kecerdasan Majemuk',
    description: 'Identifikasi berbagai jenis kecerdasan',
    icon: Zap,
    category: 'Kecerdasan',
    color: 'from-cyan-500 to-sky-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
  },
  {
    id: 'gaya_belajar',
    title: 'Asesmen Gaya Belajar',
    description: 'Temukan gaya belajar optimal Anda',
    icon: BookMarked,
    category: 'Kecerdasan',
    color: 'from-lime-500 to-green-600',
    bgLight: 'bg-lime-50',
    textColor: 'text-lime-600',
  },
  {
    id: 'introvert_extrovert',
    title: 'Introvert atau Extrovert',
    description: 'Tentukan orientasi kepribadian Anda',
    icon: Users,
    category: 'Kepribadian',
    color: 'from-fuchsia-500 to-pink-600',
    bgLight: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-600',
  },
  {
    id: 'stress_akademik',
    title: 'Skala Stress Akademik',
    description: 'Evaluasi tingkat stress akademik',
    icon: Heart,
    category: 'Kesejahteraan',
    color: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    id: 'big_five',
    title: 'Tes Kepribadian Big Five',
    description: 'Analisis lima dimensi kepribadian utama',
    icon: Brain,
    category: 'Kepribadian',
    color: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    id: 'grit',
    title: 'GRIT',
    description: 'Ukur ketekunan dan semangat Anda',
    icon: Zap,
    category: 'Kepribadian',
    color: 'from-yellow-500 to-amber-600',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-600',
  },
  {
    id: 'rmib',
    title: 'Asesmen Minat Berdasarkan RMIB',
    description: 'Identifikasi minat karir berdasarkan RMIB',
    icon: BookMarked,
    category: 'Karir',
    color: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    id: 'emotional_intelligence',
    title: 'Kecerdasan Emosi',
    description: 'Evaluasi kecerdasan emosional Anda',
    icon: Heart,
    category: 'Kesejahteraan',
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
  {
    id: 'self_awareness',
    title: 'Kenali Dirimu',
    description: 'Program pengenalan diri komprehensif',
    icon: Brain,
    category: 'Kepribadian',
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    id: 'temperament',
    title: 'Asesmen Kepribadian Empat Temperamen',
    description: 'Klasifikasi berdasarkan empat temperamen',
    icon: Users,
    category: 'Kepribadian',
    color: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  {
    id: 'sdq',
    title: 'Asesmen SDQ Strength and Difficulties Questionnaire',
    description: 'Evaluasi kekuatan dan kesulitan',
    icon: TrendingUp,
    category: 'Kesejahteraan',
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
  },
];

interface AssessmentListProps {
  schoolMode: SchoolMode;
}

export default function AssessmentList({ schoolMode }: AssessmentListProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const { settings, loading } = useFeatureSettings();
  const { user } = useAuth();

  // Filter assessments based on feature settings
  const getAvailableAssessments = () => {
    if (!settings) return [];

    // Admins and super admins always see all assessments regardless of feature settings
    if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') {
      return ASSESSMENTS;
    }

    // Students only see enabled assessments
    const assessmentMap: { [key: string]: boolean } = {
      'akpd': settings.assessments.akpd,
      'aum': settings.assessments.aum,
      'personality_career': settings.assessments.personality,
      'emotional_intelligence': settings.assessments.emotional_intelligence,
    };

    return ASSESSMENTS.filter(assessment => {
      if (assessmentMap.hasOwnProperty(assessment.id)) {
        return assessmentMap[assessment.id];
      }
      // If not in the feature settings map, show it (for backward compatibility)
      return true;
    });
  };

  if (selectedAssessment === 'akpd') {
    return (
      <AKPDAssessmentForm
        onBack={() => setSelectedAssessment(null)}
        schoolMode={schoolMode}
      />
    );
  }

  if (selectedAssessment === 'emotional_intelligence') {
    return (
      <EmotionalIntelligenceForm
        onBack={() => setSelectedAssessment(null)}
        schoolMode={schoolMode}
      />
    );
  }

  if (selectedAssessment === 'gaya_belajar') {
    return (
      <LearningStyleAssessmentForm
        onBack={() => setSelectedAssessment(null)}
        schoolMode={schoolMode}
      />
    );
  }

  if (selectedAssessment) {
    return (
      <AssessmentForm
        assessmentId={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
        schoolMode={schoolMode}
      />
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
        </div>
        <p className="text-slate-500 mt-4 font-medium">Memuat instrumen asesmen...</p>
      </div>
    );
  }

  const availableAssessments = getAvailableAssessments();

  if (availableAssessments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-lg">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔒</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Tidak Ada Asesmen Aktif</h2>
        <p className="text-slate-500 max-w-md mx-auto">Admin belum mengaktifkan asesmen apapun. Silahkan hubungi guru bimbingan konseling Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 rounded-3xl p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <ClipboardList size={24} />
            </div>
            <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Bank Instrumen</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Daftar Asesmen
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Pilih instrumen asesmen untuk mengukur berbagai aspek psikologis dan akademik siswa. Semua hasil terintegrasi dengan sistem analitik.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-white/80">{availableAssessments.length} Instrumen Aktif</span>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableAssessments.map((assessment, index) => {
          const Icon = assessment.icon;
          return (
            <button
              key={assessment.id}
              onClick={() => setSelectedAssessment(assessment.id)}
              className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Accent Top Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${assessment.color}`}></div>

              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${assessment.textColor} ${assessment.bgLight} px-3 py-1 rounded-full`}>
                    {assessment.category}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${assessment.bgLight} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={assessment.textColor} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">
                      {assessment.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {assessment.description}
                </p>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`text-sm font-semibold ${assessment.textColor} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                    Mulai Asesmen
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className={`w-8 h-8 rounded-full ${assessment.bgLight} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <ChevronRight className={assessment.textColor} size={18} />
                  </div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${assessment.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

