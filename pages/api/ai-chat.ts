import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/ai-chat
 * Chatbot edukatif untuk siswa — topik BK saja.
 *
 * PENGAMANAN:
 *  - Nama/NIS/kelas TIDAK dikirim ke AI (hanya isi pertanyaan)
 *  - Filter topik bahaya (self-harm, kekerasan, dll)
 *  - Topik bahaya -> arahkan ke Guru BK
 *  - Rate limit per IP
 *  - Riwayat maks 6 pesan terakhir
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ── system prompt: batasi AI ke topik BK/edukasi ──────────────
const SYSTEM_PROMPT = `Kamu adalah "Teman BK" — asisten virtual untuk siswa sekolah di Indonesia.

TUGASMU:
Membantu siswa dengan pertanyaan UMUM seputar:
- Bimbingan konseling (apa itu BK, fungsi guru BK)
- Bullying / perundungan (apa itu, cara menghadapi, cara melapor)
- Cara belajar efektif, manajemen waktu, fokus
- Mengatasi gugup/cemas saat ujian atau presentasi
- Pergaulan, pertemanan, komunikasi dengan orang tua
- Memahami emosi sendiri, motivasi belajar
- Memilih jurusan / cita-cita

ATURAN KETAT:
1. Jawab HANYA topik di atas. Kalau di luar itu (misal: PR matematika,
   coding, resep masakan, gosip), tolak dengan sopan:
   "Maaf, aku cuma bisa bantu soal BK dan hal-hal seputar sekolah."
2. Jawab SINGKAT (maks 120 kata), ramah, pakai bahasa siswa (bukan formal kaku).
3. JANGAN pernah memberi diagnosis medis/psikologis.
4. JANGAN menanyakan data pribadi (nama, alamat, nomor HP, akun sosmed).
5. Kalau kamu tidak tahu — bilang tidak tahu, sarankan tanya Guru BK.
6. SELALU ingatkan bahwa kamu bukan pengganti Guru BK.

Kalau ada indikasi bahaya (bullying berat, kekerasan, menyakiti diri,
masalah keluarga serius) -> PRIORITASKAN agar siswa bicara dengan Guru BK
atau orang dewasa yang dipercaya. Jangan tangani sendiri.

Format jawaban: paragraf pendek atau 2-3 poin. Jangan pakai markdown rumit.`;

// ── deteksi topik bahaya ─────────────────────────────────────
// Prinsip:
//  1. Pertanyaan EDUKATIF ("apa itu bullying?") -> jawab AI, jangan blokir
//  2. Cerita PRIBADI ("aku dibully") -> langsung arahkan ke Guru BK
//  3. Dua lapis: cek EDUKATIF dulu, baru cek masalah pribadi

const EDUKATIF = /^\s*(apa itu|apakah|bagaimana|gimana|cara|jelaskan|kenapa|mengapa|contoh|tips|apa yang dimaksud|aku mau tanya|mau nanya)\b/i;

// tanda orang sedang MENGALAMI (bukan bertanya)
const SEDANG_MENGALAMI = /\b(aku|saya|gue|gw|aq|akuu|dulu aku|barusan|kemarin aku|hari ini aku|tadi aku|aku pernah|saya pernah|temenku|temanku|kawanku|ada teman|ada anak|adikku|kakakku)\b/i;

// tanda bahaya keras — ini SELALU diblokir apapun kalimatnya
const BAHAYA_KERAS = [
  { tag: 'self_harm', re: /(pengen|ingin|mau|pgn|pingin)\s+(mat[il]|bunuh diri|ngakhirin|mengakhiri)|bunuh diri|mengakhiri hidup|nyile[td]|sayat tangan|gak mau hidup|tidak mau hidup|gak kuat hidup|udah gak sanggup/i },
  { tag: 'kekerasan', re: /(diperkosa|dicabuli|dilecehkan|dipaksa\s+(buka|telanjang|berhubungan)|kekerasan seksual|pelecehan seksual|kdr[t]?\b)/i },
];

// tanda masalah pribadi — perlu SEDANG_MENGALAMI + kata kunci
const BAHAYA_LEMBUT = [
  { tag: 'bullying', re: /(di|kena)\s*(bully|bullied|rundung|rundungin|intimidasi|palak|hina|ejek|ancam)|dibully|dirundung|dipalak|diejek terus/i },
  { tag: 'kekerasan', re: /(dipukul|diker[ai]s|disiksa|diancam|dipalak|dipaksa|dilempar|dijambak)/i },
  { tag: 'berisiko', re: /(pakai|pake|minum|nyoba|nyobain|jual)\s+(narkoba|ngelem|miras|alkohol|obat terlarang)|hamil di luar nikah|mau aborsi/i },
];

function cekBahaya(teks: string): string | null {
  const t = teks.trim();

  // 1. bahaya keras — selalu ditangkap
  for (const b of BAHAYA_KERAS) {
    if (b.re.test(t)) return b.tag;
  }

  // 2. pertanyaan edukatif — jangan blokir, biar AI menjawab
  if (EDUKATIF.test(t)) return null;

  // 3. masalah pribadi — butuh "sedang mengalami" + kata kunci
  if (SEDANG_MENGALAMI.test(t)) {
    for (const b of BAHAYA_LEMBUT) {
      if (b.re.test(t)) return b.tag;
    }
  }

  return null;
}

// ── rate limit sederhana (per IP, dalam memori) ───────────────
const hits = new Map<string, number[]>();
const LIMIT = 20;        // maks 20 pesan
const WINDOW = 10 * 60 * 1000;  // per 10 menit

function kenaLimit(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

// ── balasan aman (tanpa AI) untuk topik bahaya ────────────────
function balasanBahaya(tag: string) {
  const pesan: Record<string, string> = {
    self_harm:
      'Aku dengar kamu sedang berat banget. Terima kasih sudah cerita.\n\n' +
      'Tolong jangan hadapi ini sendiri ya. Bicaralah dengan Guru BK di sekolah — ' +
      'mereka ada untuk membantu, dan rahasia kamu aman.\n\n' +
      'Kalau kamu butuh teman bicara segera, hubungi:\n' +
      '• Guru BK sekolahmu\n' +
      '• Orang tua atau keluarga yang kamu percaya\n' +
      '• Layanan 119 ext 8 (Kemenkes, gratis 24 jam)\n\n' +
      'Kamu tidak sendiri. Tolong hubungi Guru BK sekarang.',
    kekerasan:
      'Terima kasih sudah berani cerita. Apa yang kamu alami itu bukan salahmu.\n\n' +
      'Ini berat untuk dihadapi sendiri. Segera hubungi Guru BK di sekolah, ' +
      'atau orang dewasa yang kamu percaya (orang tua, wali kelas, keluarga).\n\n' +
      'Kalau kamu dalam bahaya langsung, hubungi:\n' +
      '• Polisi: 110\n' +
      '• SAPA 129 (layanan kekerasan, gratis 24 jam)\n\n' +
      'Keselamatanmu yang paling utama.',
    berisiko:
      'Ini hal serius yang sebaiknya dibicarakan langsung dengan orang dewasa ' +
      'yang kamu percaya.\n\n' +
      'Tolong temui Guru BK di sekolah — mereka bisa bantu memberi arah yang benar, ' +
      'tanpa menghakimi.\n\n' +
      'Kalau butuh bantuan segera: 119 ext 8 (gratis, 24 jam).',
    bullying:
      'Terima kasih sudah cerita. Yang kamu alami itu tidak benar, dan kamu ' +
      'berhak merasa aman di sekolah.\n\n' +
      'Langkah yang bisa kamu lakukan:\n' +
      '1. Catat kejadiannya (kapan, di mana, siapa)\n' +
      '2. Ceritakan ke Guru BK atau wali kelas — mereka wajib membantumu\n' +
      '3. Simpan bukti kalau ada (chat/screenshot)\n' +
      '4. Jangan balas dengan kekerasan\n\n' +
      'Kamu tidak sendirian. Guru BK ada untuk melindungimu.',
  };
  return pesan[tag] || pesan.berisiko;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Fitur AI belum dikonfigurasi. Hubungi administrator.',
    });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Pesan kosong.' });
  }
  if (message.length > 800) {
    return res.status(400).json({ error: 'Pesan terlalu panjang (maks 800 karakter).' });
  }

  // rate limit
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  if (kenaLimit(ip)) {
    return res.status(429).json({
      error: 'Terlalu banyak pesan. Coba lagi beberapa menit lagi.',
    });
  }

  // ── cek topik bahaya: TIDAK dikirim ke AI ──
  const bahaya = cekBahaya(message);
  if (bahaya) {
    return res.status(200).json({
      reply: balasanBahaya(bahaya),
      perluGuruBK: true,
      kategori: bahaya,
    });
  }

  // ── susun riwayat (maks 6 pesan terakhir, tanpa identitas) ──
  const pesan: { role: string; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];
  if (Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      if (h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string') {
        pesan.push({ role: h.role, content: String(h.content).slice(0, 800) });
      }
    }
  }
  pesan.push({ role: 'user', content: message });

  try {
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: pesan,
        temperature: 0.6,
        max_tokens: 350,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error('[ai-chat] Groq error', r.status, t.slice(0, 200));
      return res.status(502).json({
        error: 'Maaf, asisten sedang sibuk. Coba lagi atau tanya Guru BK.',
      });
    }

    const data = await r.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Maaf, aku tidak bisa menjawab itu. Coba tanya Guru BK ya.';

    return res.status(200).json({ reply, perluGuruBK: false });
  } catch (e) {
    console.error('[ai-chat] fetch failed', e);
    return res.status(502).json({
      error: 'Koneksi ke asisten gagal. Coba lagi nanti.',
    });
  }
}
