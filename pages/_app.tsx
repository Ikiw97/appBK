import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Sidebar from '@/components/Sidebar'
import { AuthProvider, useAuth } from '@/lib/authContextSupabase'
import { LogOut, Menu } from 'lucide-react'
import '@/styles/globals.css'

// Make sure useEffect is available in AppContent

// Component that uses auth
function AppContent({ Component, pageProps, currentPage, setCurrentPage, currentSubpage, setCurrentSubpage }: any) {
  const router = useRouter()
  const { isAuthenticated, loading, user, signOut } = useAuth()
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Pages that don't need authentication
  const noAuthPages = ['/login']
  const isNoAuthPage = noAuthPages.includes(router.pathname)

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!loading && !isAuthenticated && !isNoAuthPage) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, isNoAuthPage, router])

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      try {
        await signOut()
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }

  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setShowReload(true);
      }, 5000); // Show reload option after 5 seconds of loading
    } else {
      setShowReload(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
        {showReload && (
          <div className="text-center flex flex-col gap-2">
            <p className="text-sm text-yellow-600">Koneksi tampak lambat...</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        )}
      </div>
    )
  }

  // Login page - no layout
  if (isNoAuthPage) {
    return <Component {...pageProps} />
  }

  // Check if user has admin privileges (teacher, admin, or super_admin)
  const isAdminOrTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.isSuperAdmin;

  // Authenticated pages with layout
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with User Info and Logout */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-16 md:h-20 print:hidden">
          <div className={`flex items-center justify-between h-full px-4 md:px-6 ${isAdminOrTeacher ? 'md:ml-64' : ''} transition-all duration-300`}>
            {/* Mobile Hamburger Menu */}
            <div className="flex items-center gap-4">
              {isAdminOrTeacher && (
                <button
                  onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={24} />
                </button>
              )}
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {isAdminOrTeacher && (
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            currentSubpage={currentSubpage}
            setCurrentSubpage={setCurrentSubpage}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        )}

        <main className={isAdminOrTeacher ? 'md:ml-64 transition-all duration-300 pt-4 print:ml-0 print:pt-0' : 'pt-4 print:pt-0'}>
          <Component
            {...pageProps}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            currentSubpage={currentSubpage}
            setCurrentSubpage={setCurrentSubpage}
          />
        </main>
      </div>
    )
  }

  return null
}

export default function App({ Component, pageProps }: AppProps) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [currentSubpage, setCurrentSubpage] = useState('daftar-asesmen')

  return (
    <AuthProvider>
      <AppContent
        Component={Component}
        pageProps={pageProps}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentSubpage={currentSubpage}
        setCurrentSubpage={setCurrentSubpage}
      />
    </AuthProvider>
  )
}
