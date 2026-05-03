import { useState, useEffect, useCallback } from "react";
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
  Database,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const BankSoal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [imageLibrary, setImageLibrary] = useState([]);
  const [direction, setDirection] = useState(1);

  // History menyimpan objek lengkap {id, name, slug} untuk navigasi akurat
  const [history, setHistory] = useState([]);

  const pathSegments = params["*"]
    ? params["*"].split("/").filter(Boolean)
    : [];

  /**
   * Helper: Render Content dengan LaTeX & Image Shortcode
   */
  const renderContent = (text) => {
    if (!text) return "";
    const parts = text.split(
      /(\$\$.*?\$\$|\$.*?\$|\[IMG-[A-Z0-9]{8}(?:\|\d+)?\])/g
    );

    return parts.map((part, i) => {
      if (part.startsWith("$$") && part.endsWith("$$"))
        return <BlockMath key={i} math={part.slice(2, -2)} />;
      if (part.startsWith("$") && part.endsWith("$"))
        return <InlineMath key={i} math={part.slice(1, -1)} />;

      const imgMatch = part.match(/\[IMG-([A-Z0-9]{8})(?:\|(\d+))?\]/);
      if (imgMatch) {
        const slug = `IMG-${imgMatch[1]}`;
        const size = imgMatch[2];
        const imageData = imageLibrary.find((img) => img.slug === slug);
        return imageData ? (
          <div key={i} className="my-4 flex justify-center">
            <img
              src={imageData.url}
              style={{ width: size ? `${size}px` : "auto", maxWidth: "100%" }}
              className="rounded-2xl shadow-sm border border-slate-100 p-2 bg-white"
              alt={slug}
            />
          </div>
        ) : null;
      }
      return (
        <span
          key={i}
          className="text-[14px]"
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
        />
      );
    });
  };

  /**
   * Fetch Soal berdasarkan Category ID
   */
  const fetchQuestions = async (catId) => {
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=get_questions&category_id=${catId}`
      );
      const result = await response.json();
      if (result.status === "success") setQuestions(result.data);
    } catch (error) {
      console.error("Gagal muat soal");
    }
  };

  /**
   * Fetch Kategori berdasarkan Parent ID
   */
  const fetchCategories = useCallback(
    async (parentId) => {
      if (loading) return;
      setLoading(true);
      setQuestions([]);

      const currentParentId = parentId || "root";

      try {
        const response = await fetch(
          `https://gudangsoal.com/api/categories.php?action=get_categories&parent_id=${currentParentId}`
        );
        const result = await response.json();

        if (result.status === "success") {
          setCategories(result.data);
          // Jika tidak ada sub-kategori, ambil daftar soal
          if (result.data.length === 0 && parentId) {
            fetchQuestions(parentId);
          }
        }
      } catch (error) {
        console.error("Gagal muat kategori:", error);
      } finally {
        setLoading(false);
      }
    },
    [history.length]
  ); // Hanya reload jika jumlah history berubah[cite: 2]

  // Effect 1: Inisialisasi Library Gambar (Cukup Sekali)[cite: 2]
  useEffect(() => {
    const fetchImageLibrary = async () => {
      try {
        const response = await fetch(
          "https://gudangsoal.com/api/images.php?action=get_images"
        );
        const result = await response.json();
        if (result.status === "success") setImageLibrary(result.data);
      } catch (error) {
        console.error("Gagal muat gambar");
      }
    };
    fetchImageLibrary();
  }, []);

  // Effect 2: Trigger Fetch Kategori saat History berubah[cite: 2]
  useEffect(() => {
    const lastCategory = history[history.length - 1];
    fetchCategories(lastCategory?.id);

    // Reset history jika user kembali ke root secara manual[cite: 2]
    if (pathSegments.length === 0 && history.length > 0) {
      setHistory([]);
    }
  }, [history.length, fetchCategories]);

  const handleSelect = (item) => {
    setDirection(1);
    setHistory((prev) => [...prev, item]); // Functional update untuk stabilitas[cite: 2]

    const nextPath =
      history.length > 0
        ? `${history.map((h) => h.slug).join("/")}/${item.slug}`
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

  const Breadcrumbs = () => (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-2 py-2">
      <button
        onClick={() => handleJump(-1)}
        className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
          pathSegments.length === 0
            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
            : "bg-white border border-slate-100 text-slate-400"
        }`}
      >
        Bank Soal
      </button>
      {history.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-slate-300" />
          <button
            onClick={() => handleJump(i)}
            className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${
              i === history.length - 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
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
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10 px-4">
      {/* Header Area */}
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex items-center gap-4">
          {pathSegments.length > 0 && (
            <button
              onClick={() => handleJump(history.length - 2)}
              className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
            {history.length === 0
              ? "Pilih Mode Belajar"
              : history[history.length - 1].name}
          </h2>
        </div>
      </div>

      {/* Main Content View */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={
                history.length === 0 ? "root" : history[history.length - 1].id
              }
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Folder View */}
              {categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-6 bg-white border border-slate-100 rounded-[32px] text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group flex flex-col min-h-[180px]"
                    >
                      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.type === "type" ? (
                          <GraduationCap size={24} />
                        ) : (
                          <LayoutGrid size={20} />
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight uppercase tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mt-auto pt-4 group-hover:text-blue-600 transition-colors">
                        Eksplorasi &rarr;
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Question List */}
              {questions.length > 0 && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/soal/${q.question_code}`)}
                      className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group animate-in fade-in"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          #{q.question_code}
                        </span>
                        <span
                          className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ml-auto border ${
                            q.difficulty === "hard"
                              ? "text-red-500 border-red-100 bg-red-50"
                              : q.difficulty === "medium"
                              ? "text-orange-500 border-orange-100 bg-orange-50"
                              : "text-green-500 border-green-100 bg-green-50"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium leading-relaxed mb-4">
                        {renderContent(q.question_text)}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                          {q.question_type.replace("_", " ")}
                        </span>
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading &&
                categories.length === 0 &&
                questions.length === 0 &&
                pathSegments.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-[40px] p-16 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Database size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                      Belum Ada Materi
                    </h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Konten untuk topik ini sedang disiapkan.
                    </p>
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default BankSoal;
