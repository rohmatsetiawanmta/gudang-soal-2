import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Share2,
  Bookmark,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  SendHorizontal,
  RefreshCcw,
} from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import toast from "react-hot-toast";

const DetailSoal = () => {
  const { questionCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [soal, setSoal] = useState(null);
  const [imageLibrary, setImageLibrary] = useState([]);

  // State Interaktif dengan Sistem Kesempatan[cite: 5, 7]
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0); // Melacak jumlah percobaan
  const [isSubmitted, setIsSubmitted] = useState(false); // Pembahasan muncul jika true
  const [isCorrect, setIsCorrect] = useState(null);
  const maxAttempts = 3;

  const renderContent = (text, isDark = false) => {
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
          className={`font-medium leading-relaxed ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
        />
      );
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const imgRes = await fetch(
        "https://gudangsoal.com/api/images.php?action=get_images"
      );
      const imgData = await imgRes.json();
      if (imgData.status === "success") setImageLibrary(imgData.data);

      const res = await fetch(
        `https://gudangsoal.com/api/questions.php?action=get_all_questions`
      );
      const result = await res.json();
      if (result.status === "success") {
        const found = result.data.find((q) => q.question_code === questionCode);
        if (found) {
          if (typeof found.options === "string")
            found.options = JSON.parse(found.options);
          setSoal(found);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [questionCode]);

  const handleSubmit = () => {
    if (!userAnswer) return toast.error("Pilih atau isi jawaban dulu!");

    const correct =
      userAnswer.trim().toUpperCase() ===
      soal.correct_answer.trim().toUpperCase();
    const newAttemptCount = attempts + 1;
    setAttempts(newAttemptCount);

    if (correct) {
      setIsCorrect(true);
      setIsSubmitted(true); // Langsung munculkan pembahasan jika benar
      toast.success("Luar Biasa! Jawaban Kamu Benar.", { icon: "🎉" });
    } else {
      if (newAttemptCount >= maxAttempts) {
        setIsCorrect(false);
        setIsSubmitted(true); // Munculkan pembahasan jika sudah 3 kali salah
        toast.error("Kesempatan habis. Mari pelajari pembahasannya.");
      } else {
        setIsCorrect(false);
        toast.error(
          `Jawaban kurang tepat. Sisa ${
            maxAttempts - newAttemptCount
          } kesempatan!`,
          { icon: "⚠️" }
        );
        // Jangan set isSubmitted agar panel pembahasan belum muncul[cite: 7]
      }
    }
  };

  const handleReset = () => {
    setUserAnswer("");
    setAttempts(0);
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Header Navigasi */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Mode Latihan
          </div>
          <div className="flex gap-1">
            {[...Array(maxAttempts)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-1 rounded-full ${
                  i < attempts
                    ? isCorrect && i === attempts - 1
                      ? "bg-green-500"
                      : "bg-red-400"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm">
            <Bookmark size={20} />
          </button>
          <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 shadow-sm">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* KIRI: PANEL SOAL */}
        <div className="flex-1 bg-white border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase tracking-[0.2em]">
                #{soal.question_code}
              </span>
              <span
                className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border ${
                  soal.difficulty === "hard"
                    ? "text-red-500 border-red-100 bg-red-50"
                    : soal.difficulty === "medium"
                    ? "text-orange-500 border-orange-100 bg-orange-50"
                    : "text-green-500 border-green-100 bg-green-50"
                }`}
              >
                {soal.difficulty}
              </span>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Percobaan: {attempts}/{maxAttempts}
            </div>
          </div>

          <div className="text-[14px] font-bold text-slate-800 leading-relaxed">
            {renderContent(soal.question_text)}
          </div>

          <div className="space-y-3 pt-4">
            {soal.question_type === "multiple_choice" ? (
              ["A", "B", "C", "D", "E"].map(
                (opt) =>
                  soal.options[opt.toLowerCase()] && (
                    <button
                      key={opt}
                      disabled={isSubmitted}
                      onClick={() => setUserAnswer(opt)}
                      className={`w-full flex items-start gap-4 p-4 rounded-[20px] border text-left transition-all ${
                        userAnswer === opt
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                          : "bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-[10px] font-black ${
                          userAnswer === opt
                            ? "bg-white text-blue-600"
                            : "bg-white border border-slate-200 text-slate-400"
                        }`}
                      >
                        {opt}
                      </div>
                      <div className="text-[14px] font-bold pt-1.5">
                        {renderContent(soal.options[opt.toLowerCase()])}
                      </div>
                    </button>
                  )
              )
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Jawaban Kamu:
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ketik jawaban..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all uppercase text-[14px]"
                />
              </div>
            )}
          </div>

          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <SendHorizontal size={16} /> Submit Jawaban
            </button>
          )}
        </div>

        {/* KANAN: PANEL PEMBAHASAN */}
        <div className="flex-1 flex flex-col gap-6">
          {isSubmitted ? (
            <div className="flex-1 bg-slate-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl animate-in slide-in-from-right-10 duration-700 relative overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-lg text-blue-400">
                    <Info size={16} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Hasil & Pembahasan
                  </h4>
                </div>
                {isCorrect ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                    <CheckCircle2 size={14} />{" "}
                    <span className="text-[9px] font-black uppercase">
                      Berhasil
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                    <XCircle size={14} />{" "}
                    <span className="text-[9px] font-black uppercase">
                      Gagal
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Kunci Jawaban:
                  </p>
                  <div className="text-2xl font-black text-slate-100 uppercase">
                    {soal.correct_answer}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    Analisis Solusi:
                  </p>
                  <div className="text-[14px] leading-relaxed text-slate-300 font-medium">
                    {renderContent(soal.explanation, true)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-8 w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={14} /> Coba Kerjakan Lagi
              </button>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-100 border-dashed rounded-[32px] flex flex-col items-center justify-center p-12 text-center text-slate-300 gap-6 opacity-60">
              <div className="relative">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Loader2 className="animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                  {maxAttempts - attempts}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Menunggu Jawaban Kamu
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Kamu punya {maxAttempts} kesempatan untuk mencoba
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailSoal;
