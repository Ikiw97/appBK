import React, { useState } from 'react';
import { ChevronRight, Brain, Heart, Users, BookMarked, Zap, TrendingUp, ClipboardList } from 'lucide-react';
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
    special: true,
  },
  {
    id: 'aum',
    title: 'Alat Ungkap Masalah (AUM)',
    description: '70 pertanyaan komprehensif untuk mengidentifikasi berbagai masalah kehidupan siswa',
    icon: Brain,
  },
  {
    id: 'personality_career',
    title: 'Asesmen Kepribadian dan Preferensi Karir',
    description: 'Identifikasi kepribadian dan preferensi karir Anda',
    icon: Brain,
  },
  {
    id: 'sma_smk',
    title: 'Asesmen Minat Melanjutkan SMA atau SMK',
    description: 'Tentukan pilihan pendidikan yang tepat',
    icon: BookMarked,
  },
  {
    id: 'mbti',
    title: 'MBTI Sederhana',
    description: 'Klasifikasi tipe kepribadian Myers-Briggs',
    icon: Brain,
  },
  {
    id: 'kecerdasan_majemuk',
    title: 'Asesmen Kecerdasan Majemuk',
    description: 'Identifikasi berbagai jenis kecerdasan',
    icon: Zap,
  },
  {
    id: 'gaya_belajar',
    title: 'Asesmen Gaya Belajar',
    description: 'Temukan gaya belajar optimal Anda',
    icon: BookMarked,
  },
  {
    id: 'introvert_extrovert',
    title: 'Introvert atau Extrovert',
    description: 'Tentukan orientasi kepribadian Anda',
    icon: Users,
  },
  {
    id: 'stress_akademik',
    title: 'Skala Stress Akademik',
    description: 'Evaluasi tingkat stress akademik',
    icon: Heart,
  },
  {
    id: 'big_five',
    title: 'Tes Kepribadian Big Five',
    description: 'Analisis lima dimensi kepribadian utama',
    icon: Brain,
  },
  {
    id: 'grit',
    title: 'GRIT',
    description: 'Ukur ketekunan dan semangat Anda',
    icon: Zap,
  },
  {
    id: 'rmib',
    title: 'Asesmen Minat Berdasarkan RMIB',
    description: 'Identifikasi minat karir berdasarkan RMIB',
    icon: BookMarked,
  },
  {
    id: 'emotional_intelligence',
    title: 'Kecerdasan Emosi',
    description: 'Evaluasi kecerdasan emosional Anda',
    icon: Heart,
  },
  {
    id: 'self_awareness',
    title: 'Kenali Dirimu',
    description: 'Program pengenalan diri komprehensif',
    icon: Brain,
  },
  {
    id: 'temperament',
    title: 'Asesmen Kepribadian Empat Temperamen',
    description: 'Klasifikasi berdasarkan empat temperamen',
    icon: Users,
  },
  {
    id: 'sdq',
    title: 'Asesmen SDQ Strength and Difficulties Questionnaire',
    description: 'Evaluasi kekuatan dan kesulitan',
    icon: TrendingUp,
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
    if (user?.role === 'admin' || user?.role === 'teacher') {
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat daftar asesmen...</p>
      </div>
    );
  }

  const availableAssessments = getAvailableAssessments();

  if (availableAssessments.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Asesmen</h2>
        <p className="text-gray-600">Admin belum mengaktifkan asesmen apapun. Silahkan hubungi guru bimbingan konseling Anda.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Asesmen Tersedia</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableAssessments.map((assessment) => {
          const Icon = assessment.icon;
          return (
            <button
              key={assessment.id}
              onClick={() => setSelectedAssessment(assessment.id)}
              className="card p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {assessment.title}
              </h3>
              <p className="text-gray-600 text-sm">{assessment.description}</p>

              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                Mulai Asesmen
                <ChevronRight size={16} className="ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
