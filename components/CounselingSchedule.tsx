import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, User, ArrowLeft, Search, Filter } from 'lucide-react';

interface ScheduleEvent {
    id: number;
    case_id: number;
    title: string;
    description: string;
    created_at: string; // Used as scheduled time
    author: string;
    counseling_cases: {
        student_name: string;
        class: string;
        category: string;
    } | null;
}

export default function CounselingSchedule() {
    const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Fetch schedules and related case data
            // Note: This relies on a foreign key relationship between case_timeline and counseling_cases
            const { data, error } = await supabase
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
                .order('created_at', { ascending: true }); // Ascending to show nearest future events first

            if (error) throw error;

            console.log('Schedules fetched:', data);
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredSchedules = schedules.filter(item => {
        if (!filterDate) return true;
        // Simple string comparison for YYYY-MM-DD
        return new Date(item.created_at).toISOString().startsWith(filterDate);
    });

    return (
        <div className="px-6 md:px-8 py-8 min-h-screen bg-gray-50">
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Jadwal Konseling</h1>
                    <p className="text-slate-500">Agenda sesi konseling mendatang</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
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
                        {filteredSchedules.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                {filterDate ? 'Tidak ada jadwal pada tanggal ini.' : 'Belum ada jadwal konseling.'}
                            </div>
                        ) : (
                            filteredSchedules.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-6 md:items-center group">
                                    {/* Date Box */}
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                                        <span className="text-xs font-bold uppercase">{new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                        <span className="text-2xl font-bold">{new Date(item.created_at).getDate()}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.counseling_cases?.student_name || 'Siswa Tidak Dikenal'}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                {item.counseling_cases?.class || '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} />
                                                <span>{item.author}</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                            "{item.description}"
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    {/* Optional: Add button to view case detail later */}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
