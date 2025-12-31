import { SiswaAbsensi, DAFTAR_KELAS_SMP } from './absensiTypes';

const STORAGE_KEY = 'bk_dashboard_siswa_data';

export function getAllSiswaData(): Record<string, SiswaAbsensi[]> {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading siswa data:', error);
  }
  
  return initializeDefaultData();
}

export function getSiswaByKelas(kelas: string): SiswaAbsensi[] {
  const allData = getAllSiswaData();
  return allData[kelas] || [];
}

export function addSiswa(kelas: string, siswa: Omit<SiswaAbsensi, 'id' | 'kelas'>): SiswaAbsensi {
  const allData = getAllSiswaData();
  if (!allData[kelas]) {
    allData[kelas] = [];
  }

  const newSiswa: SiswaAbsensi = {
    ...siswa,
    id: Date.now().toString(),
    kelas
  };

  allData[kelas].push(newSiswa);
  saveSiswaData(allData);
  return newSiswa;
}

export function updateSiswa(kelas: string, siswaId: string, updatedData: Partial<SiswaAbsensi>): SiswaAbsensi | null {
  const allData = getAllSiswaData();
  if (!allData[kelas]) return null;

  const index = allData[kelas].findIndex(s => s.id === siswaId);
  if (index === -1) return null;

  allData[kelas][index] = { ...allData[kelas][index], ...updatedData };
  saveSiswaData(allData);
  return allData[kelas][index];
}

export function deleteSiswa(kelas: string, siswaId: string): boolean {
  const allData = getAllSiswaData();
  if (!allData[kelas]) return false;

  const initialLength = allData[kelas].length;
  allData[kelas] = allData[kelas].filter(s => s.id !== siswaId);

  if (allData[kelas].length < initialLength) {
    saveSiswaData(allData);
    return true;
  }

  return false;
}

export function deleteSiswaByNIS(kelas: string, nis: string): boolean {
  const allData = getAllSiswaData();
  if (!allData[kelas]) return false;

  const initialLength = allData[kelas].length;
  allData[kelas] = allData[kelas].filter(s => s.nis !== nis);

  if (allData[kelas].length < initialLength) {
    saveSiswaData(allData);
    return true;
  }

  return false;
}

export function saveSiswaData(data: Record<string, SiswaAbsensi[]>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving siswa data:', error);
  }
}

export function initializeDefaultData(): Record<string, SiswaAbsensi[]> {
  const defaultData: Record<string, SiswaAbsensi[]> = {};

  // Initialize all classes with empty student lists
  DAFTAR_KELAS_SMP.forEach(kelas => {
    defaultData[kelas] = [];
  });

  saveSiswaData(defaultData);
  return defaultData;
}

export function importSiswaFromCSV(csv: string, kelas: string): number {
  const lines = csv.trim().split('\n');
  const allData = getAllSiswaData();
  if (!allData[kelas]) {
    allData[kelas] = [];
  }

  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map(p => p.trim());
    if (parts.length < 2) continue;

    const [nis, nama, jenisKelamin = 'L'] = parts;
    
    if (nis && nama) {
      const newSiswa: SiswaAbsensi = {
        id: Date.now().toString() + i,
        nama,
        nis,
        kelas,
        jenisKelamin: (jenisKelamin.toUpperCase() === 'P' ? 'P' : 'L')
      };

      allData[kelas].push(newSiswa);
      count++;
    }
  }

  saveSiswaData(allData);
  return count;
}
