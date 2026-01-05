export type AbsensiStatus = 'Hadir' | 'Ijin' | 'Sakit' | 'Alfa' | 'Terlambat' | 'Izin Keluar';

export interface SiswaAbsensi {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
}

export interface RecordAbsensi {
  id: string;
  siswaId: string;
  tanggal: Date;
  status: AbsensiStatus;
  keterangan?: string;
  jamMasuk?: string;
  jamKeluar?: string;
  keteranganIzin?: string;
}

export interface LaporanAbsensiSiswa {
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  hadir: number;
  ijin: number;
  sakit: number;
  alfa: number;
  terlambat: number;
  izinKeluar: number;
  totalHari: number;
  persentaseKehadiran: number;
}

export interface StatistikKelasBulanan {
  kelas: string;
  bulan: string;
  totalSiswa: number;
  rataRataKehadiran: number;
  totalAlfaKelas: number;
  totalSakitKelas: number;
  totalIjinKelas: number;
  totalTerlambatKelas: number;
}

export const STATUS_ABSENSI = {
  HADIR: 'Hadir',
  IJIN: 'Ijin',
  SAKIT: 'Sakit',
  ALFA: 'Alfa',
  TERLAMBAT: 'Terlambat',
  IZIN_KELUAR: 'Izin Keluar'
} as const;

export const DAFTAR_KELAS_SMP = [
  'VII-A', 'VII-B', 'VII-C', 'VII-D',
  'VIII-A', 'VIII-B', 'VIII-C', 'VIII-D',
  'IX-A', 'IX-B', 'IX-C', 'IX-D'
];

export const DAFTAR_KELAS_SMA = [
  'X-A', 'X-B', 'X-C', 'X-D',
  'XI-A', 'XI-B', 'XI-C', 'XI-D',
  'XII-A', 'XII-B', 'XII-C', 'XII-D'
];

export const DAFTAR_KELAS_SMK = [
  'X-A', 'X-B', 'X-C', 'X-D',
  'XI-A', 'XI-B', 'XI-C', 'XI-D',
  'XII-A', 'XII-B', 'XII-C', 'XII-D'
];

export function getDaftarKelas(schoolMode: 'smp' | 'sma_smk'): string[] {
  return schoolMode === 'smp' ? DAFTAR_KELAS_SMP : DAFTAR_KELAS_SMA;
}

export function getTitleAbsensi(schoolMode: 'smp' | 'sma_smk'): string {
  return schoolMode === 'smp' ? 'Absensi Siswa/Siswi' : 'Absensi Siswa SMA/SMK';
}

export function getWarnaDariBentukAbsensi(status: AbsensiStatus): string {
  switch (status) {
    case 'Hadir':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Ijin':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Sakit':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Alfa':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Terlambat':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Izin Keluar':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function hitungPersentaseKehadiran(totalHari: number, hariHadir: number): number {
  if (totalHari === 0) return 0;
  return Math.round((hariHadir / totalHari) * 100);
}

export function getStatusKesehatan(persentase: number): string {
  if (persentase >= 90) return 'Sangat Baik';
  if (persentase >= 80) return 'Baik';
  if (persentase >= 70) return 'Cukup';
  if (persentase >= 60) return 'Kurang';
  return 'Sangat Kurang';
}
