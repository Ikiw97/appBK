import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/authContextSupabase';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';

type LoginMode = 'selection' | 'teacher' | 'student';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, loginAsStudent, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<LoginMode>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Teacher login state
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Student login state
  const [studentName, setStudentName] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(teacherEmail, teacherPassword);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login gagal. Silahkan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginAsStudent(studentName);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login gagal. Silahkan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Login Selection Screen
  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="text-blue-600" size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">BK Dashboard</h1>
            <p className="text-blue-100">Platform Asesmen Konseling</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Teacher Login Button */}
            <button
              onClick={() => setMode('teacher')}
              className="w-full bg-white text-gray-900 rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogIn className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Login Guru BK
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Gunakan username dan password
                  </p>
                </div>
              </div>
            </button>

            {/* Student Login Button */}
            <button
              onClick={() => setMode('student')}
              className="w-full bg-white text-gray-900 rounded-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Login Siswa
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Klik di sini untuk masuk sebagai siswa
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900 bg-opacity-50 border border-blue-400 rounded-lg p-4">
            <p className="text-blue-100 text-sm text-center">
              💡 Guru BK: Gunakan akun Anda untuk mengelola asesmen dan mengatur akses fitur
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Login Screen
  if (mode === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setTeacherEmail('');
                setTeacherPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Guru BK</h1>
            <p className="text-gray-600 mb-6">
              Masukkan username dan password Anda
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="input-field w-full"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="input-field w-full"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !teacherEmail || !teacherPassword}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 text-xs font-medium mb-2">
                📝 Gunakan email dan password akun Supabase Anda
              </p>
              <p className="text-blue-800 text-xs">
                Jika belum memiliki akun, hubungi administrator untuk membuat akun baru
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Login Screen
  if (mode === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setMode('selection');
                setError('');
                setStudentName('');
              }}
              className="text-green-600 hover:text-green-700 font-medium text-sm mb-6 flex items-center gap-1"
            >
              ← Kembali
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Login Siswa
            </h1>
            <p className="text-gray-600 mb-6">
              Silahkan masukkan nama Anda untuk mulai belajar
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="input-field w-full"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !studentName.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Masuk Sebagai Siswa'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-900 text-sm">
                ✨ Cukup masukkan nama Anda untuk memulai asesmen
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
