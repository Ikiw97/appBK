import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContextSupabase';
import { Plus, Users, ArrowLeft, BarChart2, CheckCircle, Trash2 } from 'lucide-react';
import { getSociometrySessions, SociometrySession } from '@/lib/sociometryDB';

// Sub-components (Will be moved to separate files later for cleanliness)
// Placeholder imports
import SociometryBuilder from './SociometryBuilder';
import SociometryStudentForm from './SociometryStudentForm';
import SociometryResults from './SociometryResults';

export default function SociometryWrapper() {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create' | 'fill' | 'results'>('list');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<SociometrySession[]>([]);
    const [loading, setLoading] = useState(false);

    // Load sessions
    useEffect(() => {
        loadSessions();
    }, [user]);

    const loadSessions = async () => {
        setLoading(true); // Add simple loading state if needed, though mostly relying on ssr/effect
        try {
            const data = await getSociometrySessions();
            console.log('Wrapper received sessions:', data);
            // alert(`Debug: Loaded ${data.length} sessions`); // Uncomment for aggressive debug
            setSessions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setView('create');
    };

    const handleBack = () => {
        setView('list');
        setSelectedSessionId(null);
        loadSessions(); // Reload list
    };

    const handleViewResults = (id: string) => {
        setSelectedSessionId(id);
        setView('results');
    };

    const handleFillSurvey = (id: string) => {
        setSelectedSessionId(id);
        setView('fill');
    };

    const handleDeleteSession = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus sosiometri ini? Semua data respons akan ikut terhapus.')) {
            return;
        }

        try {
            const response = await fetch(`/api/sociometry/delete-session?session_id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Gagal menghapus sosiometri');
            }

            // Reload sessions after successful deletion
            await loadSessions();
            alert('Sosiometri berhasil dihapus');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Gagal menghapus sosiometri: ' + (err as Error).message);
        }
    };

    // Render List
    const renderList = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sosiometri</h1>
                    <p className="text-slate-500">Analisis hubungan sosial antar siswa di kelas</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') && (
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Buat Sosiometri Baru</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Users className="mx-auto text-slate-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-slate-900">Belum ada Sosiometri</h3>
                        <p className="text-slate-500 mb-4">
                            {(user?.role === 'admin' || user?.role === 'teacher')
                                ? 'Mulai dengan membuat sosiometri baru untuk kelas'
                                : 'Belum ada sesi sosiometri yang aktif untuk saat ini.'}
                        </p>

                        {/* Student Specific Hint */}
                        {user?.role === 'student' && (
                            <div className="max-w-md mx-auto mb-6 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-700">
                                <p className="font-semibold mb-1">Tips: Data tidak muncul?</p>
                                <p>Jika Anda menggunakan browser yang berbeda dengan Admin (atau Incognito), data mungkin tidak tampil karena penyimpanan masih bersifat <b>Lokal</b>. Coba login di browser yang sama.</p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={loadSessions}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
                            >
                                Refresh Data
                            </button>

                            {(user?.role === 'admin' || user?.role === 'teacher') && (
                                <button
                                    onClick={handleCreateNew}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                                >
                                    Buat Sosiometri
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    sessions.map(session => (
                        <div key={session.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {session.status === 'active' ? 'Aktif' : 'Selesai'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{session.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">Kelas: {session.class_id} • {session.questions.length} Pertanyaan</p>

                            <div className="pt-4 border-t border-slate-100 flex gap-2">
                                {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'super_admin') ? (
                                    <>
                                        <button
                                            onClick={() => handleViewResults(session.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                                        >
                                            <BarChart2 size={16} /> Hasil
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.id)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                            title="Hapus Sosiometri"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleFillSurvey(session.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <CheckCircle size={16} /> Isi Survei
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50/50">
            {view === 'list' && renderList()}

            {view === 'create' && (
                <SociometryBuilder onBack={handleBack} />
            )}

            {view === 'fill' && selectedSessionId && (
                <SociometryStudentForm sessionId={selectedSessionId} onBack={handleBack} />
            )}

            {view === 'results' && selectedSessionId && (
                <SociometryResults sessionId={selectedSessionId} onBack={handleBack} />
            )}
        </div>
    );
}
