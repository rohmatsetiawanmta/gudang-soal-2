import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Trophy,
  Search,
  Layers,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

const BankSoal = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 untuk forward, -1 untuk back
  const [selection, setSelection] = useState({
    type: null,
    level: null,
    classOrSeries: null,
    subject: null,
  });

  const options = {
    types: [
      {
        id: "Sekolah",
        label: "Soal Sekolah",
        icon: <GraduationCap size={24} />,
        desc: "Kurikulum Nasional",
      },
      {
        id: "Ujian",
        label: "Persiapan Ujian",
        icon: <Trophy size={24} />,
        desc: "OSN & UTBK",
      },
    ],
    levels: {
      Sekolah: ["SD", "SMP", "SMA"],
      Ujian: ["OSN", "UTBK"],
    },
    subjects: {
      SMA: ["Matematika", "Fisika", "Kimia", "Biologi"],
      UTBK: [
        "Pengetahuan Kuantitatif",
        "Penalaran Matematika",
        "Literasi Bahasa",
      ],
    },
  };

  const handleSelect = (key, value) => {
    setDirection(1);
    setSelection({ ...selection, [key]: value });
    setStep(step + 1);
  };

  const goBack = () => {
    setDirection(-1);
    if (step > 1) setStep(step - 1);
  };

  // Komponen Helper untuk Breadcrumb Minimalis
  const Breadcrumbs = () => {
    const stepsLabel = [
      selection.type || "Tipe",
      selection.level || (selection.type === "Sekolah" ? "Jenjang" : "Jenis"),
      selection.classOrSeries
        ? selection.classOrSeries.replace("Kelas ", "")
        : "Kategori",
      selection.subject || "Materi",
    ];

    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {stepsLabel.slice(0, step).map((label, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${
                i === step - 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {label}
            </span>
            {i < step - 1 && (
              <ChevronRight size={14} className="text-slate-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Navigation & Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button
              onClick={goBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 1 && "Pilih Mode Belajar"}
            {step === 2 &&
              (selection.type === "Sekolah"
                ? "Pilih Jenjang Sekolah"
                : "Pilih Kategori Ujian")}
            {step === 3 &&
              (selection.type === "Sekolah"
                ? "Pilih Tingkatan Kelas"
                : "Program Latihan")}
            {step >= 4 && (selection.subject || "Eksplorasi Materi")}
          </h2>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* STEP 1: PILIH TIPE */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {options.types.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect("type", t.id)}
                    className="p-8 bg-white border border-slate-100 rounded-[32px] text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all group"
                  >
                    <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {t.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {t.label}
                    </h3>
                    <p className="text-sm text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: JENJANG / JENIS UJIAN */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {options.levels[selection.type].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleSelect("level", l)}
                    className="p-6 bg-white border border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: KELAS / LATIHAN SOAL */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selection.type === "Sekolah" ? (
                  [10, 11, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        handleSelect(
                          "classOrSeries",
                          `Kelas ${num} ${selection.level}`
                        )
                      }
                      className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all"
                    >
                      <span className="font-bold text-slate-700">
                        Kelas {num} {selection.level}
                      </span>
                      <ArrowRight
                        size={18}
                        className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() =>
                      handleSelect(
                        "classOrSeries",
                        `Latihan Soal ${selection.level}`
                      )
                    }
                    className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={20} />
                      </div>
                      <span className="font-bold text-slate-700">
                        Latihan Soal {selection.level}
                      </span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1"
                    />
                  </button>
                )}
              </div>
            )}

            {/* STEP 4: MATA PELAJARAN / SUBTES */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Cari materi..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(options.subjects[selection.level] || ["Materi Umum"]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => handleSelect("subject", s)}
                        className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all group"
                      >
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <LayoutGrid size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">{s}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            Eksplorasi Topik &rarr;
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: HASIL / LIST SOAL */}
            {step > 4 && (
              <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Menyiapkan Koleksi Soal
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Sistem sedang memuat kumpulan soal terbaik untuk materi{" "}
                  <b>{selection.subject}</b>.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                  >
                    Mulai Pencarian Baru
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BankSoal;
