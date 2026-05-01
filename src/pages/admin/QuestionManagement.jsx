import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Database,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const QuestionManagement = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState(null);

  const [formData, setFormData] = useState({
    question_type: "multiple_choice",
    question_text: "",
    options: { a: "", b: "", c: "", d: "", e: "" },
    correct_answer: "A",
    explanation: "",
    difficulty: "medium",
    is_published: 0,
  });

  /**
   * Helper: Render LaTeX and Basic HTML
   * Menggunakan font-normal dan text-sm untuk konsistensi pratinjau.
   */
  const renderTextWithMath = (text) => {
    if (!text) return "";
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <BlockMath key={i} math={part.slice(2, -2)} />;
      } else if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={i} math={part.slice(1, -1)} />;
      }
      return (
        <span
          key={i}
          className="font-normal"
          dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, "<br/>") }}
        />
      );
    });
  };

  const fetchCategoryDetail = async () => {
    if (!categoryId) {
      setCategoryDetail(null);
      return;
    }
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_category_path&id=${categoryId}`
      );
      const result = await response.json();
      if (result.status === "success") {
        setCategoryDetail(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail kategori");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `https://gudangsoal.com/api/questions.php?action=get_questions&category_id=${categoryId}&role=admin`
        : `https://gudangsoal.com/api/questions.php?action=get_all_questions&role=admin`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success") {
        setQuestions(result.data);
        if (result.data.length > 0 && !selectedQuestion)
          setSelectedQuestion(result.data[0]);
      }
    } catch (error) {
      toast.error("Gagal ambil data soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategoryDetail();
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
      }
    } catch (error) {
      toast.error("Gagal simpan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus soal ini secara permanen?")) return;
    try {
      await fetch(
        `https://gudangsoal.com/api/questions.php?action=delete_question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      toast.success("Dihapus");
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setFormData({
      question_type: "multiple_choice",
      question_text: "",
      options: { a: "", b: "", c: "", d: "", e: "" },
      correct_answer: "A",
      explanation: "",
      difficulty: "medium",
      is_published: 0,
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
      {/* HEADER DINAMIS */}
      <div className="flex items-center justify-between bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText size={20} className="text-red-500" />
              {categoryId
                ? categoryDetail?.name || "Loading..."
                : "All Repositories"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {categoryId ? (
                <>
                  {categoryDetail?.path?.map((step, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      {step}{" "}
                      <ChevronRight size={10} className="text-slate-400" />
                    </span>
                  ))}
                  <span className="text-blue-600">{categoryDetail.name}</span>
                </>
              ) : (
                <span className="text-slate-300 italic italic">
                  Global view of all registered questions
                </span>
              )}
            </div>
          </div>
        </div>
        {categoryId && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2"
          >
            <Plus size={14} /> Add Entry
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* PANEL KIRI: LIST SOAL */}
        <div className="w-64 bg-white rounded-[24px] border border-slate-100 flex flex-col overflow-hidden shrink-0 shadow-sm">
          <div className="p-3 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
            <Search size={12} className="text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH CODE..."
              className="bg-transparent text-[9px] outline-none w-full font-black tracking-[0.1em] text-slate-600 placeholder:text-slate-300 uppercase"
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {questions.length > 0 ? (
              questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuestion(q)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all border ${
                    selectedQuestion?.id === q.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-100"
                      : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 ${
                      selectedQuestion?.id === q.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span
                      className={`text-[9px] font-black tracking-widest uppercase ${
                        selectedQuestion?.id === q.id
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      #{q.question_code}
                    </span>
                    <span className="text-[8px] font-bold uppercase truncate w-32 text-left opacity-60">
                      {q.question_type === "short_answer" ? "SHORT" : "MCQ"} •{" "}
                      {q.difficulty}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                No Data
              </div>
            )}
          </div>
        </div>

        {/* PANEL KANAN: PRATINJAU DETAIL */}
        <div className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-y-auto no-scrollbar relative bg-gradient-to-b from-white to-slate-50/30">
          {selectedQuestion ? (
            <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Shortcut Kategori di Mode Global */}
              {!categoryId && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                      Linked Category
                    </span>
                    <span className="text-[11px] font-bold text-blue-900 uppercase">
                      Contextual Repository View
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigate(
                        `/admin/questions/${selectedQuestion.category_id}`
                      )
                    }
                    className="flex items-center gap-2 bg-white text-blue-600 px-3 py-2 rounded-xl text-[9px] font-black border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <ExternalLink size={10} /> MANAGE CATEGORY
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Question Id
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      #{selectedQuestion.question_code}
                    </span>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                        selectedQuestion.difficulty === "hard"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => {
                      setEditingQuestion(selectedQuestion);
                      setFormData(selectedQuestion);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedQuestion.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Question
                </h4>
                <div className="text-sm font-normal text-slate-800 leading-relaxed px-1">
                  {renderTextWithMath(selectedQuestion.question_text)}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Answer
                </h4>
                {selectedQuestion.question_type === "short_answer" ? (
                  <div className="p-5 bg-white border border-green-100 rounded-[20px] shadow-sm flex flex-col gap-1">
                    <span className="text-sm font-normal text-slate-800 tracking-tight">
                      {selectedQuestion.correct_answer}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {["a", "b", "c", "d", "e"].map(
                      (key) =>
                        selectedQuestion.options?.[key] && (
                          <div
                            key={key}
                            className={`flex items-center gap-4 p-3.5 rounded-[18px] border transition-all ${
                              selectedQuestion.correct_answer ===
                              key.toUpperCase()
                                ? "bg-white border-blue-200 shadow-md shadow-blue-50/50 ring-1 ring-blue-50"
                                : "bg-white border-slate-50 opacity-50"
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] uppercase shrink-0 ${
                                selectedQuestion.correct_answer ===
                                key.toUpperCase()
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                  : "bg-slate-50 text-slate-400"
                              }`}
                            >
                              {key}
                            </span>
                            <span className="text-sm font-normal text-slate-800">
                              {renderTextWithMath(
                                selectedQuestion.options[key]
                              )}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>

              {selectedQuestion.explanation && (
                <div className="pt-6">
                  <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                    <h4 className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">
                      Explanation
                    </h4>
                    <div className="text-sm leading-relaxed font-normal text-slate-200">
                      {renderTextWithMath(selectedQuestion.explanation)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 uppercase font-black text-[9px] tracking-widest opacity-20">
              <Database size={40} /> Select entry
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800">
                {editingQuestion ? "Edit Existing" : "New Registry"} Entry
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-lg text-slate-400 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto no-scrollbar space-y-5"
            >
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                {["multiple_choice", "short_answer"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, question_type: t })
                    }
                    className={`flex-1 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
                      formData.question_type === t
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">
                  Body (Supports <b>Bold</b> & $LaTeX$)
                </label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl min-h-[80px] outline-none font-bold text-xs focus:border-blue-500 transition-all"
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  required
                />
              </div>
              {formData.question_type === "multiple_choice" ? (
                <div className="space-y-2">
                  {["a", "b", "c", "d", "e"].map((opt) => (
                    <div key={opt} className="flex gap-2 items-center group">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black uppercase text-[9px] shrink-0 transition-all ${
                          formData.correct_answer === opt.toUpperCase()
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {opt}
                      </span>
                      <input
                        type="text"
                        className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold focus:border-blue-500 transition-all"
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
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            correct_answer: opt.toUpperCase(),
                          })
                        }
                        className={`p-2 transition-all ${
                          formData.correct_answer === opt.toUpperCase()
                            ? "text-blue-600"
                            : "text-slate-200 hover:text-slate-400"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="w-full p-4 bg-blue-50 border border-blue-100 rounded-xl font-black text-blue-600 text-xs shadow-inner"
                  value={formData.correct_answer}
                  onChange={(e) =>
                    setFormData({ ...formData, correct_answer: e.target.value })
                  }
                  placeholder="EXACT KEY ANSWER..."
                  required
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-[9px] uppercase tracking-widest outline-none cursor-pointer"
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-[9px] uppercase tracking-widest outline-none cursor-pointer"
                  value={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.value })
                  }
                >
                  <option value={0}>Draft</option>
                  <option value={1}>Public</option>
                </select>
              </div>
              <textarea
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl min-h-[60px] outline-none text-xs font-medium focus:border-blue-500 transition-all"
                placeholder="EXPLANATION..."
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-100 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}{" "}
                Persist Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
