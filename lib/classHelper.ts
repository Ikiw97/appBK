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
