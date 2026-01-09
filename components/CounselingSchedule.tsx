import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, User, Plus, X, Users, MapPin, BookOpen, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/authContextSupabase';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';

interface ScheduleEvent {
    id: number;
    case_id: number;
    title: string;
    description: string;
    created_at: string;
    author: string;
    counseling_cases: {
        student_name: string;
        class: string;
        category: string;
    } | null;
}

interface ClassSchedule {
    id: number;
    class: string;
    topic: string;
    description: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: string;
    location: string;
    counselor: string;
    created_at: string;
}

export default function CounselingSchedule() {
    const { user } = useAuth();
    const [individualSchedules, setIndividualSchedules] = useState<ScheduleEvent[]>([]);
    const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'class'>('all');

    const [schoolMode] = useState<SchoolMode>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('schoolMode') as SchoolMode) || 'smp';
        }
        return 'smp';
    });

    const classes = generateClasses(schoolMode);

    const [newSchedule, setNewSchedule] = useState({
        class: '',
        topic: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration: '1 x 40 Menit',
        location: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Fetch individual schedules
            const { data: individualData, error: individualError } = await supabase
                .from('case_timeline')
                .select(`
                    *,
                    counseling_cases (
                        student_name,
                        class,
                        category
                    )
                `)
                .eq('type', 'schedule')
                .order('created_at', { ascending: true });

            if (individualError) throw individualError;
            setIndividualSchedules(individualData || []);

            // Fetch class schedules
            const { data: classData, error: classError } = await supabase
                .from('class_schedules')
                .select('*')
                .order('scheduled_date', { ascending: true });

            if (classError) {
                console.error('Error fetching class schedules:', classError);
                // Don't throw - table might not exist yet
            } else {
                setClassSchedules(classData || []);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassSchedule = async () => {
        if (!newSchedule.class || !newSchedule.topic || !newSchedule.scheduled_date || !newSchedule.scheduled_time) {
            alert('Mohon lengkapi kelas, topik, tanggal, dan waktu.');
            return;
        }

        try {
            const { error } = await supabase
                .from('class_schedules')
                .insert([{
                    class: newSchedule.class,
                    topic: newSchedule.topic,
                    description: newSchedule.description,
                    scheduled_date: newSchedule.scheduled_date,
                    scheduled_time: newSchedule.scheduled_time,
                    duration: newSchedule.duration,
                    location: newSchedule.location,
                    counselor: user?.name || user?.email || 'Admin'
                }]);

            if (error) throw error;

            setShowAddModal(false);
            setNewSchedule({
                class: '',
                topic: '',
                description: '',
                scheduled_date: '',
                scheduled_time: '',
                duration: '1 x 40 Menit',
                location: ''
            });
            fetchSchedules();
        } catch (error) {
            console.error('Error adding class schedule:', error);
            alert('Gagal menambahkan jadwal. Pastikan tabel database sudah tersedia.');
        }
    };

    const handleDeleteClassSchedule = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            const { error } = await supabase
                .from('class_schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Gagal menghapus jadwal.');
        }
    };

    // Combine and filter schedules
    const getCombinedSchedules = () => {
        let combined: any[] = [];

        if (activeTab === 'all' || activeTab === 'individual') {
            combined = [...combined, ...individualSchedules.map(s => ({
                ...s,
                type: 'individual',
                date: new Date(s.created_at),
                displayDate: s.created_at
            }))];
        }

        if (activeTab === 'all' || activeTab === 'class') {
            combined = [...combined, ...classSchedules.map(s => ({
                ...s,
                type: 'class',
                date: new Date(`${s.scheduled_date}T${s.scheduled_time}`),
                displayDate: `${s.scheduled_date}T${s.scheduled_time}`
            }))];
        }

        // Filter by date
        if (filterDate) {
            combined = combined.filter(item => {
                const itemDate = new Date(item.displayDate).toISOString().split('T')[0];
                return itemDate === filterDate;
            });
        }

        // Sort by date
        combined.sort((a, b) => a.date.getTime() - b.date.getTime());

        return combined;
    };

    const combinedSchedules = getCombinedSchedules();

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-[#FAFAFA]">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 rounded-3xl p-6 md:p-10 text-white mb-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">Layanan BK</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
                                Jadwal Konseling
                            </h1>
                            <p className="text-white/70 text-base md:text-lg max-w-xl">
                                Kelola jadwal konseling individu dan kelas secara terintegrasi.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-white/90 transition-all font-bold shadow-lg shadow-indigo-900/30 hover:scale-105"
                        >
                            <Plus size={20} />
                            <span>Tambah Jadwal Kelas</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                            <User size={14} className="text-white/60" />
                            <span className="text-sm font-medium text-white/80">{individualSchedules.length} Individu</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                            <Users size={14} className="text-white/60" />
                            <span className="text-sm font-medium text-white/80">{classSchedules.length} Kelas</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-pink-500/30 to-orange-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs and Filters */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setActiveTab('individual')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'individual'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Individu
                        </button>
                        <button
                            onClick={() => setActiveTab('class')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'class'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Kelas
                        </button>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2">
                        <Calendar className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-700">Filter Tanggal:</span>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Memuat jadwal...
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {combinedSchedules.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                {filterDate ? 'Tidak ada jadwal pada tanggal ini.' : 'Belum ada jadwal konseling.'}
                            </div>
                        ) : (
                            combinedSchedules.map((item, index) => (
                                <div key={`${item.type}-${item.id}`} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center group">
                                    {/* Date Box */}
                                    <div className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${item.type === 'class'
                                        ? 'bg-purple-50 border-purple-100 text-purple-600'
                                        : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                        <span className="text-xs font-bold uppercase">
                                            {new Date(item.displayDate).toLocaleDateString('id-ID', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-bold">{new Date(item.displayDate).getDate()}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            {item.type === 'class' ? (
                                                <Users size={18} className="text-purple-600" />
                                            ) : (
                                                <User size={18} className="text-blue-600" />
                                            )}
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.type === 'class' ? item.topic : (item.counseling_cases?.student_name || 'Siswa Tidak Dikenal')}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.type === 'class'
                                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                {item.type === 'class' ? item.class : (item.counseling_cases?.class || '-')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>
                                                    {new Date(item.displayDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                </span>
                                            </div>
                                            {item.type === 'class' && item.duration && (
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen size={14} />
                                                    <span>{item.duration}</span>
                                                </div>
                                            )}
                                            {item.type === 'class' && item.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} />
                                                <span>{item.type === 'class' ? item.counselor : item.author}</span>
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {item.type === 'class' && (
                                        <button
                                            onClick={() => handleDeleteClassSchedule(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Jadwal"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Add Class Schedule Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-slate-900">Tambah Jadwal Kelas</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas <span className="text-red-500">*</span></label>
                                    <select
                                        value={newSchedule.class}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, class: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">Pilih Kelas</option>
                                        {classes.map(cls => (
                                            <option key={cls.value} value={cls.value}>{cls.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Durasi</label>
                                    <input
                                        type="text"
                                        value={newSchedule.duration}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, duration: e.target.value })}
                                        placeholder="1 x 40 Menit"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Topik Layanan <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newSchedule.topic}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, topic: e.target.value })}
                                    placeholder="Contoh: Motivasi Belajar, Etika Pergaulan"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={newSchedule.scheduled_date}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Waktu <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        value={newSchedule.scheduled_time}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi</label>
                                <input
                                    type="text"
                                    value={newSchedule.location}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                                    placeholder="Contoh: Ruang BK, Kelas VII-A"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi / Catatan</label>
                                <textarea
                                    value={newSchedule.description}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                    placeholder="Catatan tambahan tentang sesi konseling..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAddClassSchedule}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Simpan Jadwal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
