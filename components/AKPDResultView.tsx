import React from 'react';
import { ChevronLeft, Download, BarChart3 } from 'lucide-react';
import { AKPDResult } from '@/lib/akpdResultCalculator';

interface AKPDResultViewProps {
  result: AKPDResult;
  onBack: () => void;
}

export default function AKPDResultView({ result, onBack }: AKPDResultViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'akpd', result }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hasil-akpd-${result.studentName}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh PDF');
    }
  };

  const getProblemLevelColor = (percentage: number) => {
    if (percentage > 50) return 'text-red-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProblemLevelBg = (percentage: number) => {
    if (percentage > 50) return 'bg-red-50 border-red-300';
    if (percentage > 30) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
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

        {/* Main Result Card */}
        <div className="card p-8 mb-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Asesmen AKPD
          </h1>
          <p className="text-gray-600 mb-8">
            Angket Kebutuhan Peserta Didik
          </p>

          {/* Student Info */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Siswa</p>
                <p className="text-lg font-semibold text-gray-900">{result.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="text-lg font-semibold text-gray-900">{result.schoolClass}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                <p className="text-lg font-semibold text-gray-900">{result.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Pengisian</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(result.submittedAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Score */}
          <div className={`p-8 rounded-lg border-2 mb-8 ${getProblemLevelBg(result.problemPercentage)}`}>
            <div className="text-center">
              <p className="text-gray-700 mb-2 font-medium">Tingkat Masalah</p>
              <div className={`text-5xl font-bold mb-2 ${getProblemLevelColor(result.problemPercentage)}`}>
                {result.problemPercentage}%
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {result.totalProblems} dari 50 pertanyaan
              </p>
              <p className="text-gray-600 mt-4 text-sm">
                {result.problemPercentage > 50
                  ? `⚠️ Level masalah TINGGI ${result.fieldScores[0]?.fieldName} - Butuh perhatian khusus dari guru BK`
                  : result.problemPercentage > 30
                  ? `⚠️ Level masalah SEDANG ${result.fieldScores[0]?.fieldName} - Perlu bimbingan lanjutan`
                  : '✓ Level masalah RENDAH - Kondisi baik'}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analisis per Kategori</h2>

          {/* Field Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {result.fieldScores.map((field, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">{field.fieldName}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-blue-600">{field.categoryPercentage}%</p>
                  <p className="text-xs text-gray-600 pb-1">({field.problemCount} masalah)</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-900 mb-2">💡 REKOMENDASI</h3>
            {result.problemPercentage > 50 && (
              <p className="text-blue-900 text-sm mb-4">
                <strong>Fokus bidang:</strong> {result.fieldScores[0]?.fieldName} memerlukan perhatian khusus
              </p>
            )}
            <ul className="text-blue-900 space-y-2 text-sm">
              {result.problemPercentage > 50 ? (
                <>
                  <li>• Segera konsultasikan dengan guru BK atau konselor sekolah</li>
                  <li>• Identifikasi masalah utama yang perlu penanganan prioritas di {result.fieldScores[0]?.fieldName}</li>
                  <li>• Ikuti program bimbingan dan konseling intensif</li>
                  <li>• Melibatkan orang tua dalam proses penyelesaian masalah</li>
                </>
              ) : result.problemPercentage > 30 ? (
                <>
                  <li>• Konsultasi dengan guru BK untuk pembimbingan lanjutan</li>
                  <li>• Identifikasi area masalah utama di {result.fieldScores[0]?.fieldName} dan buat rencana tindakan</li>
                  <li>• Tingkatkan kesadaran diri terhadap masalah yang dihadapi</li>
                  <li>• Ikuti program bimbingan kelompok atau individual</li>
                </>
              ) : (
                <>
                  <li>• Terus jaga kondisi kesehatan mental dan emosional</li>
                  <li>• Berpartisipasi aktif dalam kegiatan positif sekolah</li>
                  <li>• Jika ada perubahan, segera berkonsultasi dengan guru BK</li>
                  <li>• Tetap terbuka komunikasi dengan keluarga dan sekolah</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm print:text-xs">
          <p>© Dashboard Bimbingan Konseling Digital - Hasil Asesmen AKPD</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\:hidden {
            display: none;
          }
          .print\:text-xs {
            font-size: 0.75rem;
          }
          .print\:bg-white {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
