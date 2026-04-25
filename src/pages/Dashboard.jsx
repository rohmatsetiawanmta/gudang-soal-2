import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Trophy,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const Dashboard = () => {
  const stats = [
    {
      label: "Soal Terjawab",
      value: "1,284",
      icon: <Target className="text-blue-600" />,
      trend: "+12% minggu ini",
    },
    {
      label: "Akurasi",
      value: "85%",
      icon: <Trophy className="text-orange-500" />,
      trend: "+2% dari bulan lalu",
    },
    {
      label: "Streak",
      value: "12 Hari",
      icon: <Zap className="text-yellow-500" />,
      trend: "Personal Best!",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header Section */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">
            Halo, Rohmat! 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Siap untuk mengasah logika hari ini?
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Clock size={16} />
          <span>Sesi belajar: 45 Menit</span>
        </div>
      </header>

      {/* Daily Challenge Section - Ala Referensi MathBank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-2xl shadow-blue-200"
      >
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              <SparklesIcon /> Tantangan Harian
            </div>
            <h3 className="text-3xl font-bold leading-tight">
              Selesaikan Soal Integral <br /> & Dapatkan +50 XP
            </h3>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <p className="text-blue-100 mb-3 text-sm italic">
                Hitunglah nilai dari:
              </p>
              <div className="text-2xl font-serif">
                <BlockMath math="\int_{0}^{\pi} \sin(x) \, dx" />
              </div>
            </div>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors group">
              Mulai Tantangan
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          {/* Dekorasi Visual di Sisi Kanan */}
          <div className="hidden md:flex justify-center">
            <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                <Target size={80} className="text-white/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Background Abstract Shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-slate-500">
                {stat.label}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <h4 className="text-3xl font-bold text-slate-800">
                {stat.value}
              </h4>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                {stat.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default Dashboard;
