import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Download } from 'lucide-react';
import { getAssessmentStats, getAssessmentResults } from '@/lib/supabaseClient';
import AUMResultsList from './AUMResultsList';
import AKPDResultsList from './AKPDResultsList';
import EmotionalIntelligenceResultsList from './EmotionalIntelligenceResultsList';
import LearningStyleResultsList from './LearningStyleResultsList';
import GenericResultsList from './GenericResultsList';

import { ASSESSMENT_TITLES } from '@/lib/assessmentConstants';

interface AssessmentStats {
  assessment_id: string;
  totalCompletions: number;
  completionsByClass: Record<string, number>;
}

export default function ResultsView() {
  const [stats, setStats] = useState<AssessmentStats[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResults, setSelectedResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'aum' | 'akpd' | 'emotional_intelligence' | 'gaya_belajar'>('all');
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    // Only load once when component mounts
    if (!hasLoadedRef.current) {
      loadStats();
      hasLoadedRef.current = true;
    }
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const assessmentIds = Object.keys(ASSESSMENT_TITLES);

      // Fetch all assessment results in parallel for better performance
      const allResults = await Promise.all(
        assessmentIds.map(id => getAssessmentResults(id))
      );

      const allStats: AssessmentStats[] = assessmentIds.map((assessmentId, index) => {
        const results = allResults[index];
        const completionsByClass: Record<string, number> = {};

        results.forEach((result) => {
          const cls = result.class || 'Unknown';
          completionsByClass[cls] = (completionsByClass[cls] || 0) + 1;
        });

        return {
          assessment_id: assessmentId,
          totalCompletions: results.length,
          completionsByClass,
        };
      });

      setStats(allStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (assessmentId: string) => {
    try {
      const results = await getAssessmentResults(assessmentId);
      setSelectedResults(results);
      setSelectedAssessment(assessmentId);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedAssessment || selectedResults.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    const headers = ['Nama Siswa', 'Kelas', 'Tanggal Selesai'];
    const rows = selectedResults.map((result) => [
      result.student_name,
      result.class,
      new Date(result.completed_at).toLocaleDateString('id-ID'),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil-${selectedAssessment}.csv`;
    a.click();
    // Clean up: revoke the object URL to prevent memory leak
    window.URL.revokeObjectURL(url);
  };

  const totalAllCompletions = stats.reduce((sum, s) => sum + s.totalCompletions, 0);

  // Check if we're viewing a specific assessment - if so, don't show loading from parent
  if (viewMode === 'akpd') {
    return <AKPDResultsList onBack={() => setViewMode('all')} />;
  }

  if (viewMode === 'aum') {
    return <AUMResultsList onBack={() => setViewMode('all')} />;
  }

  if (viewMode === 'emotional_intelligence') {
    return (
      <EmotionalIntelligenceResultsList
        onBack={() => setViewMode('all')}
        onViewDetail={() => {
          // Handle viewing details if needed
        }}
      />
    );
  }

  if (viewMode === 'gaya_belajar') {
    return (
      <LearningStyleResultsList
        onBack={() => setViewMode('all')}
        onViewDetail={() => {
          // Handle viewing details if needed
        }}
      />
    );
  }

  if (selectedAssessment) {
    return (
      <GenericResultsList
        assessmentId={selectedAssessment}
        onBack={() => setSelectedAssessment(null)}
      />
    );
  }

  // Only show loading state when we're in 'all' view mode and actually loading
  if (loading && viewMode === 'all' && !selectedAssessment) {
    return (
      <div className="px-6 md:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Asesmen</h1>
        <p className="text-gray-600">
          Lihat ringkasan dan detail hasil asesmen semua siswa
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pengisian</p>
              <p className="text-2xl font-bold text-gray-900">{totalAllCompletions}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Asesmen Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.filter(s => s.totalCompletions > 0).length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="text-pink-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rata-rata per Asesmen</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.length > 0 ? Math.round(totalAllCompletions / stats.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Results List */}
      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat) => {
          const completionPercentage = stat.totalCompletions > 0 ? Math.round((stat.totalCompletions / 30) * 100) : 0;

          return (
            <div key={stat.assessment_id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ASSESSMENT_TITLES[stat.assessment_id] || stat.assessment_id}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {stat.totalCompletions} peserta telah menyelesaikan asesmen ini
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (stat.assessment_id === 'aum') {
                      setViewMode('aum');
                    } else if (stat.assessment_id === 'akpd') {
                      setViewMode('akpd');
                    } else if (stat.assessment_id === 'emotional_intelligence') {
                      setViewMode('emotional_intelligence');
                    } else if (stat.assessment_id === 'gaya_belajar') {
                      setViewMode('gaya_belajar');
                    } else {
                      handleViewDetails(stat.assessment_id);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {stat.assessment_id === 'aum' || stat.assessment_id === 'akpd' || stat.assessment_id === 'emotional_intelligence' || stat.assessment_id === 'gaya_belajar' ? 'Lihat Hasil' : 'Lihat Hasil'}
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Penyelesaian</span>
                  <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Class Breakdown */}
              {Object.keys(stat.completionsByClass).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Distribusi per Kelas:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(stat.completionsByClass).map(([cls, count]) => (
                      <div key={cls} className="bg-gray-50 p-2 rounded text-sm">
                        <span className="font-medium text-gray-900">Kelas {cls}:</span>
                        <span className="text-gray-600 ml-1">{count} siswa</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stats.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-600">Belum ada data asesmen yang tersimpan</p>
        </div>
      )}
    </div>
  );
}
