import { useState, useEffect, useCallback } from "react";
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
  FileText,
  Search,
  Database,
  ChevronRight,
  Eye,
  EyeOff,
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
  const [imageLibrary, setImageLibrary] = useState([]);

  // States untuk Cascading Selectors di Modal
  const [hierarchy, setHierarchy] = useState({
    type: [],
    level: [],
    series: [],
    subject: [],
    topic: [],
    subtopic: [],
  });

  const [selectedHierarchy, setSelectedHierarchy] = useState({
    type: "",
    level: "",
    series: "",
    subject: "",
    topic: "",
    subtopic: "",
  });

  const [formData, setFormData] = useState({
    question_type: "multiple_choice",
    question_text: "",
    options: { a: "" },
    correct_answer: "A",
    explanation: "",
    difficulty: "medium",
    is_published: 1,
    category_id: categoryId || "",
  });

  // Helper untuk fetch kategori berdasarkan parent_id
  const fetchLevelCategories = async (parentId, key) => {
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_categories&parent_id=${
          parentId || "root"
        }&role=admin`
      );
      const result = await response.json();
      if (result.status === "success") {
        setHierarchy((prev) => ({ ...prev, [key]: result.data }));
      }
    } catch (error) {
      console.error(`Error fetching ${key}`);
    }
  };

  // Fungsi penelusuran hierarki otomatis untuk mode EDIT
  const loadHierarchyForEdit = async (subtopicId) => {
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_category_path&id=${subtopicId}`
      );
      const result = await response.json();

      if (result.status === "success") {
        const path = result.data.full_path_objects; // Asumsi API mengembalikan array of objects
        const keys = [
          "type",
          "level",
          "series",
          "subject",
          "topic",
          "subtopic",
        ];
        const newSelected = {
          type: "",
          level: "",
          series: "",
          subject: "",
          topic: "",
          subtopic: "",
        };

        // Muat level pertama dulu
        await fetchLevelCategories(null, "type");

        for (let i = 0; i < path.length; i++) {
          const currentCat = path[i];
          const currentKey = keys[i];
          const nextKey = keys[i + 1];

          newSelected[currentKey] = currentCat.id;

          // Load opsi untuk level selanjutnya agar dropdown terisi
          if (nextKey) {
            await fetchLevelCategories(currentCat.id, nextKey);
          }
        }
        setSelectedHierarchy(newSelected);
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi kategori");
    }
  };

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
          <div key={i} className="flex justify-center group relative">
            <img
              src={imageData.url}
              alt={slug}
              style={{ width: size ? `${size}px` : "auto", maxWidth: "100%" }}
              className="h-auto rounded-xl p-2 bg-white"
            />
          </div>
        ) : (
          <span
            key={i}
            className="text-red-400 font-mono text-[10px] block my-2 p-2 border border-dashed border-red-200 rounded-lg text-center"
          >
            [Aset {slug} tidak ditemukan]
          </span>
        );
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

  const fetchImageLibrary = async () => {
    try {
      const response = await fetch(
        "https://gudangsoal.com/api/images.php?action=get_images"
      );
      const result = await response.json();
      if (result.status === "success") setImageLibrary(result.data);
    } catch (error) {
      console.error("Gagal ambil pustaka gambar");
    }
  };

  const fetchCategoryDetail = async () => {
    if (!categoryId) return;
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/categories.php?action=get_category_path&id=${categoryId}`
      );
      const result = await response.json();
      if (result.status === "success") setCategoryDetail(result.data);
    } catch (error) {
      console.error("Gagal ambil detail kategori");
    }
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `https://gudangsoal.com/api/questions.php?action=get_questions&category_id=${categoryId}&role=admin`
        : `https://gudangsoal.com/api/questions.php?action=get_all_questions&role=admin`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success") {
        const parsedData = result.data.map((q) => ({
          ...q,
          options:
            typeof q.options === "string"
              ? JSON.parse(q.options)
              : q.options || {},
        }));
        setQuestions(parsedData);
        if (parsedData.length > 0 && !selectedQuestion)
          setSelectedQuestion(parsedData[0]);
      }
    } catch (error) {
      toast.error("Gagal ambil data soal");
    } finally {
      setLoading(false);
    }
  }, [categoryId, selectedQuestion]);

  useEffect(() => {
    fetchQuestions();
    fetchCategoryDetail();
    fetchImageLibrary();
  }, [categoryId, fetchQuestions]);

  const handleHierarchyChange = (key, value, nextKey) => {
    setSelectedHierarchy((prev) => {
      const newState = { ...prev, [key]: value };
      const keys = Object.keys(hierarchy);
      const index = keys.indexOf(key);
      keys.slice(index + 1).forEach((k) => (newState[k] = ""));
      return newState;
    });

    if (nextKey && value) fetchLevelCategories(value, nextKey);
    setFormData((prev) => ({ ...prev, category_id: value }));
  };

  const addOption = () => {
    const currentKeys = Object.keys(formData.options);
    if (currentKeys.length >= 5) return toast.error("Maksimal 5 opsi");
    const nextChar = String.fromCharCode(97 + currentKeys.length);
    setFormData({
      ...formData,
      options: { ...formData.options, [nextChar]: "" },
    });
  };

  const removeOption = (key) => {
    if (Object.keys(formData.options).length <= 1)
      return toast.error("Minimal 1 opsi");
    const newOptions = { ...formData.options };
    delete newOptions[key];
    let newCorrect = formData.correct_answer;
    if (formData.correct_answer === key.toUpperCase()) newCorrect = "A";
    setFormData({
      ...formData,
      options: newOptions,
      correct_answer: newCorrect,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id) return toast.error("Pilih kategori");
    setLoading(true);
    const action = editingQuestion ? "update_question" : "add_question";
    try {
      const response = await fetch(
        `https://gudangsoal.com/api/questions.php?action=${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editingQuestion?.id }),
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
    if (!window.confirm("Hapus soal ini?")) return;
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
    setSelectedHierarchy({
      type: "",
      level: "",
      series: "",
      subject: "",
      topic: "",
      subtopic: "",
    });
    setFormData({
      question_type: "multiple_choice",
      question_text: "",
      options: { a: "" },
      correct_answer: "A",
      explanation: "",
      difficulty: "medium",
      is_published: 1,
      category_id: categoryId || "",
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {categoryId && (
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-red-500" />
              {categoryId ? categoryDetail?.name : "All Repositories"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {categoryId ? (
                <>
                  {categoryDetail?.path?.map((step, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      {step} <ChevronRight size={10} />
                    </span>
                  ))}
                  <span className="text-blue-600">{categoryDetail?.name}</span>
                </>
              ) : (
                <span className="text-slate-300 italic">
                  Global view of all questions
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!categoryId) await fetchLevelCategories(null, "type");
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl"
        >
          <Plus size={14} /> Add Entry
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* PANEL KIRI: LIST SOAL */}
        <div className="w-64 bg-white rounded-[24px] border border-slate-100 flex flex-col overflow-hidden shrink-0 shadow-sm">
          <div className="p-3 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
            <Search size={12} className="text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH CODE..."
              className="bg-transparent text-[9px] outline-none w-full font-black tracking-[0.1em] text-slate-600 uppercase"
            />
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all border ${
                  selectedQuestion?.id === q.id
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 ${
                    selectedQuestion?.id === q.id
                      ? "bg-white/20"
                      : "bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black tracking-widest uppercase">
                      #{q.question_code}
                    </span>
                    {q.is_published == 1 ? (
                      <Eye size={10} className="text-green-500" />
                    ) : (
                      <EyeOff size={10} className="text-slate-300" />
                    )}
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase ${
                      q.difficulty === "hard"
                        ? "text-red-400"
                        : q.difficulty === "medium"
                        ? "text-orange-400"
                        : "text-green-400"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* PANEL KANAN: PRATINJAU */}
        <div className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-y-auto no-scrollbar p-10 relative bg-gradient-to-b from-white to-slate-50/30">
          {selectedQuestion ? (
            <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    Question Id
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      #{selectedQuestion.question_code}
                    </span>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-md border uppercase ${
                        selectedQuestion.difficulty === "hard"
                          ? "bg-red-50 text-red-600"
                          : selectedQuestion.difficulty === "medium"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                  <button
                    onClick={async () => {
                      const formatted = {
                        ...selectedQuestion,
                        options:
                          typeof selectedQuestion.options === "string"
                            ? JSON.parse(selectedQuestion.options)
                            : selectedQuestion.options,
                      };
                      setEditingQuestion(formatted);
                      setFormData(formatted);
                      if (!categoryId)
                        await loadHierarchyForEdit(
                          selectedQuestion.category_id
                        );
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
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Question
                </h4>
                <div className="text-sm text-slate-800 leading-relaxed">
                  {renderContent(selectedQuestion.question_text)}
                </div>
              </div>
              <div className="space-y-4 pt-2">
                <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  Answer
                </h4>
                {selectedQuestion.question_type === "short_answer" ? (
                  <div className="p-5 bg-white border border-green-100 rounded-[20px] shadow-sm text-sm font-bold text-slate-800">
                    {selectedQuestion.correct_answer}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(selectedQuestion.options)
                      .sort()
                      .map((key) => (
                        <div
                          key={key}
                          className={`flex items-center gap-4 p-3.5 rounded-[18px] border ${
                            selectedQuestion.correct_answer ===
                            key.toUpperCase()
                              ? "border-blue-200 bg-blue-50/30"
                              : "border-slate-50 opacity-60"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] uppercase ${
                              selectedQuestion.correct_answer ===
                              key.toUpperCase()
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {key}
                          </span>
                          <div className="text-sm text-slate-800">
                            {renderContent(selectedQuestion.options[key])}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {selectedQuestion.explanation && (
                <div className="pt-6">
                  <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-slate-200">
                    <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-3">
                      Explanation
                    </h4>
                    <div className="text-sm leading-relaxed text-slate-200">
                      {renderContent(selectedQuestion.explanation)}
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
          <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-800">
                {editingQuestion ? "Edit" : "New"} Registry Entry
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
              {!categoryId && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="col-span-2 text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Hierarchy Path
                  </div>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.type}
                    onChange={(e) =>
                      handleHierarchyChange("type", e.target.value, "level")
                    }
                  >
                    <option value="">Select Type</option>
                    {hierarchy.type.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.level}
                    onChange={(e) =>
                      handleHierarchyChange("level", e.target.value, "series")
                    }
                  >
                    <option value="">Select Level</option>
                    {hierarchy.level.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.series}
                    onChange={(e) =>
                      handleHierarchyChange("series", e.target.value, "subject")
                    }
                  >
                    <option value="">Select Series</option>
                    {hierarchy.series.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.subject}
                    onChange={(e) =>
                      handleHierarchyChange("subject", e.target.value, "topic")
                    }
                  >
                    <option value="">Select Subject</option>
                    {hierarchy.subject.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.topic}
                    onChange={(e) =>
                      handleHierarchyChange("topic", e.target.value, "subtopic")
                    }
                  >
                    <option value="">Select Topic</option>
                    {hierarchy.topic.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none"
                    value={selectedHierarchy.subtopic}
                    onChange={(e) =>
                      handleHierarchyChange("subtopic", e.target.value, null)
                    }
                  >
                    <option value="">Select Subtopic</option>
                    {hierarchy.subtopic.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  Question
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
              {formData.question_type === "multiple_choice" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-[9px] font-black text-blue-600"
                    >
                      + Add Option
                    </button>
                  </div>
                  {Object.keys(formData.options)
                    .sort()
                    .map((opt) => (
                      <div
                        key={opt}
                        className="flex gap-2 items-center group animate-in slide-in-from-left-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              correct_answer: opt.toUpperCase(),
                            })
                          }
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black uppercase text-[9px] shrink-0 ${
                            formData.correct_answer === opt.toUpperCase()
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {opt}
                        </button>
                        <input
                          type="text"
                          className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold focus:border-blue-500"
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
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(opt)}
                          className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              {formData.question_type === "short_answer" && (
                <input
                  type="text"
                  className="w-full p-4 bg-blue-50 border border-blue-100 rounded-xl font-black text-blue-600 text-xs shadow-inner uppercase"
                  value={formData.correct_answer}
                  onChange={(e) =>
                    setFormData({ ...formData, correct_answer: e.target.value })
                  }
                  placeholder="KEY ANSWER..."
                  required
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">
                    Difficulty Level
                  </label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-[9px] uppercase tracking-widest outline-none"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">
                    Status
                  </label>
                  <select
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-[9px] uppercase tracking-widest outline-none"
                    value={formData.is_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_published: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={1}>Publish</option>
                    <option value={0}>Not Publish</option>
                  </select>
                </div>
              </div>
              <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">
                Explanation
              </label>
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
