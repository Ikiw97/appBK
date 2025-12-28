import React, { useState } from 'react';
import { Home, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { useFeatureSettings } from '@/lib/useFeatureSettings';
import VocabularyGame from './VocabularyGame';
import PuzzleGame from './PuzzleGame';
import GameWithLeaderboard from './GameWithLeaderboard';
import KahootLeaderboard from './KahootLeaderboard';

type GameType = 'select' | 'vocabulary' | 'puzzle' | 'kahoot' | 'leaderboard';

interface GameSelectorProps {
  onBack?: () => void;
}

export default function GameSelector({ onBack }: GameSelectorProps) {
  const { user } = useAuth();
  const { settings, loading: settingsLoading } = useFeatureSettings();
  const [selectedGame, setSelectedGame] = useState<GameType>('select');

  // Debug logging
  console.log('🎮 [GameSelector] Render:', {
    userRole: user?.role,
    settingsLoaded: !!settings,
    gamesEnabled: {
      vocabulary: settings?.games?.vocabulary,
      puzzle: settings?.games?.puzzle,
      kahoot: settings?.games?.kahoot,
    },
  });

  const handleBackToSelector = () => {
    setSelectedGame('select');
  };

  // **IMPORTANT: Check roles**
  // - Teachers & Admins: Can play ALL games AND view leaderboard (bypass settings)
  // - Students: Can play enabled games AND view leaderboard
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.isSuperAdmin;
  const isPrivilegedUser = isTeacher || isAdmin;

  // Determine which games are enabled
  // Privileged users (Teacher/Admin) see ALL games regardless of settings
  // Students only see games enabled in settings
  const showVocabulary = isPrivilegedUser || settings?.games?.vocabulary;
  const showPuzzle = isPrivilegedUser || settings?.games?.puzzle;
  const showKahoot = isPrivilegedUser || settings?.games?.kahoot;

  // Loading state
  if (settingsLoading && !isPrivilegedUser) {
    return (
      <div className="px-6 md:px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  // Show Vocabulary Game
  if (selectedGame === 'vocabulary') {
    return (
      <VocabularyGame
        onBack={handleBackToSelector}
      />
    );
  }

  // Show Puzzle Game
  if (selectedGame === 'puzzle') {
    return (
      <PuzzleGame
        onBack={handleBackToSelector}
      />
    );
  }

  // Show Kahoot Game with Live Leaderboard
  if (selectedGame === 'kahoot') {
    return (
      <GameWithLeaderboard
        onBack={handleBackToSelector}
      />
    );
  }

  // Show Leaderboard
  if (selectedGame === 'leaderboard') {
    return (
      <KahootLeaderboard
        onBack={handleBackToSelector}
      />
    );
  }

  return (
    <div className="px-6 md:px-8 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎮 Game Edukasi</h1>
          <p className="text-gray-600">Pilih game yang ingin Anda mainkan</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home size={20} />
            Kembali
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vocabulary Game Card */}
        {showVocabulary && (
          <div
            onClick={() => setSelectedGame('vocabulary')}
            className="card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Game BK Asah Cerita</h2>
            <p className="text-gray-600 mb-6">
              Pelajari konsep BK melalui situasi nyata dalam kehidupan sehari-hari. Cocokkan istilah dengan scenario yang tepat.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Mode Match & Sprint</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                <span>8 istilah BK</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Waktu: 2 menit sprint</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Mainkan
            </button>
          </div>
        )}

        {/* Puzzle Game Card */}
        {showPuzzle && (
          <div
            onClick={() => setSelectedGame('puzzle')}
            className="card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🧩</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Puzzle Game</h2>
            <p className="text-gray-600 mb-6">
              Pecahkan teka-teki dan uji pemahaman Anda tentang konsep BK. Pilih jawaban yang paling tepat dari beberapa pilihan.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                <span>3 tingkat kesulitan</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                <span>8 puzzle soal</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Berbagai kategori BK</span>
              </div>
            </div>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Mainkan
            </button>
          </div>
        )}

        {/* Kahoot Game Card */}
        {showKahoot && (
          <div
            onClick={() => setSelectedGame('kahoot')}
            className="card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Kahoot Game</h2>
            <p className="text-gray-600 mb-6">
              Quiz cepat dan menyenangkan tentang BK dan kesejahteraan. Jawab pertanyaan dengan cepat sebelum waktu habis!
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>Mode real-time cepat</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>8 pertanyaan menarik</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>30 detik per soal</span>
              </div>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Mainkan
            </button>
          </div>
        )}
      </div>

      {/* Check if any games are enabled */}
      {!showVocabulary && !showPuzzle && !showKahoot && (
        <div className="mt-8 p-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
          <p className="text-lg text-yellow-800 font-semibold">📭 Belum Ada Game yang Diaktifkan</p>
          <p className="text-yellow-700 mt-2">Admin perlu mengaktifkan game terlebih dahulu sebelum Anda dapat bermain.</p>
        </div>
      )}

      {/* Info Section */}
      {(showVocabulary || showPuzzle || showKahoot) && (
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Pilih Game Favoritmu</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showVocabulary && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">📚 Suka Belajar Istilah?</p>
                <p className="text-gray-600 text-sm">Coba Game BK Asah Cerita untuk mempelajari berbagai istilah dan konsep dengan cerita nyata.</p>
              </div>
            )}
            {showPuzzle && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">🧩 Suka Tantangan?</p>
                <p className="text-gray-600 text-sm">Mainkan Puzzle Game untuk menguji pemahaman Anda dengan berbagai tingkat kesulitan.</p>
              </div>
            )}
            {showKahoot && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">⚡ Suka Cepat-Cepatan?</p>
                <p className="text-gray-600 text-sm">Ikuti Kahoot Game untuk quiz seru dengan tempo cepat dan kompetitif.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="mt-8">
        <button
          onClick={() => setSelectedGame('leaderboard')}
          className="w-full card p-8 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 group"
        >
          <div className="flex items-center gap-6">
            <div className="text-6xl group-hover:scale-110 transition-transform">🏆</div>
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lihat Peringkat Kahoot</h2>
              <p className="text-gray-600">Lihat ranking siswa, skor tertinggi, dan waktu tercepat dalam Kahoot Game</p>
              <div className="mt-4 flex items-center gap-2 text-amber-600 font-semibold">
                <BarChart3 size={20} />
                <span>Akses Leaderboard</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
