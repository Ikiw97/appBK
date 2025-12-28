import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';
import { FeatureSettings, getFeatureSettings, saveFeatureSettings, DEFAULT_SETTINGS } from '@/lib/featureSettings';
import { notifySettingsChanged } from '@/lib/useFeatureSettings';

interface AdminSettingsProps {
  onBack?: () => void;
}

export default function AdminSettings({ onBack }: AdminSettingsProps) {
  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('📥 AdminSettings: Loading feature settings...');
        const loadedSettings = await getFeatureSettings();
        console.log('✅ AdminSettings: Settings loaded:', loadedSettings);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('❌ AdminSettings: Error loading settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = (category: keyof FeatureSettings, feature: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [feature]: !prev[category][feature as keyof typeof prev[keyof typeof prev]],
      },
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    console.log('💾 Saving feature settings:', settings);
    try {
      const success = await saveFeatureSettings(settings);
      if (success) {
        notifySettingsChanged();
        console.log('✅ Settings saved and notification sent');
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('❌ Failed to save settings');
        alert('❌ Gagal menyimpan pengaturan. Coba lagi.');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      alert('❌ Terjadi kesalahan saat menyimpan pengaturan');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="px-6 md:px-8 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Aplikasi</h1>
        <p className="text-gray-600">Kelola fitur yang tersedia untuk pengguna</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium flex items-center gap-2">
            <Check size={18} />
            Pengaturan berhasil disimpan
          </p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6 mb-8">
        {/* Assessment Section */}
        <SettingsSection title="📋 Asesmen" color="blue">
          <FeatureItem
            label="AKPD"
            description="Angket Kebutuhan Peserta Didik"
            enabled={settings.assessments.akpd}
            onChange={() => handleToggle('assessments', 'akpd')}
          />
          <FeatureItem
            label="AUM"
            description="Alat Ungkap Masalah"
            enabled={settings.assessments.aum}
            onChange={() => handleToggle('assessments', 'aum')}
          />
          <FeatureItem
            label="Asesmen Kepribadian"
            description="Identifikasi kepribadian dan karir"
            enabled={settings.assessments.personality}
            onChange={() => handleToggle('assessments', 'personality')}
          />
          <FeatureItem
            label="Kecerdasan Emosi"
            description="Evaluasi kecerdasan emosional dan emotional intelligence"
            enabled={settings.assessments.emotional_intelligence}
            onChange={() => handleToggle('assessments', 'emotional_intelligence')}
          />
          <FeatureItem
            label="SDQ"
            description="Strength and Difficulties Questionnaire - Kuesioner Kekuatan dan Kesulitan"
            enabled={settings.assessments.sdq}
            onChange={() => handleToggle('assessments', 'sdq')}
          />
          <FeatureItem
            label="MBTI"
            description="Myers-Briggs Type Indicator - Indikator Tipe Kepribadian"
            enabled={settings.assessments.mbti}
            onChange={() => handleToggle('assessments', 'mbti')}
          />
          <FeatureItem
            label="Big Five"
            description="Big Five Personality - Lima Dimensi Kepribadian"
            enabled={settings.assessments.big_five}
            onChange={() => handleToggle('assessments', 'big_five')}
          />
          <FeatureItem
            label="GRIT"
            description="Asesmen Ketekunan dan Ketahanan Mental"
            enabled={settings.assessments.grit}
            onChange={() => handleToggle('assessments', 'grit')}
          />
          <FeatureItem
            label="Holland Code (RIASEC)"
            description="Asesmen Minat Karir berdasarkan Teori Holland"
            enabled={settings.assessments.holland_code}
            onChange={() => handleToggle('assessments', 'holland_code')}
          />
        </SettingsSection>

        {/* Exercise Section */}
        <SettingsSection title="✏️ Latihan Soal" color="green">
          <FeatureItem
            label="Basic"
            description="Soal dasar untuk latihan"
            enabled={settings.exercises.basic}
            onChange={() => handleToggle('exercises', 'basic')}
          />
          <FeatureItem
            label="Advanced"
            description="Soal lanjutan untuk tantangan"
            enabled={settings.exercises.advanced}
            onChange={() => handleToggle('exercises', 'advanced')}
          />
        </SettingsSection>

        {/* Game Section */}
        <SettingsSection title="🎮 Game Edukasi" color="purple">
          <FeatureItem
            label="Vocabulary"
            description="Permainan kosakata BK"
            enabled={settings.games.vocabulary}
            onChange={() => handleToggle('games', 'vocabulary')}
          />
          <FeatureItem
            label="Puzzle"
            description="Permainan puzzle logika"
            enabled={settings.games.puzzle}
            onChange={() => handleToggle('games', 'puzzle')}
          />
          <FeatureItem
            label="Kahoot"
            description="Quiz cepat dan menyenangkan"
            enabled={settings.games.kahoot}
            onChange={() => handleToggle('games', 'kahoot')}
          />
        </SettingsSection>

        {/* System Configuration Section */}
        <SettingsSection title="⚙️ Konfigurasi Sistem" color="blue">
          <FeatureItem
            label="Mode Maintenance"
            description="Matikan akses untuk pemeliharaan sistem"
            enabled={settings.system.maintenanceMode}
            onChange={() => handleToggle('system', 'maintenanceMode')}
          />
          <FeatureItem
            label="Notifikasi Email"
            description="Kirim notifikasi melalui email ke pengguna"
            enabled={settings.system.emailNotifications}
            onChange={() => handleToggle('system', 'emailNotifications')}
          />
          <FeatureItem
            label="Pengumuman Sistem"
            description="Tampilkan pengumuman penting ke semua pengguna"
            enabled={settings.system.systemAnnouncements}
            onChange={() => handleToggle('system', 'systemAnnouncements')}
          />
        </SettingsSection>

        {/* Student Management Section */}
        <SettingsSection title="👥 Manajemen Peserta Didik" color="green">
          <FeatureItem
            label="Pendaftaran Siswa"
            description="Aktifkan fitur pendaftaran dan enrollment siswa"
            enabled={settings.studentManagement.studentEnrollment}
            onChange={() => handleToggle('studentManagement', 'studentEnrollment')}
          />
          <FeatureItem
            label="Pelacakan Kelas"
            description="Monitor siswa per kelas dan grup"
            enabled={settings.studentManagement.classTracking}
            onChange={() => handleToggle('studentManagement', 'classTracking')}
          />
          <FeatureItem
            label="Export Data"
            description="Izinkan export data siswa ke format file"
            enabled={settings.studentManagement.dataExport}
            onChange={() => handleToggle('studentManagement', 'dataExport')}
          />
        </SettingsSection>

        {/* Reporting & Analytics Section */}
        <SettingsSection title="📊 Laporan & Analitik" color="purple">
          <FeatureItem
            label="Pelacakan Progress"
            description="Pantau perkembangan siswa secara real-time"
            enabled={settings.reporting.progressTracking}
            onChange={() => handleToggle('reporting', 'progressTracking')}
          />
          <FeatureItem
            label="Laporan Asesmen"
            description="Buat dan lihat laporan hasil asesmen"
            enabled={settings.reporting.assessmentReports}
            onChange={() => handleToggle('reporting', 'assessmentReports')}
          />
          <FeatureItem
            label="Dashboard Analitik"
            description="Akses dashboard analitik dan statistik menyeluruh"
            enabled={settings.reporting.analyticsBoard}
            onChange={() => handleToggle('reporting', 'analyticsBoard')}
          />
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection title="💾 Manajemen Data" color="blue">
          <FeatureItem
            label="Backup Otomatis"
            description="Aktifkan backup otomatis data sistem"
            enabled={settings.dataManagement.autoBackup}
            onChange={() => handleToggle('dataManagement', 'autoBackup')}
          />
          <FeatureItem
            label="Kebijakan Retensi Data"
            description="Atur berapa lama data disimpan di sistem"
            enabled={settings.dataManagement.dataRetention}
            onChange={() => handleToggle('dataManagement', 'dataRetention')}
          />
          <FeatureItem
            label="Pengaturan Privasi"
            description="Kontrol privasi data dan compliance GDPR"
            enabled={settings.dataManagement.privacySettings}
            onChange={() => handleToggle('dataManagement', 'privacySettings')}
          />
        </SettingsSection>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check size={18} />
          Simpan
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <X size={18} />
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Asesmen"
          enabled={Object.values(settings.assessments).filter(Boolean).length}
          total={9}
          color="blue"
        />
        <SummaryCard
          label="Latihan"
          enabled={Object.values(settings.exercises).filter(Boolean).length}
          total={2}
          color="green"
        />
        <SummaryCard
          label="Game"
          enabled={Object.values(settings.games).filter(Boolean).length}
          total={3}
          color="purple"
        />
        <SummaryCard
          label="Sistem"
          enabled={Object.values(settings.system).filter(Boolean).length + Object.values(settings.studentManagement).filter(Boolean).length + Object.values(settings.reporting).filter(Boolean).length + Object.values(settings.dataManagement).filter(Boolean).length}
          total={12}
          color="blue"
        />
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  color: 'blue' | 'green' | 'purple';
  children: React.ReactNode;
}

function SettingsSection({ title, color, children }: SettingsSectionProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
  };

  const titleClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <h2 className={`text-lg font-semibold ${titleClasses[color]} mb-4`}>{title}</h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

interface FeatureItemProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}

function FeatureItem({ label, description, enabled, onChange }: FeatureItemProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <label className="ml-4 flex items-center cursor-pointer">
        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors" style={enabled ? { backgroundColor: '#3b82f6' } : {}}>
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            style={enabled ? { transform: 'translateX(22px)' } : { transform: 'translateX(2px)' }}
          />
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={onChange}
          className="hidden"
        />
      </label>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  enabled: number;
  total: number;
  color: 'blue' | 'green' | 'purple';
}

function SummaryCard({ label, enabled, total, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  const textClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-xs text-gray-600 mb-2">{label} Aktif</p>
      <p className={`text-2xl font-bold ${textClasses[color]}`}>
        {enabled}/{total}
      </p>
    </div>
  );
}
