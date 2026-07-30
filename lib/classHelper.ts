export type SchoolMode = 'sd' | 'smp' | 'sma_smk';

export interface ClassOption {
  value: string;
  label: string;
  gradeLevel: string;
}

const sdGrades = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const smpGrades = ['VII', 'VIII', 'IX'];
const smaSmkGrades = ['X', 'XI', 'XII'];

const numericSubClasses = ['1', '2', '3', '4'];
const alphaSubClasses = ['A', 'B', 'C', 'D'];

export function getGradesByMode(mode: SchoolMode): string[] {
  if (mode === 'sd') return sdGrades;
  return mode === 'smp' ? smpGrades : smaSmkGrades;
}

export function generateClasses(mode: SchoolMode): ClassOption[] {
  const grades = getGradesByMode(mode);
  const classes: ClassOption[] = [];
  const subClasses = mode === 'sd' ? alphaSubClasses : numericSubClasses;

  grades.forEach((grade) => {
    subClasses.forEach((subClass) => {
      const classValue = `${grade}-${subClass}`;
      classes.push({
        value: classValue,
        label: classValue,
        gradeLevel: grade,
      });
    });
  });

  return classes;
}

export function getGradeLabel(mode: SchoolMode): string {
  if (mode === 'sd') return 'Kelas SD';
  return mode === 'smp' ? 'Kelas SMP' : 'Kelas SMA/SMK';
}

export function getSchoolModeLabel(mode: SchoolMode): string {
  if (mode === 'sd') return 'SD';
  return mode === 'smp' ? 'SMP' : 'SMA/SMK';
}

export function filterAndSortClasses(classList: string[], mode: SchoolMode): string[] {
  const isSdClass = (cls: string) => /^(I|II|III|IV|V|VI)(-[A-Z0-9]+)?$/i.test(cls) || /^[1-6][A-D]$/i.test(cls);
  const isSmpClass = (cls: string) => /^(VII|VIII|IX)(-[A-Z0-9]+)?$/i.test(cls);
  const isSmaClass = (cls: string) => /^(X|XI|XII)(-[A-Z0-9]+)?$/i.test(cls);

  const filtered = classList.filter((cls) => {
    if (mode === 'sd') return isSdClass(cls);
    if (mode === 'smp') return isSmpClass(cls);
    if (mode === 'sma_smk') return isSmaClass(cls);
    return true;
  });

  const getRomanValue = (roman: string) => {
    const map: Record<string, number> = {
      'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
      'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12
    };
    return map[roman.toUpperCase()] || 0;
  };

  return filtered.sort((a, b) => {
    const [romanA = '', suffixA = ''] = a.split('-');
    const [romanB = '', suffixB = ''] = b.split('-');

    const valA = getRomanValue(romanA);
    const valB = getRomanValue(romanB);

    if (valA !== valB) return valA - valB;
    return suffixA.localeCompare(suffixB, undefined, { numeric: true });
  });
}
