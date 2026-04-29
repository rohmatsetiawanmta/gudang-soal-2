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
  GitBranchPlus,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";

const QuestionManagement = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    question_type: "multiple_choice",
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
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=get_questions&category_id=${categoryId}&role=admin`
      );
      const result = await response.json();
      if (result.status === "success") {
        setQuestions(result.data);
        if (result.data.length > 0 && !selectedQuestion) {
          setSelectedQuestion(result.data[0]);
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data soal");
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
      }
    } catch (error) {
      toast.error("Gagal menyimpan data");
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
          newStatus ? "Soal dipublikasikan" : "Soal disimpan ke Draft"
        );
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus soal ini secara permanen?"))
      return;
    try {
      await fetch(
        `https://gudangsoal.com/api/questions.php?action=delete_question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      toast.success("Soal berhasil dihapus");
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error("Gagal menghapus soal");
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
    <div className="h-[calc(100vh-140px)] flex flex-col gap-5 overflow-hidden">
      {/* HEADER: KONSISTEN DENGAN HIERARCHY MANAGEMENT */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-red-500" /> Question Bank
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola daftar soal untuk Subtopic #{categoryId}.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} /> Tambah Soal
        </button>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* PANEL KIRI: LIST COMPACT */}
        <div className="w-72 bg-white rounded-[32px] border border-slate-100 flex flex-col overflow-hidden shrink-0 shadow-sm">
          <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="CARI KODE..."
              className="bg-transparent text-[10px] outline-none w-full font-black tracking-widest text-slate-600 placeholder:text-slate-300 uppercase"
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all border ${
                  selectedQuestion?.id === q.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${
                    selectedQuestion?.id === q.id
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span
                    className={`text-[10px] font-black tracking-widest uppercase ${
                      selectedQuestion?.id === q.id
                        ? "text-blue-100"
                        : "text-blue-600"
                    }`}
                  >
                    #{q.question_code}
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase truncate w-28 text-left ${
                      selectedQuestion?.id === q.id
                        ? "text-blue-200"
                        : "text-slate-400"
                    }`}
                  >
                    {q.question_type === "short_answer" ? "ISIAN" : "PILGAN"} •{" "}
                    {q.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PANEL KANAN: DETAIL DATA ELEGAN */}
        <div className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-y-auto no-scrollbar relative bg-gradient-to-b from-white to-slate-50/30">
          {selectedQuestion ? (
            <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* 1. TOP BAR: Status & Actions */}
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      #{selectedQuestion.question_code}
                    </span>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${
                        selectedQuestion.difficulty === "hard"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : selectedQuestion.difficulty === "medium"
                          ? "bg-orange-50 text-orange-600 border-orange-100"
                          : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => togglePublished(selectedQuestion)}
                    className={`text-[8px] font-black px-3 py-1.5 rounded-lg border transition-all ${
                      selectedQuestion.is_published == 1
                        ? "bg-white text-blue-600 border-white shadow-sm"
                        : "text-slate-400 border-transparent"
                    }`}
                  >
                    {selectedQuestion.is_published == 1 ? "LIVE" : "DRAFT"}
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200" />
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

              {/* 2. QUESTION AREA */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                  Question Description
                </h4>
                <div
                  className="text-lg font-bold text-slate-800 leading-relaxed px-1"
                  dangerouslySetInnerHTML={{
                    __html: selectedQuestion.question_text,
                  }}
                />
              </div>

              {/* 3. ANSWER AREA */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">
                  Correct Answer Key
                </h4>

                {selectedQuestion.question_type === "short_answer" ? (
                  <div className="p-5 bg-white border border-green-100 rounded-[20px] shadow-sm flex flex-col gap-1">
                    <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">
                      Exact Text Answer
                    </span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">
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
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {key}
                            </span>
                            <span
                              className={`text-[13px] font-bold ${
                                selectedQuestion.correct_answer ===
                                key.toUpperCase()
                                  ? "text-slate-800"
                                  : "text-slate-500"
                              }`}
                            >
                              {selectedQuestion.options[key]}
                            </span>
                            {selectedQuestion.correct_answer ===
                              key.toUpperCase() && (
                              <div className="ml-auto text-blue-600">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>

              {/* 4. EXPLANATION */}
              {selectedQuestion.explanation && (
                <div className="pt-6">
                  <div className="bg-slate-900 rounded-[24px] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-200">
                    <h4 className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                      <AlertCircle size={12} className="text-blue-400" />{" "}
                      Resolution Analysis
                    </h4>
                    <div
                      className="text-[13px] leading-relaxed font-medium text-slate-200"
                      dangerouslySetInnerHTML={{
                        __html: selectedQuestion.explanation,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <Database size={40} className="opacity-10" />
              <p className="font-black text-[9px] tracking-[0.4em] uppercase text-slate-400">
                Select entry for inspection
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-800">
                {editingQuestion ? "Edit Soal" : "Tambah Soal"}
              </h3>
              <button
                onClick={closeModal}
                className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 overflow-y-auto no-scrollbar space-y-6"
            >
              <div className="flex gap-3">
                {["multiple_choice", "short_answer"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, question_type: type })
                    }
                    className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${
                      formData.question_type === type
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-transparent text-slate-400"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Teks Pertanyaan
                </label>
                <textarea
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[28px] min-h-[100px] outline-none focus:border-blue-500 font-bold text-sm"
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                  required
                />
              </div>

              {formData.question_type === "multiple_choice" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {["a", "b", "c", "d", "e"].map((opt) => (
                      <div key={opt} className="flex gap-3 items-center">
                        <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase text-[10px] shrink-0">
                          {opt}
                        </span>
                        <input
                          type="text"
                          className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold"
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
                  <div className="flex gap-2 pt-2">
                    {["A", "B", "C", "D", "E"].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correct_answer: key })
                        }
                        className={`flex-1 py-4 rounded-2xl font-black text-xs border-2 ${
                          formData.correct_answer === key
                            ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-100"
                            : "bg-slate-50 border-transparent text-slate-400"
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Kunci Jawaban Eksak
                  </label>
                  <input
                    type="text"
                    className="w-full p-5 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-black text-blue-600"
                    value={formData.correct_answer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correct_answer: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest"
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
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                  value={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.value })
                  }
                >
                  <option value={0}>Draft</option>
                  <option value={1}>Public</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Simpan Data
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
