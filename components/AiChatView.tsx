'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Trash2,
} from 'lucide-react';

/**
 * AiChatView — "Teman BK"
 * Chatbot edukatif untuk siswa. Topik BK saja.
 * Tidak mengirim data pribadi ke AI.
 */

interface Pesan {
  role: 'user' | 'assistant';
  content: string;
  perluGuruBK?: boolean;
}

interface Props {
  onBack?: () => void;
  /** dipanggil supaya siswa bisa langsung lompat ke chat Guru BK */
  onKontakGuruBK?: () => void;
}

const SAPAAN: Pesan = {
  role: 'assistant',
  content:
    'Hai! Aku Teman BK 👋\n\n' +
    'Aku bisa bantu menjawab pertanyaan umum seputar:\n' +
    '• Bullying dan cara menghadapinya\n' +
    '• Cara belajar dan mengatur waktu\n' +
    '• Rasa gugup saat ujian atau presentasi\n' +
    '• Pertemanan dan komunikasi dengan orang tua\n\n' +
    'Tanya apa saja. Tapi ingat: aku bukan Guru BK, ya — ' +
    'kalau ada masalah serius, tetap cerita ke Guru BK kamu.',
};

const SARAN = [
  'Apa itu bullying dan bagaimana cara menghadapinya?',
  'Bagaimana cara belajar yang efektif?',
  'Aku sering gugup saat presentasi, gimana mengatasinya?',
  'Cara mengatur waktu antara sekolah dan main?',
];

export default function AiChatView({ onBack, onKontakGuruBK }: Props) {
  const [pesan, setPesan] = useState<Pesan[]>([SAPAAN]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [perluGuru, setPerluGuru] = useState(false);
  const bawahRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bawahRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pesan, loading]);

  async function kirim(teks: string) {
    const isi = teks.trim();
    if (!isi || loading) return;

    const riwayatBaru: Pesan[] = [...pesan, { role: 'user', content: isi }];
    setPesan(riwayatBaru);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: isi,
          // hanya kirim teks percakapan — TANPA data siswa
          history: pesan
            .filter((p) => p.content !== SAPAAN.content)
            .slice(-6)
            .map((p) => ({ role: p.role, content: p.content })),
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        setPesan((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data?.error || 'Maaf, ada gangguan. Coba lagi ya.',
          },
        ]);
        return;
      }

      if (data.perluGuruBK) setPerluGuru(true);

      setPesan((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          perluGuruBK: data.perluGuruBK,
        },
      ]);
    } catch {
      setPesan((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Koneksi gagal. Coba lagi ya.',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      kirim(input);
    }
  }

  function bersihkan() {
    setPesan([SAPAAN]);
    setPerluGuru(false);
  }

  return (
    <div className="h-[calc(100vh-100px)] min-h-[500px] bg-gray-50 flex flex-col rounded-xl overflow-hidden border border-gray-200">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm">Teman BK</h2>
          <p className="text-[11px] text-white/80">Asisten belajar &amp; konseling</p>
        </div>
        <button
          onClick={bersihkan}
          className="p-1.5 hover:bg-white/20 rounded-lg transition"
          title="Mulai ulang"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Peringatan tetap ── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-start gap-2">
        <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-snug">
          Aku <b>bukan Guru BK</b>. Aku tidak bisa gantikan konseling sungguhan.
          Untuk masalah pribadi atau serius, cerita ke Guru BK ya.
        </p>
      </div>

      {/* ── Tombol eskalasi ── */}
      {perluGuru && onKontakGuruBK && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs text-red-800 flex-1">
            Sebaiknya kamu bicara dengan Guru BK sekarang.
          </p>
          <button
            onClick={onKontakGuruBK}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
          >
            Hubungi Guru BK
          </button>
        </div>
      )}

      {/* ── Isi chat ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {pesan.map((p, i) => (
          <div
            key={i}
            className={`flex ${p.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                p.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : p.perluGuruBK
                  ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}
            >
              {p.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            </div>
          </div>
        )}

        {/* saran pertanyaan (hanya di awal) */}
        {pesan.length === 1 && !loading && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] text-gray-500 font-medium">Coba tanya:</p>
            {SARAN.map((s, i) => (
              <button
                key={i}
                onClick={() => kirim(s)}
                className="block w-full text-left text-xs bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-xl px-3 py-2.5 text-gray-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bawahRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-gray-200 bg-white px-3 py-2.5 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={800}
          placeholder="Tulis pertanyaanmu…"
          className="flex-1 resize-none max-h-28 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button
          onClick={() => kirim(input)}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition shrink-0"
          aria-label="Kirim"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
