import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, CheckCircle, Zap, Trophy, AlertCircle,
  Activity, Target, Clock, Award, Flame, Heart
} from 'lucide-react';

// Mock data for analytics
const assessmentTrendData = [
  { name: 'Minggu 1', akpd: 12, aum: 8, personality: 5, total: 25 },
  { name: 'Minggu 2', akpd: 19, aum: 12, personality: 8, total: 39 },
  { name: 'Minggu 3', akpd: 28, aum: 18, personality: 15, total: 61 },
  { name: 'Minggu 4', akpd: 35, aum: 24, personality: 22, total: 81 },
  { name: 'Minggu 5', akpd: 42, aum: 32, personality: 28, total: 102 },
  { name: 'Minggu 6', akpd: 48, aum: 38, personality: 35, total: 121 },
];

const studentEngagementData = [
  { name: 'Asesmen', value: 35, color: '#3b82f6' },
  { name: 'Game Edukasi', value: 28, color: '#8b5cf6' },
  { name: 'Latihan Soal', value: 22, color: '#10b981' },
  { name: 'Lainnya', value: 15, color: '#f59e0b' },
];

const performanceData = [
  { range: '80-100', students: 15 },
  { range: '60-79', students: 28 },
  { range: '40-59', students: 18 },
  { range: '20-39', students: 8 },
  { range: '0-19', students: 3 },
];

const topPerformers = [
  { rank: 1, name: 'Ahmad Rifqi', score: 98, completion: 100 },
  { rank: 2, name: 'Siti Nurhaliza', score: 96, completion: 95 },
  { rank: 3, name: 'Budi Santoso', score: 94, completion: 90 },
  { rank: 4, name: 'Nur Azizah', score: 92, completion: 85 },
  { rank: 5, name: 'Eka Putri', score: 90, completion: 80 },
];

const activityData = [
  { time: '08:00', assessments: 5, games: 3 },
  { time: '10:00', assessments: 8, games: 6 },
  { time: '12:00', assessments: 12, games: 10 },
  { time: '14:00', assessments: 10, games: 8 },
  { time: '16:00', assessments: 7, games: 5 },
  { time: '18:00', assessments: 3, games: 2 },
];

interface AnalyticsDashboardProps {
  onBack?: () => void;
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [totalStudents] = useState(92);
  const [completionRate] = useState(78);
  const [avgScore] = useState(86);
  const [systemStatus] = useState('Optimal');

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="px-6 md:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-500">Ringkasan Lengkap Sistem BK Anda</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ← Kembali
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={Users}
          label="Total Siswa Aktif"
          value={totalStudents.toString()}
          change="+12%"
          color="blue"
        />
        <KPICard
          icon={CheckCircle}
          label="Tingkat Penyelesaian"
          value={`${completionRate}%`}
          change="+5%"
          color="green"
        />
        <KPICard
          icon={Target}
          label="Rata-rata Skor"
          value={avgScore.toString()}
          change="+3 poin"
          color="purple"
        />
        <KPICard
          icon={Flame}
          label="Status Sistem"
          value={systemStatus}
          change="Optimal"
          color="orange"
        />
      </div>

      {/* Charts - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Assessment Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Tren Penyelesaian Asesmen</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={assessmentTrendData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total Penyelesaian"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Student Engagement Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-indigo-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Engagement per Fitur</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentEngagementData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {studentEngagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Distribution and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-emerald-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Distribusi Performa</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar
                dataKey="students"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Jumlah Siswa"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-cyan-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Aktivitas per Jam</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="assessments"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Asesmen"
              />
              <Line
                type="monotone"
                dataKey="games"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Game"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-amber-500" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Top 5 Performa Terbaik</h2>
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer) => (
              <div key={performer.rank} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                  {performer.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{performer.name}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Skor: {performer.score}</span>
                    <span>Selesai: {performer.completion}%</span>
                  </div>
                </div>
                <div className="text-amber-500 font-bold">#{performer.rank}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status and Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-rose-500" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Kesehatan Sistem</h2>
          </div>
          <div className="space-y-6">
            <StatusIndicator label="Server Status" status="Optimal" percent={100} color="green" />
            <StatusIndicator label="Database" status="Optimal" percent={98} color="green" />
            <StatusIndicator label="Storage" status="Baik" percent={72} color="blue" />
            <StatusIndicator label="API Response" status="Cepat" percent={95} color="green" />
            <StatusIndicator label="User Concurrent" status="Normal" percent={45} color="blue" />

            <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-emerald-600" size={20} />
                <p className="font-semibold text-emerald-900 text-sm">Sistem Berjalan Normal</p>
              </div>
              <p className="text-xs text-emerald-700">
                Semua komponen sistem berfungsi dengan optimal. Tidak ada masalah yang terdeteksi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  change: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function KPICard({ icon: Icon, label, value, change, color }: KPICardProps) {
  const bgColors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${bgColors[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface StatusIndicatorProps {
  label: string;
  status: string;
  percent: number;
  color: 'green' | 'blue' | 'orange' | 'red';
}

function StatusIndicator({ label, status, percent, color }: StatusIndicatorProps) {
  const barColors = {
    green: 'bg-emerald-500',
    blue: 'bg-blue-500',
    orange: 'bg-amber-500',
    red: 'bg-rose-500',
  };

  const textColors = {
    green: 'text-emerald-600',
    blue: 'text-blue-600',
    orange: 'text-amber-600',
    red: 'text-rose-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-700 font-medium text-sm">{label}</p>
        <span className={`text-xs font-semibold ${textColors[color]}`}>{status}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className={`${barColors[color]} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}
