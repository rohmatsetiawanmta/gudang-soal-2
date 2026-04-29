import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const QuestionManagement = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    question_text: "",
    options: { a: "", b: "", c: "", d: "", e: "" },
    correct_answer: "A",
    explanation: "",
    difficulty: "medium",
    is_published: 0,
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Mengirim role=admin agar bisa melihat yang statusnya Draft
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=get_questions&category_id=${categoryId}&role=admin`
      );
      const result = await response.json();
      if (result.status === "success") {
        setQuestions(result.data);
      }
    } catch (error) {
      toast.error("Gagal memuat daftar soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const action = editingQuestion ? "update_question" : "add_question";

    try {
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            id: editingQuestion?.id,
            category_id: categoryId,
          }),
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        toast.success(result.message);
        closeModal();
        fetchQuestions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (q) => {
    const newStatus = q.is_published == 1 ? 0 : 1;
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=update_question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...q, is_published: newStatus }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success(
          newStatus ? "Soal dipublikasikan" : "Soal ditarik ke Draft"
        );
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Gagal mengubah status publikasi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus soal ini secara permanen?"))
      return;
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=delete_question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Soal berhasil dihapus");
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Gagal menghapus soal");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setFormData({
      question_text: "",
      options: { a: "", b: "", c: "", d: "", e: "" },
      correct_answer: "A",
      explanation: "",
      difficulty: "medium",
      is_published: 0,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Question Bank
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
              Kategori: {categoryId}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Tambah Soal
        </button>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {loading && questions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-medium">Menghubungkan ke gudang data...</p>
          </div>
        ) : questions.length > 0 ? (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group"
            >
              <div className="flex gap-6">
                {/* Number & Status */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300 text-lg">
                    {idx + 1}
                  </div>
                  <button
                    onClick={() => togglePublished(q)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      q.is_published == 1 ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                        q.is_published == 1 ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Question Content */}
                <div className="flex-1 space-y-5">
                  <div className="flex justify-between items-start">
                    <div
                      className="text-slate-700 font-bold leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: q.question_text }}
                    />
                    <span
                      className={`text-[10px] px-2 py-1 rounded-md font-black uppercase border ${
                        q.difficulty === "hard"
                          ? "border-red-100 text-red-500 bg-red-50"
                          : q.difficulty === "medium"
                          ? "border-orange-100 text-orange-500 bg-orange-50"
                          : "border-green-100 text-green-500 bg-green-50"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["a", "b", "c", "d", "e"].map((key) => (
                      <div
                        key={key}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          q.correct_answer === key.toUpperCase()
                            ? "bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-100"
                            : "bg-white border-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] uppercase shrink-0 ${
                            q.correct_answer === key.toUpperCase()
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {key}
                        </span>
                        <span className="font-medium text-sm">
                          {q.options?.[key] || "-"}
                        </span>
                        {q.correct_answer === key.toUpperCase() && (
                          <CheckCircle2
                            size={16}
                            className="ml-auto text-blue-600"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> Pembahasan Soal
                      </p>
                      <div
                        className="text-slate-600 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setFormData(q);
                      setIsModalOpen(true);
                    }}
                    className="p-3 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-3 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Belum ada soal tersedia.</p>
            <p className="text-xs">
              Klik "Tambah Soal" untuk mengisi bank soal ini.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-black text-xl text-slate-800">
                  {editingQuestion ? "Sunting Soal" : "Buat Soal Baru"}
                </h3>
                <p className="text-xs text-slate-400 font-medium italic">
                  Pastikan data yang diinput sudah akurat.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 overflow-y-auto no-scrollbar space-y-8"
            >
              {/* Question Text */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Pertanyaan Utana
                </label>
                <textarea
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] min-h-[120px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Tuliskan pertanyaan di sini..."
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  required
                />
              </div>

              {/* Options Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Pilihan Jawaban (Multiple Choice)
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {["a", "b", "c", "d", "e"].map((opt) => (
                    <div key={opt} className="flex gap-4 items-center group">
                      <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase shrink-0 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
                        {opt}
                      </span>
                      <input
                        type="text"
                        placeholder={`Isi pilihan ${opt.toUpperCase()}...`}
                        className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                        value={formData.options[opt]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            options: {
                              ...formData.options,
                              [opt]: e.target.value,
                            },
                          })
                        }
                        required={opt !== "e"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    Kunci Jawaban
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-blue-600 appearance-none cursor-pointer"
                    value={formData.correct_answer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correct_answer: e.target.value,
                      })
                    }
                  >
                    {["A", "B", "C", "D", "E"].map((v) => (
                      <option key={v} value={v}>
                        Pilihan {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold appearance-none cursor-pointer"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">Easy (Mudah)</option>
                    <option value="medium">Medium (Sedang)</option>
                    <option value="hard">Hard (Sulit)</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Penjelasan / Pembahasan
                </label>
                <textarea
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] min-h-[100px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  placeholder="Berikan langkah-langkah penyelesaian..."
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <Save size={24} />
                  )}
                  {editingQuestion ? "Simpan Perubahan" : "Publikasikan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
