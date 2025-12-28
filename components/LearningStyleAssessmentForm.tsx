import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, BookOpen, Music, Activity, ChevronLeft } from 'lucide-react';
import { generateClasses, type SchoolMode } from '@/lib/classHelper';
import { submitAssessmentResult } from '@/lib/supabaseClient';

interface Question {
    id: number;
    type: 'V' | 'A' | 'K';
    question: string;
    options: {
        label: string;
        value: 'V' | 'A' | 'K';
    }[];
}

interface Result {
    visual: number;
    auditory: number;
    kinesthetic: number;
    dominant: string;
    percentage: number;
    description: string;
    tips: string[];
}

interface FormData {
    nama: string;
    kelas: string;
    jenisKelamin: string;
    [key: string]: string | number;
}

// 30 Questions (10 Visual, 10 Auditory, 10 Kinesthetic)
const QUESTIONS: Question[] = [
    {
        id: 1,
        type: 'V',
        question: 'Ketika kamu berbicara, kamu lebih suka...',
        options: [
            { label: 'Berbicara dengan cepat', value: 'V' },
            { label: 'Berbicara dengan irama yang teratur', value: 'A' },
            { label: 'Berbicara dengan lambat', value: 'K' }
        ]
    },
    {
        id: 2,
        type: 'V',
        question: 'Apa yang paling mengganggumu saat belajar?',
        options: [
            { label: 'Suasana yang berantakan/visual yang ramai', value: 'V' },
            { label: 'Suara bisising', value: 'A' },
            { label: 'Duduk diam terlalu lama', value: 'K' }
        ]
    },
    {
        id: 3,
        type: 'V',
        question: 'Ketika menerima petunjuk, kamu lebih suka...',
        options: [
            { label: 'Melihat diagram atau peta', value: 'V' },
            { label: 'Mendengarkan penjelasan lisan', value: 'A' },
            { label: 'Mencoba langsung', value: 'K' }
        ]
    },
    {
        id: 4,
        type: 'V',
        question: 'Apa yang kamu lakukan saat antre?',
        options: [
            { label: 'Melihat-lihat sekeliling', value: 'V' },
            { label: 'Berbicara dengan orang sebelah atau mendengarkan musik', value: 'A' },
            { label: 'Memainkan kunci atau mengetuk-ngetuk kaki', value: 'K' }
        ]
    },
    {
        id: 5,
        type: 'V',
        question: 'Saat bertemu orang baru, apa yang paling kamu ingat?',
        options: [
            { label: 'Wajah atau penampilan mereka', value: 'V' },
            { label: 'Nama atau suara mereka', value: 'A' },
            { label: 'Perasaan saat bersalaman atau berinteraksi', value: 'K' }
        ]
    },
    {
        id: 6,
        type: 'V',
        question: 'Bagaimana cara kamu menghafal sesuatu?',
        options: [
            { label: 'Menulisnya atau membayangkannya', value: 'V' },
            { label: 'Mengucapkannya berulang-ulang', value: 'A' },
            { label: 'Mempragakannya atau berjalan sambil menghafal', value: 'K' }
        ]
    },
    {
        id: 7,
        type: 'V',
        question: 'Apa yang kamu lakukan saat marah?',
        options: [
            { label: 'Diam dan memendam (ekspresi wajah berubah)', value: 'V' },
            { label: 'Mengungkapkannya dengan kata-kata', value: 'A' },
            { label: 'Membanting barang atau pergi keluar', value: 'K' }
        ]
    },
    {
        id: 8,
        type: 'V',
        question: 'Untuk bersantai, kamu lebih suka...',
        options: [
            { label: 'Membaca buku atau menonton film', value: 'V' },
            { label: 'Mendengarkan musik', value: 'A' },
            { label: 'Berolahraga atau membuat kerajinan tangan', value: 'K' }
        ]
    },
    {
        id: 9,
        type: 'V',
        question: 'Dalam sebuah presentasi, apa yang paling menarik bagimu?',
        options: [
            { label: 'Gambar, grafik, dan slide yang bagus', value: 'V' },
            { label: 'Intonasi suara pembicara dan penjelasannya', value: 'A' },
            { label: 'Demonstrasi atau contoh nyata', value: 'K' }
        ]
    },
    {
        id: 10,
        type: 'V',
        question: 'Jika kamu tersesat, apa yang kamu lakukan?',
        options: [
            { label: 'Melihat peta', value: 'V' },
            { label: 'Bertanya pada orang', value: 'A' },
            { label: 'Mengandalkan perasaan atau intuisi arah', value: 'K' }
        ]
    },
    {
        id: 11,
        type: 'A',
        question: 'Saat membaca buku cerita, apa yang kamu bayangkan?',
        options: [
            { label: 'Gambaran adegannya', value: 'V' },
            { label: 'Suara dialog tokoh-tokohnya', value: 'A' },
            { label: 'Perasaan yang dialami tokoh', value: 'K' }
        ]
    },
    {
        id: 12,
        type: 'A',
        question: 'Apa jenis pujian yang paling kamu sukai?',
        options: [
            { label: 'Diberi hadiah atau sertifikat (terlihat)', value: 'V' },
            { label: 'Dipuji secara lisan', value: 'A' },
            { label: 'Ditepuk pundak atau diajak salaman', value: 'K' }
        ]
    },
    {
        id: 13,
        type: 'A',
        question: 'Saat merakit mainan baru, kamu...',
        options: [
            { label: 'Melihat gambar petunjuknya', value: 'V' },
            { label: 'Meminta orang membacakan petunjuknya', value: 'A' },
            { label: 'Langsung mencoba merakitnya', value: 'K' }
        ]
    },
    {
        id: 14,
        type: 'A',
        question: 'Apa yang lebih mudah kamu ingat dari film?',
        options: [
            { label: 'Setting tempat dan kostumnya', value: 'V' },
            { label: 'Musik soundtrack dan dialognya', value: 'A' },
            { label: 'Adegan aksinya', value: 'K' }
        ]
    },
    {
        id: 15,
        type: 'A',
        question: 'Saat tidak ada kegiatan, kamu cenderung...',
        options: [
            { label: 'Melamun atau mengamati sekitar', value: 'V' },
            { label: 'Bersenandung atau berbicara pada diri sendiri', value: 'A' },
            { label: 'Bergerak atau tidak bisa diam', value: 'K' }
        ]
    },
    {
        id: 16,
        type: 'K',
        question: 'Kamu mengetahui seseorang berbohong dari...',
        options: [
            { label: 'Ekspresi wajahnya yang aneh', value: 'V' },
            { label: 'Nada bicaranya yang berubah', value: 'A' },
            { label: 'Gerak-gerik tubuhnya', value: 'K' }
        ]
    },
    {
        id: 17,
        type: 'K',
        question: 'Saat berbicara dengan orang lain, kamu suka...',
        options: [
            { label: 'Menatap matanya', value: 'V' },
            { label: 'Mendengarkan dengan seksama (bisa sambil memalingkan muka)', value: 'A' },
            { label: 'Menyentuh lengan atau berdiri dekat', value: 'K' }
        ]
    },
    {
        id: 18,
        type: 'K',
        question: 'Kondisi ruangan belajar idealmu adalah...',
        options: [
            { label: 'Terang dan rapi', value: 'V' },
            { label: 'Tenang atau ada musik lembut', value: 'A' },
            { label: 'Nyaman dan ada ruang gerak', value: 'K' }
        ]
    },
    {
        id: 19,
        type: 'K',
        question: 'Kamu lebih cepat paham jika guru...',
        options: [
            { label: 'Menulis di papan tulis', value: 'V' },
            { label: 'Menjelaskan dengan cerita', value: 'A' },
            { label: 'Meminta siswa mempraktikkan', value: 'K' }
        ]
    },
    {
        id: 20,
        type: 'K',
        question: 'Hadiah ulang tahun yang paling kamu inginkan...',
        options: [
            { label: 'Buku, poster, atau perhiasan', value: 'V' },
            { label: 'Alat musik atau tiket konser', value: 'A' },
            { label: 'Peralatan olahraga atau game', value: 'K' }
        ]
    },
    {
        id: 21,
        type: 'V',
        question: 'Ketika kamu punya masalah, kamu...',
        options: [
            { label: 'Membuat daftar pemecahan masalah', value: 'V' },
            { label: 'Menelepon teman untuk curhat', value: 'A' },
            { label: 'Pergi jalan-jalan atau tidur', value: 'K' }
        ]
    },
    {
        id: 22,
        type: 'A',
        question: 'Kamu merasa senang ketika...',
        options: [
            { label: 'Melihat pemandangan indah', value: 'V' },
            { label: 'Mendengarkan lagu favorit', value: 'A' },
            { label: 'Melakukan aktivitas fisik', value: 'K' }
        ]
    },
    {
        id: 23,
        type: 'K',
        question: 'Saat di pesta atau acara ramai, kamu...',
        options: [
            { label: 'Duduk dan mengamati orang-orang', value: 'V' },
            { label: 'Mengobrol dengan banyak orang', value: 'A' },
            { label: 'Ikut menari atau bermain games', value: 'K' }
        ]
    },
    {
        id: 24,
        type: 'V',
        question: 'Jika membeli barang elektronik baru, kamu...',
        options: [
            { label: 'Membaca buku manualnya', value: 'V' },
            { label: 'Bertanya pada penjual cara pakainya', value: 'A' },
            { label: 'Langsung memencet tombol-tombolnya', value: 'K' }
        ]
    },
    {
        id: 25,
        type: 'A',
        question: 'Kamu lebih mudah mengingat nomor telepon dengan cara...',
        options: [
            { label: 'Melihat angkanya di layar', value: 'V' },
            { label: 'Mengucapkannya berulang kali', value: 'A' },
            { label: 'Mengetikkan polanya di keypad', value: 'K' }
        ]
    },
    {
        id: 26,
        type: 'K',
        question: 'Kegiatan ekstrakurikuler yang paling menarik bagimu...',
        options: [
            { label: 'Melukis atau Fotografi', value: 'V' },
            { label: 'Paduan Suara atau Debat', value: 'A' },
            { label: 'Olahraga atau Teater', value: 'K' }
        ]
    },
    {
        id: 27,
        type: 'V',
        question: 'Saat mengeja kata sulit, kamu...',
        options: [
            { label: 'Membayangkan tulisannya', value: 'V' },
            { label: 'Mengejanya dengan suara keras', value: 'A' },
            { label: 'Menulisnya di kertas dulu', value: 'K' }
        ]
    },
    {
        id: 28,
        type: 'A',
        question: 'Kamu paling tidak suka jika...',
        options: [
            { label: 'Melihat tulisan yang jelek/coretan', value: 'V' },
            { label: 'Mendengar suara bising/nada sumbang', value: 'A' },
            { label: 'Mengenakan pakaian yang tidak nyaman', value: 'K' }
        ]
    },
    {
        id: 29,
        type: 'K',
        question: 'Liburan impianmu adalah...',
        options: [
            { label: 'Tamasya melihat pemandangan', value: 'V' },
            { label: 'Menonton konser musik', value: 'A' },
            { label: 'Hiking atau berenang di pantai', value: 'K' }
        ]
    },
    {
        id: 30,
        type: 'K',
        question: 'Gaya belajarmu secara umum...',
        options: [
            { label: 'Harus melihat catatan/buku', value: 'V' },
            { label: 'Harus mendengarkan guru', value: 'A' },
            { label: 'Harus mempraktikkan/melakukan', value: 'K' }
        ]
    }
];

const STYLE_INFO = {
    V: {
        label: 'Visual',
        icon: BookOpen,
        description: 'Kamu belajar paling baik dengan melihat. Kamu menyukai gambar, diagram, dan membaca.',
        tips: [
            'Gunakan spidol warna-warni untuk mencatat',
            'Buat peta konsep (mind map) untuk merangkum materi',
            'Tonton video pembelajaran',
            'Duduk di barisan depan agar bisa melihat guru dengan jelas'
        ]
    },
    A: {
        label: 'Auditorial',
        icon: Music,
        description: 'Kamu belajar paling baik dengan mendengarkan. Kamu suka diskusi dan penjelasan lisan.',
        tips: [
            'Rekam penjelasan guru dan dengarkan ulang',
            'Baca materi pelajaran dengan suara keras',
            'Belajar sambil berdiskusi dengan teman',
            'Gunakan lagu atau irama untuk menghafal'
        ]
    },
    K: {
        label: 'Kinestetik',
        icon: Activity,
        description: 'Kamu belajar paling baik dengan melakukan. Kamu suka praktik dan bergerak.',
        tips: [
            'Lakukan praktik atau eksperimen langsung',
            'Belajar sambil berjalan-jalan atau bergerak',
            'Gunakan objek nyata untuk memahami konsep',
            'Ambil istirahat singkat untuk meregangkan badan saat belajar'
        ]
    }
};

interface LearningStyleAssessmentFormProps {
    onBack?: () => void;
    schoolMode?: SchoolMode;
}

export default function LearningStyleAssessmentForm({ onBack, schoolMode = 'smp' }: LearningStyleAssessmentFormProps) {
    const [step, setStep] = useState<'info' | 'questions' | 'result'>('info');
    const [formData, setFormData] = useState<FormData>({ nama: '', kelas: '', jenisKelamin: '' });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    // Add separate state for the current selection before confirming moving next
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    const classOptions = generateClasses(schoolMode);
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const totalQuestions = QUESTIONS.length;
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleInfoChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleStartQuestions = () => {
        if (!formData.nama.trim() || !formData.kelas.trim() || !formData.jenisKelamin.trim()) {
            alert('Mohon isi nama, kelas, dan jenis kelamin terlebih dahulu');
            return;
        }
        setStep('questions');
    };

    const calculateResult = (finalAnswers: Record<number, string>): Result => {
        let vCount = 0;
        let aCount = 0;
        let kCount = 0;

        Object.values(finalAnswers).forEach(val => {
            if (val === 'V') vCount++;
            if (val === 'A') aCount++;
            if (val === 'K') kCount++;
        });

        const total = vCount + aCount + kCount;
        // Determine dominant style
        let dominant = 'V';
        let max = vCount;

        if (aCount > max) {
            max = aCount;
            dominant = 'A';
        }
        if (kCount > max) {
            max = kCount;
            dominant = 'K';
        }

        // Handle ties - if tie, perhaps show mixed/multimodal, but for simplicity we prioritize V > A > K or just pick one
        // For a more robust app we could show percentages of each.

        return {
            visual: vCount,
            auditory: aCount,
            kinesthetic: kCount,
            dominant,
            percentage: (max / total) * 100,
            description: STYLE_INFO[dominant as 'V' | 'A' | 'K'].description,
            tips: STYLE_INFO[dominant as 'V' | 'A' | 'K'].tips
        };
    };

    const handleOptionSelect = (value: 'V' | 'A' | 'K') => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = async () => {
        // Validation: must answer before moving next
        if (!answers[currentQuestion.id]) {
            alert('Silakan pilih salah satu jawaban terlebih dahulu.');
            return;
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Finish / Submit
            await submitResults();
        }
    };

    const submitResults = async () => {
        setLoading(true);
        try {
            const calculatedResult = calculateResult(answers);

            const submitData = {
                nama: formData.nama,
                kelas: formData.kelas,
                jenisKelamin: formData.jenisKelamin,
                ...answers,
                summary_v: calculatedResult.visual,
                summary_a: calculatedResult.auditory,
                summary_k: calculatedResult.kinesthetic,
                dominant_style: calculatedResult.dominant
            };

            const questionsForSubmit = QUESTIONS.map(q => ({ id: q.id }));

            await submitAssessmentResult('gaya_belajar', submitData, questionsForSubmit as any);

            setResult(calculatedResult);
            setStep('result');
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Terjadi kesalahan saat menyimpan hasil.');
            // Show results anyway even if save fails, so user isn't blocked
            setResult(calculateResult(answers));
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'info') {
        return (
            <div className="px-6 md:px-8 py-8 max-w-2xl mx-auto">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
                        <ChevronLeft size={20} /> Kembali
                    </button>
                )}

                <div className="card p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Asesmen Gaya Belajar</h1>
                    <p className="text-gray-600 mb-8">
                        Ketahui gaya belajar (Visual, Auditorial, Kinestetik) yang paling cocok untukmu.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Masukkan nama lengkap"
                                value={formData.nama}
                                onChange={(e) => handleInfoChange('nama', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Kelas</label>
                            <select
                                className="input-field"
                                value={formData.kelas}
                                onChange={(e) => handleInfoChange('kelas', e.target.value)}
                            >
                                <option value="">Pilih Kelas</option>
                                {classOptions.map((cls) => (
                                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Jenis Kelamin</label>
                            <select
                                className="input-field"
                                value={formData.jenisKelamin}
                                onChange={(e) => handleInfoChange('jenisKelamin', e.target.value)}
                            >
                                <option value="">Pilih Jenis Kelamin</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>

                        <button onClick={handleStartQuestions} className="btn-primary w-full py-3">
                            Mulai Asesmen
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'result' && result) {
        const DominantIcon = STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].icon;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {onBack && (
                        <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
                            <ChevronLeft size={20} /> Kembali ke Menu
                        </button>
                    )}

                    <div className="card p-8 text-center mb-8 bg-white shadow-xl border-t-8 border-blue-500">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                <DominantIcon size={64} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gaya Belajar Dominan Kamu:</h2>
                        <h1 className="text-4xl font-extrabold text-blue-600 mb-4">{STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].label}</h1>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">{result.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className={`p-4 rounded-lg border-2 ${result.dominant === 'V' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1">Visual</div>
                                <div className="text-2xl font-bold text-blue-600">{result.visual}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                            <div className={`p-4 rounded-lg border-2 ${result.dominant === 'A' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1">Auditorial</div>
                                <div className="text-2xl font-bold text-blue-600">{result.auditory}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                            <div className={`p-4 rounded-lg border-2 ${result.dominant === 'K' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="font-bold text-gray-700 mb-1">Kinestetik</div>
                                <div className="text-2xl font-bold text-blue-600">{result.kinesthetic}</div>
                                <div className="text-xs text-gray-500">Poin</div>
                            </div>
                        </div>

                        <div className="text-left bg-blue-50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen size={24} className="text-blue-600" />
                                Tips Belajar untuk {STYLE_INFO[result.dominant as 'V' | 'A' | 'K'].label}:
                            </h3>
                            <ul className="space-y-3">
                                {result.tips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium">
                        <ArrowLeft size={20} /> Kembali
                    </button>
                )}

                <div className="card p-8 shadow-xl">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Pertanyaan {currentQuestion.id} dari {totalQuestions}</span>
                            <span className="text-sm font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8">{currentQuestion.question}</h2>

                    <div className="space-y-4">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option.value)}
                                disabled={loading}
                                className={`w-full p-4 text-left border-2 rounded-xl transition-all font-medium text-gray-700
                                  ${answers[currentQuestion.id] === option.value
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option.label}</span>
                                    {answers[currentQuestion.id] === option.value && (
                                        <CheckCircle className="text-blue-500" size={20} />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0 || loading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
                                ${currentQuestionIndex === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            <ChevronLeft size={20} /> Sebelumnya
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={loading || !answers[currentQuestion.id]}
                            className={`flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? 'Menyimpan...' : (
                                currentQuestionIndex === totalQuestions - 1 ? 'Selesai & Lihat Hasil' : 'Selanjutnya'
                            )}
                            {!loading && currentQuestionIndex < totalQuestions - 1 && <ChevronLeft size={20} className="rotate-180" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
