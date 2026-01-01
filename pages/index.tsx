import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, Settings, Eye, AlertCircle, TrendingUp, Users, Activity } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import AssessmentList from '@/components/AssessmentList';
import AKPDAssessmentForm from '@/components/AKPDAssessmentForm';
import AssessmentForm from '@/components/AssessmentForm';
import ResultsView from '@/components/ResultsView';
import QuestionEditor from '@/components/QuestionEditor';
import GameQuestionEditor from '@/components/GameQuestionEditor';
import AbsensiSMP from '@/components/AbsensiSMP';
import AdminSettings from '@/components/AdminSettings';
import AdminAccountManagement from '@/components/AdminAccountManagement';
import StudentDashboard from '@/components/StudentDashboard';
import GameSelector from '@/components/GameSelector';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PsikotestForm from '@/components/PsikotestForm'; // Keep for reference or if used elsewhere, but mainly replaced by ExerciseSelector
import ExerciseSelector from '@/components/ExerciseSelector';
import CaseManagement from '@/components/CaseManagement';
import ManajemenSiswaKelas from '@/components/ManajemenSiswaKelas';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import { saveFeatureSettings } from '@/lib/featureSettings';
import type { SchoolMode } from '@/lib/classHelper';

interface HomeProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
  currentSubpage?: string;
  setCurrentSubpage?: (subpage: string) => void;
}

export default function Home({
  currentPage = 'dashboard',
  setCurrentPage,
  currentSubpage = 'daftar-asesmen',
  setCurrentSubpage
}: HomeProps) {
  const { user } = useAuth();
  const { settings: featureSettings, loading: settingsLoading } = useFeatureSettings();



  const [studentCurrentPage, setStudentCurrentPage] = useState<string>('dashboard');
  const [settingsSubMenu, setSettingsSubMenu] = useState<'main' | 'questions' | 'feature-access'>('main');
  const [gameEditorOpen, setGameEditorOpen] = useState(false);
  const [showStudentPreview, setShowStudentPreview] = useState(false);
  const [schoolMode, setSchoolMode] = useState<'smp' | 'sma_smk'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('schoolMode') as 'smp' | 'sma_smk') || 'smp';
    }
    return 'smp';
  });
  const [studentCount, setStudentCount] = useState<number>(0);


  // Fetch unique student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch('/api/admin/get-student-count');
        const data = await response.json();
        if (data.success && data.count !== undefined) {
          setStudentCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching student count:', error);
      }
    };

    if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') {
      fetchStudentCount();
    }
  }, [user]);

  const handleSetSchoolMode = (mode: SchoolMode) => {
    setSchoolMode(mode);
    localStorage.setItem('schoolMode', mode);
  };

  const handleSetCurrentPage = (page: string) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
    // Clear subpage when changing main page to prevent stuck state
    if (setCurrentSubpage) {
      setCurrentSubpage('');
    }
  };

  const handleSetCurrentSubpage = (subpage: string) => {
    if (setCurrentSubpage) {
      setCurrentSubpage(subpage);
    }
  };

  // Dashboard view with statistics
  const renderDashboard = () => (
    <div className="px-6 md:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-500">
          Selamat datang kembali di panel administrasi BK.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Total Asesmen</p>
          <p className="text-2xl font-bold text-slate-900">16</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Users className="text-indigo-600" size={20} />
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">Aktif</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Peserta Terdaftar Asesment</p>
          <p className="text-2xl font-bold text-slate-900">{studentCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Tingkat Penyelesaian</p>
          <p className="text-2xl font-bold text-slate-900">78%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="text-amber-600" size={20} />
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Optimal</span>
          </div>
          <p className="text-slate-500 text-sm mb-1">Status Sistem</p>
          <p className="text-2xl font-bold text-slate-900">Aktif</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Menu Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            onClick={() => handleSetCurrentPage('assessment')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Daftar Asesmen</h3>
                <p className="text-slate-500 text-sm">Kelola bank soal dan instrumen asesmen</p>
              </div>
            </div>
          </div>

          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
            onClick={() => {
              handleSetCurrentPage('assessment');
              handleSetCurrentSubpage('hasil-asesmen');
            }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <BarChart3 className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Hasil Asesmen</h3>
                <p className="text-slate-500 text-sm">Analisis hasil dan laporan siswa</p>
              </div>
            </div>
          </div>

          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
            onClick={() => handleSetCurrentPage('analytics')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Analytics</h3>
                <p className="text-slate-500 text-sm">Visualisasi data dan statistik lengkap</p>
              </div>
            </div>
          </div>

          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
            onClick={() => setShowStudentPreview(true)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                <Eye className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Pratinjau Siswa</h3>
                <p className="text-slate-500 text-sm">Lihat tampilan dari sisi siswa</p>
              </div>
            </div>
          </div>

          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer"
            onClick={() => handleSetCurrentPage('admin-accounts')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                <Users className="text-rose-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Manajemen User</h3>
                <p className="text-slate-500 text-sm">Kelola akun admin dan guru</p>
              </div>
            </div>
          </div>

          <div
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            onClick={() => handleSetCurrentPage('pengaturan')}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                <Settings className="text-slate-600" size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Pengaturan</h3>
                <p className="text-slate-500 text-sm">Konfigurasi sistem umum</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Assessment - Direct assessment form (when only one is enabled)
  const renderDirectAssessment = (assessmentId: string) => {
    const onBack = user?.role === 'student'
      ? () => handleSetCurrentPage('dashboard')
      : () => handleSetCurrentSubpage('daftar-asesmen');

    if (assessmentId === 'akpd') {
      return (
        <div className="px-6 md:px-8 py-8">
          <AKPDAssessmentForm
            onBack={onBack}
            schoolMode={schoolMode}
          />
        </div>
      );
    }

    return (
      <div className="px-6 md:px-8 py-8">
        <AssessmentForm
          assessmentId={assessmentId}
          onBack={onBack}
          schoolMode={schoolMode}
        />
      </div>
    );
  };

  // Assessment - Daftar Asesmen
  const renderDaftarAsesmen = () => (
    <div className="px-6 md:px-8 py-8">
      {user?.role === 'student' && (
        <button
          onClick={() => handleSetCurrentPage('dashboard')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali
        </button>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Asesmen</h1>
        <p className="text-gray-600">Kelola dan lihat semua asesmen yang tersedia</p>
      </div>
      <AssessmentList schoolMode={schoolMode} />
    </div>
  );

  // Assessment - Hasil Asesmen
  const renderHasilAsesmen = () => (
    <div className="px-6 md:px-8 py-8">
      {user?.role === 'student' && (
        <button
          onClick={() => handleSetCurrentPage('dashboard')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </button>
      )}
      <ResultsView />
    </div>
  );

  // Assessment - Settings
  const renderAssessmentSettings = () => (
    <div className="px-6 md:px-8 py-8">
      <AdminSettings onBack={() => handleSetCurrentSubpage('daftar-asesmen')} />
    </div>
  );

  // RPL view
  const renderRPL = () => (
    <div className="px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RPL</h1>
        <p className="text-gray-600">Pengakuan Pembelajaran Lampau</p>
      </div>
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Segera Hadir</h2>
        <p className="text-gray-600 text-lg">Halaman RPL sedang dalam tahap pengembangan</p>
      </div>
    </div>
  );

  // Absensi Siswa view
  const renderAbsensi = () => (
    <AbsensiSMP schoolMode={schoolMode} />
  );

  // Latihan Tes view
  const renderLatihanTes = () => {
    // Admin/Teacher always have full access to exercises
    const isAdminOrTeacher = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'teacher';
    if (isAdminOrTeacher) {
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ExerciseSelector
            onBack={() => handleSetCurrentPage('dashboard')}
            initialExercise={currentSubpage}
          />
        </React.Suspense>
      );
    }

    if (!featureSettings) {
      return <div className="px-6 md:px-8 py-8 text-center">Memuat pengaturan...</div>;
    }
    const exercisesEnabled = featureSettings.exercises.psikotest || featureSettings.exercises.analogi || featureSettings.exercises.tiu;

    if (!exercisesEnabled) {
      return (
        <div className="px-6 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Latihan Tes</h1>
            <p className="text-gray-600">Persiapan dan latihan tes</p>
          </div>
          <div className="card p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Diaktifkan</h2>
            <p className="text-gray-600 text-lg">Admin belum mengaktifkan fitur Latihan Tes. Silahkan hubungi administrator untuk mengaktifkan fitur ini.</p>
          </div>
        </div>
      );
    }

    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ExerciseSelector
          onBack={() => handleSetCurrentPage('dashboard')}
          initialExercise={currentSubpage}
        />
      </React.Suspense>
    );
  };

  // Games view
  const renderGames = () => {
    // Show game question editor if requested
    if (gameEditorOpen) {
      return (
        <GameQuestionEditor onBack={() => setGameEditorOpen(false)} />
      );
    }

    // Admin/Teacher always have full access to games
    const isAdminOrTeacher = user?.isSuperAdmin || user?.role === 'admin' || user?.role === 'teacher';
    if (isAdminOrTeacher) {
      return (
        <>
          <div className="px-6 md:px-8 py-4 flex justify-end">
            {user?.isSuperAdmin || user?.role === 'teacher' ? (
              <button
                onClick={() => setGameEditorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                ⚙️ Edit Pertanyaan Game
              </button>
            ) : null}
          </div>
          <GameSelector
            onBack={() => handleSetCurrentPage('dashboard')}
          />
        </>
      );
    }

    if (!featureSettings) {
      return <div className="px-6 md:px-8 py-8 text-center">Memuat pengaturan...</div>;
    }
    const gamesEnabled = featureSettings.games.vocabulary || featureSettings.games.puzzle || featureSettings.games.kahoot;

    if (!gamesEnabled) {
      return (
        <div className="px-6 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Games</h1>
            <p className="text-gray-600">Permainan edukasi interaktif</p>
          </div>
          <div className="card p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Diaktifkan</h2>
            <p className="text-gray-600 text-lg">Admin belum mengaktifkan fitur Games. Silahkan hubungi administrator untuk mengaktifkan fitur ini.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="px-6 md:px-8 py-4 flex justify-end">
          {user?.isSuperAdmin || user?.role === 'teacher' ? (
            <button
              onClick={() => setGameEditorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
            >
              ⚙️ Edit Pertanyaan Game
            </button>
          ) : null}
        </div>
        <GameSelector
          onBack={() => handleSetCurrentPage('dashboard')}
        />
      </>
    );
  };

  // Admin Account Management view
  const renderAdminAccounts = () => (
    <AdminAccountManagement />
  );

  // Pengaturan view
  const renderPengaturan = () => {
    // Show AdminSettings if feature-access submenu is selected
    if (settingsSubMenu === 'feature-access') {
      return <AdminSettings onBack={() => setSettingsSubMenu('main')} />;
    }

    // Show main settings
    return (
      <div className="px-6 md:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan</h1>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚙️ Kontrol Admin</h2>
          <div className="mb-6">
            <button
              onClick={() => setSettingsSubMenu('feature-access')}
              className="w-full card p-8 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-4xl w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">🔐</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Kontrol Akses Fitur
                  </h3>
                  <p className="text-gray-600">
                    Atur fitur mana saja yang tersedia untuk siswa di dashboard mereka
                  </p>
                </div>
              </div>
              <div className="text-purple-600 font-bold flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm self-start md:self-auto group-hover:bg-purple-600 group-hover:text-white transition-all">
                Buka Pengaturan <span>→</span>
              </div>
            </button>
          </div>
        </div>

        <div className="card p-8 mb-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Settings size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pengaturan Tingkat Sekolah</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-gray-700 font-medium mb-4">
              Pilih Tingkat Sekolah
            </label>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSetSchoolMode('smp')}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between group/btn ${schoolMode === 'smp'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
              >
                <span>SMP (Kelas VII-IX)</span>
                {schoolMode === 'smp' ? (
                  <span className="text-white animate-in zoom-in duration-300">✓</span>
                ) : (
                  <span className="opacity-0 group-hover/btn:opacity-30 transition-opacity">→</span>
                )}
              </button>
              <button
                onClick={() => handleSetSchoolMode('sma_smk')}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-between group/btn ${schoolMode === 'sma_smk'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
              >
                <span>SMA/SMK (Kelas X-XII)</span>
                {schoolMode === 'sma_smk' ? (
                  <span className="text-white animate-in zoom-in duration-300">✓</span>
                ) : (
                  <span className="opacity-0 group-hover/btn:opacity-30 transition-opacity">→</span>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // Show student preview if enabled
  if (showStudentPreview) {
    return (
      <div>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-4 shadow-lg z-40">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center gap-3">
              <Eye size={20} />
              <span className="font-semibold">Pratinjau Dashboard Siswa</span>
            </div>
            <button
              onClick={() => setShowStudentPreview(false)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
        <StudentDashboard setCurrentPage={handleSetCurrentPage} setCurrentSubpage={handleSetCurrentSubpage} />
      </div>
    );
  }

  // Students see StudentDashboard by default
  if (user?.role === 'student' && currentPage === 'dashboard') {
    return (
      <StudentDashboard
        setCurrentPage={handleSetCurrentPage}
        setCurrentSubpage={setCurrentSubpage}
      />
    );
  }

  // Analytics view
  const renderAnalytics = () => (
    <AnalyticsDashboard onBack={() => handleSetCurrentPage('dashboard')} />
  );

  // Render content based on current page
  if (currentPage === 'dashboard') {
    return renderDashboard();
  } else if (currentPage === 'analytics') {
    return renderAnalytics();
  } else if (currentPage === 'assessment') {
    // Check if navigating directly to a specific assessment (e.g., 'direct-akpd')
    if (currentSubpage && currentSubpage.startsWith('direct-')) {
      const assessmentId = currentSubpage.replace('direct-', '');
      return renderDirectAssessment(assessmentId);
    } else if (currentSubpage === 'daftar-asesmen') {
      return renderDaftarAsesmen();
    } else if (currentSubpage === 'hasil-asesmen') {
      return renderHasilAsesmen();
    } else if (currentSubpage === 'assessment-settings') {
      return renderAssessmentSettings();
    }
    return renderDaftarAsesmen();
  } else if (currentPage === 'rpl') {
    return renderRPL();
  } else if (currentPage === 'absensi') {
    return renderAbsensi();
  } else if (currentPage === 'latihan-tes') {
    return renderLatihanTes();
  } else if (currentPage === 'games') {
    return renderGames();
  } else if (currentPage === 'admin-accounts') {
    return renderAdminAccounts();
  } else if (currentPage === 'case-management') {
    return <CaseManagement />;
  } else if (currentPage === 'data-master') {
    return <ManajemenSiswaKelas />;
  } else if (currentPage === 'pengaturan') {
    return renderPengaturan();
  }

  return renderDashboard();
}
