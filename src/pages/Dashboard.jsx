import { motion } from "framer-motion";
import {
  Search,
  PlayCircle,
  BookOpen,
  Flame,
  ChevronRight,
  History,
  Star,
  Binary,
  Shapes,
  Rocket,
  Compass,
  Monitor,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const Dashboard = () => {
  // Mengambil data user dari localStorage agar sinkron dengan login
  const userData = JSON.parse(localStorage.getItem("userData")) || {
    name: "User",
  };

  const learningPaths = [
    {
      title: "UTBK Kuantitatif",
      desc: "12 Topik • 240 Soal",
      icon: <Binary className="text-orange-600" />,
      color: "bg-orange-50",
    },
    {
      title: "OSN Informatika",
      desc: "8 Topik • 150 Soal",
      icon: <Monitor className="text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "Logika Dasar",
      desc: "5 Topik • 80 Soal",
      icon: <Shapes className="text-emerald-600" />,
      color: "bg-emerald-50",
    },
    {
      title: "Fisika Mekanika",
      desc: "10 Topik • 180 Soal",
      icon: <Rocket className="text-rose-600" />,
      color: "bg-rose-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Section Greeting & Pencarian */}
      <section className="relative py-6">
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Halo, {userData.name.split(" ")[0]}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Pilih modul latihan untuk memulai sesi belajar hari ini.
            </p>
          </div>

          <div className="relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari topik, rumus, atau kode soal..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: Aktivitas Utama */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card Lanjutkan Belajar */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <PlayCircle size={28} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  Lanjutkan Terakhir
                </span>
                <h4 className="text-lg font-bold text-slate-800">
                  Persiapan OSN: Aljabar Linear
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-3/5 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    60% selesai
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>

          {/* Section Jalur Belajar */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Compass size={20} className="text-blue-600" /> Jalur Belajar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learningPaths.map((path, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-3xl ${path.color} border border-transparent hover:border-white hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm text-blue-600">
                    {path.icon}
                  </div>
                  <h5 className="font-bold text-slate-800">{path.title}</h5>
                  <p className="text-xs text-slate-500 mb-4">{path.desc}</p>
                  <button className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-wider flex items-center gap-1">
                    Buka Modul <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Statistik & Informasi */}
        <div className="space-y-6">
          {/* Card Statistik Performa */}
          <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Performa Belajar
                </span>
                <Flame className="text-orange-500" size={18} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold tracking-tighter">12</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                    Hari Streak
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tighter">85%</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                    Akurasi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Log Aktivitas Terbaru */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <History size={16} className="text-slate-400" /> Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Menyelesaikan 15 soal pada modul <b>Kalkulus Dasar</b>
                    </p>
                    <span className="text-[9px] text-slate-400">
                      2 jam yang lalu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Video YouTube */}
          <div className="bg-white border-2 border-red-50 rounded-[24px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-red-500 fill-red-500" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                Video Terbaru
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm leading-snug mb-3">
              Trik Cepat Soal Kecukupan Data UTBK 2026
            </h4>
            <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2">
              Tonton di YouTube
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
