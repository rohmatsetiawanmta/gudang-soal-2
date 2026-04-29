import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Trophy,
  Layers,
  LayoutGrid,
  Loader2,
  Search,
} from "lucide-react";

const BankSoal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [direction, setDirection] = useState(1);

  // State untuk menyimpan nama asli kategori agar breadcrumb rapi
  const [history, setHistory] = useState([]);

  const pathSegments = params["*"]
    ? params["*"].split("/").filter(Boolean)
    : [];

  const fetchCategories = async () => {
    setLoading(true);
    const lastSlug = pathSegments[pathSegments.length - 1] || "";

    try {
      // Kita panggil tanpa parameter role agar backend otomatis
      // menjalankan filter is_published = 1 (default user logic)
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_categories&slug=${lastSlug}`
      );
      const result = await response.json();

      if (result.status === "success") {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // Reset history jika kembali ke root
    if (pathSegments.length === 0) setHistory([]);
  }, [params["*"]]);

  const handleSelect = (item) => {
    setDirection(1);
    setHistory([...history, item]);
    const nextPath =
      pathSegments.length > 0
        ? `${pathSegments.join("/")}/${item.slug}`
        : item.slug;
    navigate(`/bank-soal/${nextPath}`);
  };

  const handleJump = (index) => {
    setDirection(-1);
    if (index === -1) {
      setHistory([]);
      navigate("/bank-soal");
    } else {
      const newHistory = history.slice(0, index + 1);
      setHistory(newHistory);
      const jumpPath = newHistory.map((h) => h.slug).join("/");
      navigate(`/bank-soal/${jumpPath}`);
    }
  };

  // Ganti komponen Breadcrumbs lama dengan ini
  const Breadcrumbs = () => (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-2 py-2">
      <button
        onClick={() => handleJump(-1)}
        className={`text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full transition-all shrink-0 ${
          pathSegments.length === 0
            ? "bg-blue-600 text-white"
            : "bg-white border border-slate-100 text-slate-400"
        }`}
      >
        Bank Soal
      </button>

      {history.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <button
            onClick={() => handleJump(i)}
            className={`text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full transition-all ${
              i === history.length - 1
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-100 text-slate-400"
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10">
      {/* Header & Navigasi */}
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center gap-4">
          {pathSegments.length > 0 && (
            <button
              onClick={() => handleJump(history.length - 2)}
              className="p-2 bg-white border border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize">
            {history.length === 0
              ? "Pilih Mode Belajar"
              : history[history.length - 1].name}
          </h2>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={params["*"] || "root"}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-5 md:p-6 bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.type === "type" ? (
                          item.slug === "soal-sekolah" ? (
                            <GraduationCap size={22} />
                          ) : (
                            <Trophy size={22} />
                          )
                        ) : (
                          <LayoutGrid size={18} />
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-800 mb-1 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-auto pt-2">
                        Eksplorasi &rarr;
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                pathSegments.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers size={32} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">
                      Materi Siap Dikerjakan
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm max-w-xs mx-auto">
                      Kumpulan soal untuk kategori ini sudah tersedia di server.
                    </p>
                    <div className="pt-4">
                      <button className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                        Buka Daftar Soal
                      </button>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default BankSoal;
