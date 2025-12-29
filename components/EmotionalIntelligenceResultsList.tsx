import React, { useState, useEffect } from 'react';
import { Eye, Search, Trash2, ChevronLeft } from 'lucide-react';
import { getAssessmentResults, deleteAssessmentResult } from '@/lib/supabaseClient';
import { calculateEIResult, EIResult } from '@/lib/eiResultCalculator';

interface EIResultDetail {
  id: string;
  student_name: string;
  class: string;
  gender: string;
  answers: Record<string, any>;
}

interface DisplayResult {
  studentName: string;
  class: string;
  gender: string;
  overallLevel: string;
  overallPercentage: number;
}

export default function EmotionalIntelligenceResultsList({ onViewDetail, onBack }: { onViewDetail?: (result: EIResult) => void; onBack?: () => void }) {
  const [results, setResults] = useState<EIResultDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDetailResult, setSelectedDetailResult] = useState<EIResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    try {
      console.log(`📋 Loading Emotional Intelligence results...`);
      const data = await getAssessmentResults('emotional_intelligence');
      console.log(`📊 Loaded ${data.length} EI results`);
      setResults(data);
    } catch (error) {
      console.error('❌ Error loading EI results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (result: EIResultDetail) => {
    const eiResult = calculateEIResult(
      result.student_name,
      result.class,
      result.gender || '',
      result.answers
    );
    setSelectedDetailResult(eiResult);
    if (onViewDetail) {
      onViewDetail(eiResult);
    }
  };

  const handleDeleteResult = async (resultId: string, studentName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus hasil asesmen ${studentName}?`)) {
      return;
    }

    try {
      console.log(`🗑️ Attempting to delete: ${resultId}`);
      await deleteAssessmentResult(resultId);
      console.log(`✅ Delete successful`);

      // Refresh data from server
      console.log(`🔄 Fetching fresh data from server...`);
      const freshData = await getAssessmentResults('emotional_intelligence');
      setResults(freshData);
      alert('Hasil asesmen berhasil dihapus');
    } catch (error) {
      console.error('❌ Error deleting result:', error);
      alert(`Gagal menghapus hasil asesmen: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`);
      // Reload data even if delete failed
      await loadResults();
    }
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(results.map(r => r.class))];
    return classes.sort();
  };

  const getFilteredResults = () => {
    return results.filter(result => {
      const matchesSearch = result.student_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === '' || result.class === selectedClass;
      return matchesSearch && matchesClass;
    })
      .sort((a, b) => a.class.localeCompare(b.class) || a.student_name.localeCompare(b.student_name));
  };

  const getDisplayResult = (result: EIResultDetail): DisplayResult => {
    const eiResult = calculateEIResult(
      result.student_name,
      result.class,
      result.gender || '',
      result.answers
    );

    return {
      studentName: result.student_name,
      class: result.class,
      gender: result.gender,
      overallLevel: eiResult.overallLevel,
      overallPercentage: eiResult.overallPercentage
    };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Sangat Baik':
        return 'text-green-600 bg-green-50';
      case 'Baik':
        return 'text-blue-600 bg-blue-50';
      case 'Cukup':
        return 'text-yellow-600 bg-yellow-50';
      case 'Perlu Dikembangkan':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Show detailed result view if selected
  if (selectedDetailResult) {
    return (
      <div className="flex justify-center min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-4xl px-6 md:px-8">
          <button
            onClick={() => setSelectedDetailResult(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali ke Daftar
          </button>

          {/* Header */}
          <div className="card p-8 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl"></div>
              <div>
                <h2 className="text-2xl font-bold">Hasil Assessment Kecerdasan Emosi</h2>
                <p className="text-pink-100">{selectedDetailResult.studentName}</p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="card p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Data Peserta</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-semibold text-gray-900">{selectedDetailResult.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="font-semibold text-gray-900">{selectedDetailResult.class}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                <p className="font-semibold text-gray-900">{selectedDetailResult.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className={`card p-8 border-2 mb-6 ${selectedDetailResult.overallLevel === 'Sangat Baik' ? 'bg-green-50 border-green-200' :
            selectedDetailResult.overallLevel === 'Baik' ? 'bg-blue-50 border-blue-200' :
              selectedDetailResult.overallLevel === 'Cukup' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Kecerdasan Emosi Keseluruhan</p>
              <p className="text-4xl font-bold mb-2">{selectedDetailResult.overallPercentage.toFixed(1)}%</p>
              <p className="text-2xl font-semibold text-gray-900">{selectedDetailResult.overallLevel}</p>
            </div>
          </div>

          {/* Results by Dimension */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Hasil Per Dimensi</h3>
            <div className="space-y-4">
              {selectedDetailResult.dimensions.map((dimension) => (
                <div key={dimension.dimension} className={`card p-6 border-2 ${dimension.percentage >= 80 ? 'bg-green-50 border-green-200' :
                  dimension.percentage >= 65 ? 'bg-blue-50 border-blue-200' :
                    dimension.percentage >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                  }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{dimension.label}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm opacity-75">Skor</p>
                      <p className="text-2xl font-bold">{dimension.score}</p>
                      <p className="text-xs opacity-75">dari {dimension.maxScore}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-75">Persentase</p>
                      <p className="text-2xl font-bold">{dimension.percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-75">Level</p>
                      <p className="text-lg font-bold">{dimension.level}</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-3 mb-3">
                    <div
                      className="bg-current h-3 rounded-full transition-all duration-500"
                      style={{ width: `${dimension.percentage}%` }}
                    ></div>
                  </div>

                  {/* Tips */}
                  <div className="bg-white bg-opacity-60 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">💡 Tips Pengembangan:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {dimension.tips.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 py-8">
      <div className="w-full px-6 md:px-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
        )}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Asesmen Kecerdasan Emosi
          </h1>
          <p className="text-gray-600">
            Total peserta yang mengisi asesmen: {results.length}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="card p-8 text-center max-w-2xl mx-auto">
            <p className="text-gray-600">Belum ada hasil asesmen Kecerdasan Emosi</p>
          </div>
        ) : (
          <>
            <div className="card p-6 w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Daftar Hasil Asesmen Kecerdasan Emosi</h3>

              {/* Search and Filter Section */}
              <div className="mb-6 flex flex-col md:flex-row gap-4 w-full">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 md:w-48"
                >
                  <option value="">Semua Kelas</option>
                  {getUniqueClasses().map((kelas) => (
                    <option key={kelas} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Info */}
              <div className="mb-4 text-sm text-gray-600 text-center">
                Menampilkan {getFilteredResults().length} dari {results.length} hasil
              </div>

              {getFilteredResults().length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <p>Tidak ada hasil asesmen yang sesuai dengan kriteria pencarian</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">No</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Siswa</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Kelas</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Jenis Kelamin</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Level</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredResults().map((result, index) => {
                        const displayResult = getDisplayResult(result);

                        return (
                          <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                            <td className="py-3 px-4 text-gray-900 font-medium">{displayResult.studentName}</td>
                            <td className="py-3 px-4 text-gray-700">{displayResult.class}</td>
                            <td className="py-3 px-4 text-gray-700">
                              {result.gender === 'L' ? 'Laki-laki' : result.gender === 'P' ? 'Perempuan' : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(displayResult.overallLevel)}`}>
                                {displayResult.overallLevel}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewResult(result)}
                                  className="flex items-center gap-1 px-3 py-1 text-pink-600 hover:bg-pink-50 rounded transition-colors"
                                  title="Lihat hasil asesmen"
                                >
                                  <Eye size={16} />
                                  Lihat
                                </button>
                                <button
                                  onClick={() => handleDeleteResult(result.id, result.student_name)}
                                  className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Hapus hasil asesmen"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
