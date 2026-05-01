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
  FileText,
  Database,
} from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const BankSoal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]); // State baru untuk list soal
  const [imageLibrary, setImageLibrary] = useState([]); // Library gambar untuk parsing[cite: 6]
  const [direction, setDirection] = useState(1);
  const [history, setHistory] = useState([]);

  const pathSegments = params["*"]
    ? params["*"].split("/").filter(Boolean)
    : [];

  /**
   * Helper: Render Content dengan LaTeX & Image Shortcode[cite: 6]
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
              className="h-auto rounded-2xl shadow-sm border border-slate-100 p-2 bg-white"
              alt={slug}
            />
          </div>
        ) : null;
      }
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
        />
      );
    });
  };

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

  const fetchCategories = async () => {
    setLoading(true);
    setQuestions([]); // Reset soal setiap navigasi
    const lastSlug = pathSegments[pathSegments.length - 1] || "";

    try {
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_categories&slug=${lastSlug}`
      );
      const result = await response.json();

      if (result.status === "success") {
        setCategories(result.data);
        // JIKA KATEGORI KOSONG: Artinya ini level subtopik (ujung hierarki)[cite: 6]
        if (result.data.length === 0 && history.length > 0) {
          const currentId = history[history.length - 1].id;
          fetchQuestions(currentId);
        }
      }
    } catch (error) {
      console.error("Gagal muat kategori:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchImageLibrary();
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
      navigate(`/bank-soal/${newHistory.map((h) => h.slug).join("/")}`);
    }
  };

  const Breadcrumbs = () => (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-2 py-2">
      <button
        onClick={() => handleJump(-1)}
        className={`text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full transition-all ${
          pathSegments.length === 0
            ? "bg-blue-600 text-white"
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
              {/* TAMPILAN KATEGORI (Folder) */}
              {categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-5 md:p-6 bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all group flex flex-col"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {item.type === "type" ? (
                          <GraduationCap size={22} />
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
              )}

              {/* TAMPILAN LIST SOAL (Ujung Hierarki) */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                          #{q.question_code}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ml-auto ${
                            q.difficulty === "hard"
                              ? "text-red-500 bg-red-50"
                              : "text-green-500 bg-green-50"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="text-slate-800 text-sm leading-relaxed mb-6">
                        {renderContent(q.question_text)}
                      </div>
                      {/* Opsi Jawaban (Jika MCQ) */}
                      {q.question_type === "multiple_choice" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {["a", "b", "c", "d", "e"].map(
                            (opt) =>
                              q.options[opt] && (
                                <div
                                  key={opt}
                                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
                                >
                                  <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    {opt}
                                  </span>
                                  <div className="text-[13px] text-slate-700">
                                    {renderContent(q.options[opt])}
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* EMPTY STATE */}
              {!loading &&
                categories.length === 0 &&
                questions.length === 0 &&
                pathSegments.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Database size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                      Belum Ada Konten
                    </h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Database untuk sub-topik ini sedang diperbarui oleh tim
                      admin.
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
