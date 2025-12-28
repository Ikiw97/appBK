import React, { useState, useEffect } from 'react';
import { Plus, Search, BarChart3, Calendar, Users, TrendingUp, Download, Eye, Trash2, Edit2, Settings, RefreshCw } from 'lucide-react';
import {
  AbsensiStatus,
  RecordAbsensi,
  SiswaAbsensi,
  LaporanAbsensiSiswa,
  STATUS_ABSENSI,
  DAFTAR_KELAS_SMP,
  DAFTAR_KELAS_SMA,
  getDaftarKelas,
  getTitleAbsensi,
  getWarnaDariBentukAbsensi,
  hitungPersentaseKehadiran,
  getStatusKesehatan
} from '@/lib/absensiTypes';
import { getSiswaByKelas } from '@/lib/siswaStorage';
import ManajemenSiswaKelas from './ManajemenSiswaKelas';

interface AbsensiSMPProps {
  schoolMode?: 'smp' | 'sma_smk';
}

export default function AbsensiSMP({ schoolMode = 'smp' }: AbsensiSMPProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'laporan' | 'statistik' | 'manajemen'>('input');
  const [selectedKelas, setSelectedKelas] = useState(() => {
    const daftarKelas = getDaftarKelas(schoolMode);
    return daftarKelas[0] || 'VII-A';
  });
  const [recordAbsensi, setRecordAbsensi] = useState<RecordAbsensi[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<SiswaAbsensi[]>([]);
  const [tanggalInput, setTanggalInput] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiswaLaporan, setSelectedSiswaLaporan] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<RecordAbsensi | null>(null);
  const [laporanViewType, setLaporanViewType] = useState<'ringkas' | 'detail'>('detail');
  const [filterTanggalMulai, setFilterTanggalMulai] = useState<string>('');
  const [filterTanggalAkhir, setFilterTanggalAkhir] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filterTahun, setFilterTahun] = useState<string>(String(new Date().getFullYear()));

  useEffect(() => {
    // Reset kelas ke default ketika schoolMode berubah
    const daftarKelas = getDaftarKelas(schoolMode);
    setSelectedKelas(daftarKelas[0] || 'VII-A');
    // Clear active tab untuk dashboard
    setActiveTab('input');
  }, [schoolMode]);

  useEffect(() => {
    loadDataSiswa();
    loadRecordAbsensi();
  }, [selectedKelas]);

  useEffect(() => {
    if (recordAbsensi.length > 0) {
      localStorage.setItem('recordAbsensi', JSON.stringify(recordAbsensi));
    }
  }, [recordAbsensi]);

  const loadDataSiswa = () => {
    const siswa = getSiswaByKelas(selectedKelas);
    setDaftarSiswa(siswa);
  };

  const loadRecordAbsensi = () => {
    try {
      const savedData = localStorage.getItem('recordAbsensi');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const dataWithDateObjects = parsedData.map((record: any) => ({
          ...record,
          tanggal: new Date(record.tanggal)
        }));
        setRecordAbsensi(dataWithDateObjects);
        return;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    // No sample data - start with empty records
    setRecordAbsensi([]);
  };

  const handleTambahAbsensi = (siswaId: string, status: AbsensiStatus) => {
    const existingRecord = recordAbsensi.find(r =>
      r.siswaId === siswaId &&
      new Date(r.tanggal).toISOString().split('T')[0] === tanggalInput
    );

    if (existingRecord) {
      setRecordAbsensi(recordAbsensi.map(r =>
        r.id === existingRecord.id
          ? { ...r, status, jamMasuk: status === 'Hadir' || status === 'Terlambat' ? new Date().toTimeString().slice(0, 5) : undefined }
          : r
      ));
    } else {
      const newRecord: RecordAbsensi = {
        id: Date.now().toString(),
        siswaId,
        tanggal: new Date(tanggalInput),
        status,
        jamMasuk: status === 'Hadir' || status === 'Terlambat' ? new Date().toTimeString().slice(0, 5) : undefined,
      };
      setRecordAbsensi([...recordAbsensi, newRecord]);
    }
  };

  const handleHapusRecord = (recordId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus record ini?')) {
      setRecordAbsensi(recordAbsensi.filter(r => r.id !== recordId));
    }
  };

  const hitungLaporanSiswa = (siswaId: string): LaporanAbsensiSiswa | null => {
    const siswa = daftarSiswa.find(s => s.id === siswaId);
    if (!siswa) return null;

    const recordSiswa = recordAbsensi.filter(r => r.siswaId === siswaId);
    const hadir = recordSiswa.filter(r => r.status === 'Hadir').length;
    const ijin = recordSiswa.filter(r => r.status === 'Ijin').length;
    const sakit = recordSiswa.filter(r => r.status === 'Sakit').length;
    const alfa = recordSiswa.filter(r => r.status === 'Alfa').length;
    const terlambat = recordSiswa.filter(r => r.status === 'Terlambat').length;
    const izinKeluar = recordSiswa.filter(r => r.status === 'Izin Keluar').length;

    const totalHari = recordSiswa.length;
    const hariHadir = hadir + terlambat; // Terlambat tetap dihitung sebagai hadir

    return {
      siswaId,
      namaSiswa: siswa.nama,
      nis: siswa.nis,
      kelas: siswa.kelas,
      hadir,
      ijin,
      sakit,
      alfa,
      terlambat,
      izinKeluar,
      totalHari,
      persentaseKehadiran: hitungPersentaseKehadiran(totalHari, hariHadir)
    };
  };

  const getCheckStatus = (siswaId: string, tanggal: string) => {
    return recordAbsensi.find(r => 
      r.siswaId === siswaId && 
      new Date(r.tanggal).toISOString().split('T')[0] === tanggal
    );
  };

  const renderInputAbsensi = () => {
    if (daftarSiswa.length === 0) {
      return (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Input Absensi Harian</h2>
              <button
                onClick={() => {
                  loadDataSiswa();
                  loadRecordAbsensi();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Refresh data siswa dan absensi"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
          <div className="card p-12 text-center bg-blue-50 border-2 border-blue-200">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Data Siswa</h2>
            <p className="text-gray-600 mb-6">Silakan tambahkan data siswa terlebih dahulu di tab "Manajemen Siswa"</p>
            <button
              onClick={() => setActiveTab('manajemen')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ke Manajemen Siswa
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Input Absensi Harian</h2>
            <button
              onClick={() => {
                loadDataSiswa();
                loadRecordAbsensi();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Refresh data siswa dan absensi"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tanggal</label>
            <input
              type="date"
              value={tanggalInput}
              onChange={(e) => setTanggalInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => {
                setSelectedKelas(e.target.value);
                loadDataSiswa();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getDaftarKelas(schoolMode).map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">NIS</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Siswa</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Hadir</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ijin</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Sakit</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Alfa</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Terlambat</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Izin Keluar</th>
              </tr>
            </thead>
            <tbody>
              {daftarSiswa.map((siswa, index) => {
                const existingRecord = getCheckStatus(siswa.id, tanggalInput);
                return (
                  <tr key={siswa.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-700">{siswa.nis}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{siswa.nama}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Hadir')}
                        className={`w-8 h-8 rounded font-bold transition-colors ${
                          existingRecord?.status === 'Hadir'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-green-300'
                        }`}
                        title="Hadir"
                      >
                        ✓
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Ijin')}
                        className={`w-8 h-8 rounded font-bold transition-colors ${
                          existingRecord?.status === 'Ijin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-blue-300'
                        }`}
                        title="Ijin"
                      >
                        I
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Sakit')}
                        className={`w-8 h-8 rounded font-bold transition-colors ${
                          existingRecord?.status === 'Sakit'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-yellow-300'
                        }`}
                        title="Sakit"
                      >
                        S
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Alfa')}
                        className={`w-8 h-8 rounded font-bold transition-colors ${
                          existingRecord?.status === 'Alfa'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-red-300'
                        }`}
                        title="Alfa"
                      >
                        A
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Terlambat')}
                        className={`w-8 h-8 rounded font-bold text-xs transition-colors ${
                          existingRecord?.status === 'Terlambat'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-orange-300'
                        }`}
                        title="Terlambat"
                      >
                        T
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTambahAbsensi(siswa.id, 'Izin Keluar')}
                        className={`w-8 h-8 rounded font-bold text-xs transition-colors ${
                          existingRecord?.status === 'Izin Keluar'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-purple-300'
                        }`}
                        title="Izin Keluar"
                      >
                        K
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Keterangan:</strong> ✓ = Hadir | I = Ijin | S = Sakit | A = Alfa | T = Terlambat | K = Izin Keluar
          </p>
        </div>
      </div>
    </div>
    );
  };

  const renderLaporan = () => {
    const getStatusColor = (status: AbsensiStatus) => {
      const colors: Record<AbsensiStatus, string> = {
        'Hadir': 'bg-green-100 text-green-800',
        'Ijin': 'bg-blue-100 text-blue-800',
        'Sakit': 'bg-yellow-100 text-yellow-800',
        'Alfa': 'bg-red-100 text-red-800',
        'Terlambat': 'bg-orange-100 text-orange-800',
        'Izin Keluar': 'bg-purple-100 text-purple-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatTanggal = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Date(date).toLocaleDateString('id-ID', options);
    };

    const filterRecords = recordAbsensi.filter(record => {
      const recordDate = new Date(record.tanggal);
      const recordDateStr = recordDate.toISOString().split('T')[0];
      const recordBulan = String(recordDate.getMonth() + 1).padStart(2, '0');
      const recordTahun = String(recordDate.getFullYear());

      const matchesSiswa = !selectedSiswaLaporan || record.siswaId === selectedSiswaLaporan;
      const matchesSearch = daftarSiswa
        .find(s => s.id === record.siswaId)
        ?.nama.toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesDateRange = true;
      if (filterTanggalMulai || filterTanggalAkhir) {
        if (filterTanggalMulai) {
          matchesDateRange = recordDateStr >= filterTanggalMulai;
        }
        if (filterTanggalAkhir) {
          matchesDateRange = matchesDateRange && recordDateStr <= filterTanggalAkhir;
        }
      } else {
        // Gunakan filter bulan-tahun jika tanggal range kosong
        matchesDateRange = recordBulan === filterBulan && recordTahun === filterTahun;
      }

      return matchesSiswa && matchesSearch && matchesDateRange;
    });

    const sortedRecords = [...filterRecords].sort((a, b) =>
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    const laporanAll = daftarSiswa
      .map(siswa => hitungLaporanSiswa(siswa.id))
      .filter(Boolean) as LaporanAbsensiSiswa[];

    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {(laporanViewType as string) === 'ringkas' ? 'Laporan Absensi Siswa' : 'Riwayat Kehadiran Siswa'}
                </h2>
                {(laporanViewType as string) === 'detail' && (
                  <p className="text-sm text-gray-600 mt-1">
                    {filterTanggalMulai || filterTanggalAkhir ?
                      `Periode: ${filterTanggalMulai} hingga ${filterTanggalAkhir}` :
                      `Bulan: ${['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][parseInt(filterBulan)]} ${filterTahun}`
                    }
                  </p>
                )}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download size={18} />
                Export Excel
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-4 flex-wrap">
            <button
              onClick={() => setLaporanViewType('ringkas')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (laporanViewType as string) === 'ringkas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Ringkas
            </button>
            <button
              onClick={() => setLaporanViewType('detail')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                (laporanViewType as string) === 'detail'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Riwayat Detail
            </button>
          </div>

          {(laporanViewType as string) === 'ringkas' ? (
            <>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-gray-800 mb-2">Keterangan Status Kehadiran:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-green-700">✓ 80-100%:</span> <span className="text-gray-600">Sangat Baik</span>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">⚠ 60-79%:</span> <span className="text-gray-600">Cukup</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">✗ &lt;60%:</span> <span className="text-gray-600">Kurang</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {laporanAll
                  .filter(laporan => laporan.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((laporan) => {
                    const statusKesehatan = getStatusKesehatan(laporan.persentaseKehadiran);
                    const bgColor = laporan.persentaseKehadiran >= 80 ? 'bg-green-50' :
                                   laporan.persentaseKehadiran >= 60 ? 'bg-yellow-50' : 'bg-red-50';

                    return (
                      <div
                        key={laporan.siswaId}
                        onClick={() => setSelectedSiswaLaporan(selectedSiswaLaporan === laporan.siswaId ? null : laporan.siswaId)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${bgColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{laporan.namaSiswa}</h3>
                            <p className="text-sm text-gray-600">NIS: {laporan.nis} | Kelas: {laporan.kelas}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{laporan.persentaseKehadiran}%</div>
                            <p className="text-sm text-gray-600">{statusKesehatan}</p>
                          </div>
                        </div>

                        {selectedSiswaLaporan === laporan.siswaId && (
                          <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-6 gap-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{laporan.hadir}</p>
                              <p className="text-xs text-gray-600">Hadir</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{laporan.ijin}</p>
                              <p className="text-xs text-gray-600">Ijin</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{laporan.sakit}</p>
                              <p className="text-xs text-gray-600">Sakit</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{laporan.alfa}</p>
                              <p className="text-xs text-gray-600">Alfa</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">{laporan.terlambat}</p>
                              <p className="text-xs text-gray-600">Terlambat</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{laporan.izinKeluar}</p>
                              <p className="text-xs text-gray-600">Izin Keluar</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-1">Bulan</label>
                  <select
                    value={filterBulan}
                    onChange={(e) => {
                      setFilterBulan(e.target.value);
                      setFilterTanggalMulai('');
                      setFilterTanggalAkhir('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-1">Tahun</label>
                  <input
                    type="number"
                    value={filterTahun}
                    onChange={(e) => {
                      setFilterTahun(e.target.value);
                      setFilterTanggalMulai('');
                      setFilterTanggalAkhir('');
                    }}
                    min="2020"
                    max="2100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-1">atau Rentang Tanggal</label>
                  <button
                    onClick={() => {
                      setFilterTanggalMulai('');
                      setFilterTanggalAkhir('');
                      setFilterBulan(String(new Date().getMonth() + 1).padStart(2, '0'));
                      setFilterTahun(String(new Date().getFullYear()));
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    Reset ke Bulan Ini
                  </button>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-3">Keterangan Warna:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-sm text-gray-700">Hadir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">I</div>
                    <span className="text-sm text-gray-700">Ijin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">S</div>
                    <span className="text-sm text-gray-700">Sakit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">A</div>
                    <span className="text-sm text-gray-700">Alfa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">T</div>
                    <span className="text-sm text-gray-700">Terlambat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">K</div>
                    <span className="text-sm text-gray-700">Izin Keluar</span>
                  </div>
                </div>
              </div>

              {sortedRecords.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 font-medium">Tidak ada data riwayat kehadiran</p>
                  <p className="text-sm text-gray-500 mt-1">Mulai input absensi untuk melihat riwayat</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {daftarSiswa
                    .filter(siswa => {
                      const hasPencatatan = sortedRecords.some(r => r.siswaId === siswa.id);
                      const namaMatch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase());
                      return hasPencatatan && namaMatch;
                    })
                    .map((siswa) => {
                      const siswaRecords = sortedRecords
                        .filter(r => r.siswaId === siswa.id)
                        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

                      const getStatusBadge = (status: AbsensiStatus) => {
                        const statusMap: Record<AbsensiStatus, { text: string; bg: string }> = {
                          'Hadir': { text: '✓', bg: 'bg-green-100 text-green-700' },
                          'Ijin': { text: 'I', bg: 'bg-blue-100 text-blue-700' },
                          'Sakit': { text: 'S', bg: 'bg-yellow-100 text-yellow-700' },
                          'Alfa': { text: 'A', bg: 'bg-red-100 text-red-700' },
                          'Terlambat': { text: 'T', bg: 'bg-orange-100 text-orange-700' },
                          'Izin Keluar': { text: 'K', bg: 'bg-purple-100 text-purple-700' }
                        };
                        return statusMap[status] || { text: '?', bg: 'bg-gray-100 text-gray-700' };
                      };

                      return (
                        <div key={siswa.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <div className="font-semibold text-gray-900 min-w-fit">{siswa.nama}:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {siswaRecords.map((record) => {
                                const badge = getStatusBadge(record.status);
                                const tanggal = new Date(record.tanggal).getDate();
                                return (
                                  <div
                                    key={record.id}
                                    title={`${tanggal} - ${record.status}`}
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold cursor-help ${badge.bg}`}
                                  >
                                    <span className="text-xs">{tanggal}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderStatistik = () => {
    const laporanAll = daftarSiswa
      .map(siswa => hitungLaporanSiswa(siswa.id))
      .filter(Boolean) as LaporanAbsensiSiswa[];

    const rataRataKehadiran = laporanAll.length > 0
      ? Math.round(laporanAll.reduce((sum, l) => sum + l.persentaseKehadiran, 0) / laporanAll.length)
      : 0;

    const totalAlfa = laporanAll.reduce((sum, l) => sum + l.alfa, 0);
    const totalSakit = laporanAll.reduce((sum, l) => sum + l.sakit, 0);
    const totalIjin = laporanAll.reduce((sum, l) => sum + l.ijin, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500 rounded-lg text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rata-rata Kehadiran</p>
                <p className="text-3xl font-bold text-gray-900">{rataRataKehadiran}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-500 rounded-lg text-white">
                <Users size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Alfa</p>
                <p className="text-3xl font-bold text-gray-900">{totalAlfa}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-500 rounded-lg text-white">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Sakit</p>
                <p className="text-3xl font-bold text-gray-900">{totalSakit}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500 rounded-lg text-white">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Ijin</p>
                <p className="text-3xl font-bold text-gray-900">{totalIjin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribusi Status Absensi</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">
                  {laporanAll.reduce((sum, l) => sum + l.hadir, 0)} siswa
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(laporanAll.reduce((sum, l) => sum + l.hadir, 0) / (laporanAll.length || 1) / 10) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Alfa</span>
                <span className="text-sm font-medium text-gray-700">{totalAlfa} siswa</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(totalAlfa / (laporanAll.length || 1) / 10) * 100}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Sakit</span>
                <span className="text-sm font-medium text-gray-700">{totalSakit} siswa</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(totalSakit / (laporanAll.length || 1) / 10) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getTitleAbsensi(schoolMode)}</h1>
        <p className="text-gray-600">Kelola kehadiran dan ketidakhadiran siswa dengan mudah</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'input'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Input Absensi
        </button>
        <button
          onClick={() => setActiveTab('laporan')}
          className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'laporan'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Laporan
        </button>
        <button
          onClick={() => setActiveTab('statistik')}
          className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'statistik'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Statistik
        </button>
        <button
          onClick={() => setActiveTab('manajemen')}
          className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'manajemen'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Settings size={18} />
          Manajemen Siswa
        </button>
      </div>

      {activeTab === 'input' && renderInputAbsensi()}
      {activeTab === 'laporan' && renderLaporan()}
      {activeTab === 'statistik' && renderStatistik()}
      {activeTab === 'manajemen' && <ManajemenSiswaKelas schoolMode={schoolMode} />}
    </div>
  );
}
