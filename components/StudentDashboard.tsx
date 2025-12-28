import React, { useState } from 'react';
import { BookOpen, Zap, Gamepad2, Lock } from 'lucide-react';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { useAuth } from '@/lib/authContextSupabase';

interface StudentDashboardProps {
  setCurrentPage?: (page: string) => void;
  setCurrentSubpage?: (subpage: string) => void;
}

export default function StudentDashboard({ setCurrentPage, setCurrentSubpage }: StudentDashboardProps) {
  const { settings, loading } = useFeatureSettings();
  const { user } = useAuth();

  if (loading || !settings) {
    return <div className="px-6 md:px-8 py-8 text-center">Memuat pengaturan...</div>;
  }

  const handleNavigate = (page: string, subpage?: string) => {
    if (setCurrentPage) setCurrentPage(page);
    if (subpage && setCurrentSubpage) setCurrentSubpage(subpage);
  };

  const handleNavigateToAssessment = () => {
    // Count enabled assessments
    const enabledAssessments = [];
    if (settings.assessments.akpd) enabledAssessments.push('akpd');
    if (settings.assessments.aum) enabledAssessments.push('aum');
    if (settings.assessments.personality) enabledAssessments.push('personality_career');

    console.log('📊 Enabled assessments:', enabledAssessments, 'Count:', enabledAssessments.length);

    // If only one assessment is enabled, go directly to that form
    if (enabledAssessments.length === 1) {
      console.log('🎯 Navigating directly to:', enabledAssessments[0]);
      if (setCurrentPage) setCurrentPage('assessment');
      if (setCurrentSubpage) setCurrentSubpage(`direct-${enabledAssessments[0]}`);
    } else {
      // Multiple assessments, show the list
      console.log('📋 Showing assessment list with', enabledAssessments.length, 'assessments');
      handleNavigate('assessment', 'daftar-asesmen');
    }
  };

  const assessmentCount = Object.values(settings.assessments).filter(Boolean).length;
  const exerciseCount = Object.values(settings.exercises).filter(Boolean).length;
  const gameCount = Object.values(settings.games).filter(Boolean).length;

  return (
    <div className="px-6 md:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Siswa
        </h1>
        <p className="text-slate-500">
          Akses layanan BK, latihan, dan permainan edukasi.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Asesmen Tersedia</p>
              <p className="text-2xl font-bold text-slate-900">{assessmentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Zap className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Latihan Soal Tersedia</p>
              <p className="text-2xl font-bold text-slate-900">{exerciseCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Gamepad2 className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Game Tersedia</p>
              <p className="text-2xl font-bold text-slate-900">{gameCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments Section */}
      {assessmentCount > 0 && settings?.assessments && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Asesmen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.assessments.akpd && (
              <FeatureCard
                title="AKPD"
                description="Angket Kebutuhan Peserta Didik"
                icon={BookOpen}
                available={true}
                onClick={handleNavigateToAssessment}
              />
            )}
            {settings.assessments.aum && (
              <FeatureCard
                title="AUM"
                description="Alat Ungkap Masalah"
                icon={BookOpen}
                available={true}
                onClick={handleNavigateToAssessment}
              />
            )}
            {settings.assessments.personality && (
              <FeatureCard
                title="Asesmen Kepribadian"
                description="Kenali potensi diri dan karir"
                icon={BookOpen}
                available={true}
                onClick={handleNavigateToAssessment}
              />
            )}
          </div>
        </div>
      )}

      {/* Exercises Section */}
      {exerciseCount > 0 && settings?.exercises && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Zap className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Latihan Soal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.exercises.basic && (
              <FeatureCard
                title="Latihan Soal: Basic"
                description="Soal-soal dasar untuk pemula"
                icon={Zap}
                available={true}
                onClick={() => handleNavigate('latihan-tes')}
              />
            )}
            {settings.exercises.advanced && (
              <FeatureCard
                title="Latihan Soal: Advanced"
                description="Tantangan soal tingkat lanjut"
                icon={Zap}
                available={true}
                onClick={() => handleNavigate('latihan-tes')}
              />
            )}
          </div>
        </div>
      )}

      {/* Games Section */}
      {gameCount > 0 && settings?.games && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Gamepad2 className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Game Edukasi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.games.vocabulary && (
              <FeatureCard
                title="Game BK Asah Cerita"
                description="Belajar lewat cerita interaktif"
                icon={Gamepad2}
                available={true}
                onClick={() => handleNavigate('games')}
              />
            )}
            {settings.games.puzzle && (
              <FeatureCard
                title="Puzzle Game"
                description="Asah logika dengan puzzle"
                icon={Gamepad2}
                available={true}
                onClick={() => handleNavigate('games')}
              />
            )}
            {settings.games.kahoot && (
              <FeatureCard
                title="Kahoot Game"
                description="Kuis interaktif yang seru"
                icon={Gamepad2}
                available={true}
                onClick={() => handleNavigate('games')}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick Actions - Only show for teachers, not for students */}
      {assessmentCount > 0 && user?.role === 'teacher' && (
        <div className="mb-8 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Lihat Hasil Asesmen"
              description="Review hasil pengerjaan siswa"
              icon={BookOpen}
              available={true}
              onClick={() => handleNavigate('assessment', 'hasil-asesmen')}
            />
            <FeatureCard
              title="Informasi Lebih Lanjut"
              description="Panduan penggunaan sistem"
              icon={BookOpen}
              available={true}
              onClick={() => handleNavigate('assessment', 'info')}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {assessmentCount === 0 && exerciseCount === 0 && gameCount === 0 && (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
          <Lock size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Tidak Ada Fitur Tersedia</h2>
          <p className="text-slate-500">
            Admin belum mengaktifkan fitur apapun. Silahkan hubungi guru bimbingan konseling Anda.
          </p>
        </div>
      )}
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  available: boolean;
  onClick?: () => void;
}

function FeatureCard({ title, description, icon: Icon, available, onClick }: FeatureCardProps) {
  return (
    <div
      onClick={available ? onClick : undefined}
      className={`group bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 ${available
        ? 'hover:shadow-md hover:border-blue-300 cursor-pointer'
        : 'opacity-60 cursor-not-allowed bg-gray-50'
        }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg transition-colors ${available ? 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-semibold text-sm mb-1 ${available ? 'text-slate-900' : 'text-slate-500'}`}>{title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
            </div>
            {available && (
              <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
