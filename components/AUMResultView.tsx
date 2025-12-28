import React from 'react';
import { Download, ChevronLeft, BarChart3 } from 'lucide-react';
import { AUMResult } from '@/lib/aumResultCalculator';

interface AUMResultViewProps {
  result: AUMResult;
  onBack: () => void;
}

export default function AUMResultView({ result, onBack }: AUMResultViewProps) {
  const handleDownloadPDF = () => {
    // PDF generation would go here
    alert('Fitur unduh PDF akan segera tersedia');
  };

  const handlePrint = () => {
    window.print();
  };

  const getFrequencyEmoji = (frequency: string): string => {
    const emojiMap: Record<string, string> = {
      'Tidak Pernah': '⏹️',
      'Kadang-kadang': '⚠️',
      'Sering': '🔴',
      'Selalu': '🚨',
    };
    return emojiMap[frequency] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 print:bg-white px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronLeft size={20} />
            Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={18} />
              Unduh PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 size={18} />
              Cetak
            </button>
          </div>
        </div>

        {/* Main Report Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">📊 HASIL AUM UMUM DIGITAL</h1>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-blue-100 text-sm">🧑 Nama Siswa</p>
                <p className="text-2xl font-bold">{result.studentName}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">🏫 Kelas</p>
                <p className="text-2xl font-bold">{result.class}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">⚧ Jenis Kelamin</p>
                <p className="text-2xl font-bold">{result.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
            </div>

            <div className="text-blue-100 text-sm">
              Tanggal Pengisian:{' '}
              {new Date(result.completedAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Skor Per Bidang */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📈 SKOR PER BIDANG
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.categoryScores.map((category) => (
                  <div
                    key={category.categoryId}
                    className={`p-4 rounded-lg border-2 ${category.severity.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category.categoryName}</h3>
                      <span className="text-2xl">{category.severity.emoji}</span>
                    </div>
                    <p className="text-lg font-bold mb-1">
                      {category.totalScore}/{category.maxScore}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          category.severity.emoji === '🟢'
                            ? 'bg-green-500'
                            : category.severity.emoji === '🟡'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${(category.totalScore / category.maxScore) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">{category.severity.level}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3 Masalah Terbesar */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🎯 3 MASALAH TERBESAR
              </h2>

              <div className="space-y-3">
                {result.categoryScores
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .slice(0, 3)
                  .map((category, index) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200"
                    >
                      <span className="text-2xl font-bold text-red-600 flex-shrink-0">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{category.categoryName}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          Skor: <span className="font-bold">{category.totalScore}/{category.maxScore}</span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Masalah Terbesar Per Bidang */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🔍 MASALAH TERBESAR PER BIDANG
              </h2>

              <div className="space-y-3">
                {Object.entries(result.topProblemPerCategory).map(([categoryId, problem]) => (
                  <div key={categoryId} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">⚠️</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          [{problem.category}] {problem.questionText}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {problem.frequency} {getFrequencyEmoji(problem.frequency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 15 Masalah Utama Siswa */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🔍 15 MASALAH UTAMA SISWA
              </h2>

              <div className="space-y-2">
                {result.topFifteenProblems.map((problem, index) => (
                  <div key={`${problem.questionId}_${index}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0 w-6">{index + 1}.</span>
                      <div className="flex-1 text-sm">
                        <p className="text-gray-900">
                          <span className="font-semibold">[{problem.category}]</span> {problem.questionText}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {problem.frequency} {getFrequencyEmoji(problem.frequency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Rekomendasi */}
            <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-blue-900 mb-4">💡 REKOMENDASI</h2>
              <ul className="text-blue-900 space-y-2 text-sm">
                <li>• Konsultasikan hasil ini dengan guru BK untuk pembimbingan lebih lanjut</li>
                <li>• Identifikasi masalah utama dan cari solusi bersama keluarga dan sekolah</li>
                <li>• Lakukan tindakan proaktif untuk mengatasi masalah yang teridentifikasi</li>
                <li>• Ikuti program bimbingan dan konseling yang ditawarkan sekolah</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm print:text-xs">
          <p>© Dashboard Bimbingan Konseling Digital - Hasil Asesmen AUM</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:text-xs {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
