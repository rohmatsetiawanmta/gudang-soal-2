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
} from "lucide-react";

const BankSoal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [direction, setDirection] = useState(1);

  // State history untuk menyimpan objek lengkap {id, name, slug}
  const [history, setHistory] = useState([]);

  // Mengambil segmen path dari URL
  const pathSegments = params["*"]
    ? params["*"].split("/").filter(Boolean)
    : [];

  const fetchCategories = async () => {
    setLoading(true);
    // Ambil slug terakhir dari URL untuk dikirim ke API
    const lastSlug = pathSegments[pathSegments.length - 1] || "";

    try {
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

  // Setiap kali URL berubah, jalankan fetch
  useEffect(() => {
    fetchCategories();

    // Sinkronisasi history: Jika URL kosong, reset history
    if (pathSegments.length === 0) {
      setHistory([]);
    }
  }, [params["*"]]);

  const handleSelect = (item) => {
    setDirection(1);
    // Tambahkan item ke history
    const newHistory = [...history, item];
    setHistory(newHistory);

    // Update URL berdasarkan slug yang ada di history
    const nextPath = newHistory.map((h) => h.slug).join("/");
    navigate(`/bank-soal/${nextPath}`);
  };

  const handleJump = (index) => {
    setDirection(-1);
    if (index === -1) {
      // Kembali ke Root
      setHistory([]);
      navigate("/bank-soal");
    } else {
      // Potong history sampai index yang diklik
      const newHistory = history.slice(0, index + 1);
      setHistory(newHistory);
      const jumpPath = newHistory.map((h) => h.slug).join("/");
      navigate(`/bank-soal/${jumpPath}`);
    }
  };

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      <button
        onClick={() => handleJump(-1)}
        className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all shrink-0 ${
          history.length === 0
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        }`}
      >
        Bank Soal
      </button>

      {history.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 shrink-0">
          <ChevronRight size={14} className="text-slate-300" />
          <button
            onClick={() => handleJump(i)}
            className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all ${
              i === history.length - 1
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 30 : -30, opacity: 0 }),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center gap-4">
          {history.length > 0 && (
            <button
              onClick={() => handleJump(history.length - 2)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-800">
            {history.length === 0
              ? "Pilih Mode Belajar"
              : history[history.length - 1].name}
          </h2>
        </div>
      </div>

      <div className="relative min-h-[400px]">
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
              transition={{ duration: 0.3 }}
            >
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-6 bg-white border border-slate-100 rounded-[32px] text-left hover:border-blue-500 hover:shadow-xl transition-all group"
                    >
                      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.type === "type" ? (
                          item.slug === "soal-sekolah" ? (
                            <GraduationCap size={24} />
                          ) : (
                            <Trophy size={24} />
                          )
                        ) : (
                          <LayoutGrid size={20} />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Eksplorasi &rarr;
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                history.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center">
                    <Layers size={48} className="mx-auto mb-4 text-blue-600" />
                    <h3 className="text-xl font-bold">
                      Materi Siap Dikerjakan
                    </h3>
                    <button className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">
                      Buka Daftar Soal
                    </button>
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
