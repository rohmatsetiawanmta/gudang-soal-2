import { useState, useEffect } from "react";
import {
  GitBranchPlus,
  ChevronRight,
  Plus,
  FolderTree,
  Save,
  Loader2,
  Trash2,
  Edit3,
  X,
  Eye,
  EyeOff,
  Globe,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const HierarchyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [path, setPath] = useState([]); // Untuk melacak posisi saat ini
  const [editingItem, setEditingItem] = useState(null); // Menyimpan item yang sedang diedit

  const [formData, setFormData] = useState({
    name: "",
    type: "level",
    parent_id: null,
  });

  const fetchCategories = async (parentId = null) => {
    setLoading(true);
    try {
      const url = `https://gudangsoal.com/api/categories.php?action=get_categories${
        parentId ? `&parent_id=${parentId}` : ""
      }`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success") setCategories(result.data);
    } catch (error) {
      toast.error("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUpdate = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://gudangsoal.com/api/categories.php?action=update_category",
        {
          method: "POST",
          body: JSON.stringify(editingItem),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success(result.message);
        setEditingItem(null); // Keluar dari mode edit
        fetchCategories(formData.parent_id); // Refresh data
      }
    } catch (error) {
      toast.error("Gagal memperbarui");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "https://gudangsoal.com/api/categories.php?action=add_category",
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success(result.message);
        setFormData({ ...formData, name: "" });
        fetchCategories(formData.parent_id);
      }
    } catch (error) {
      toast.error("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const enterCategory = (cat) => {
    setPath([...path, cat]);
    setFormData({ ...formData, parent_id: cat.id });
    fetchCategories(cat.id);
  };

  const goBack = (index) => {
    if (index === -1) {
      setPath([]);
      setFormData({ ...formData, parent_id: null });
      fetchCategories(null);
    } else {
      const newPath = path.slice(0, index + 1);
      const lastItem = newPath[newPath.length - 1];
      setPath(newPath);
      setFormData({ ...formData, parent_id: lastItem.id });
      fetchCategories(lastItem.id);
    }
  };

  const togglePublished = async (cat) => {
    const newStatus = cat.is_published == 1 ? 0 : 1;

    // Optimistic Update: Update UI dulu supaya terasa instan
    const updatedCategories = categories.map((item) =>
      item.id === cat.id ? { ...item, is_published: newStatus } : item
    );
    setCategories(updatedCategories);

    try {
      const response = await fetch(
        "https://gudangsoal.com/api/categories.php?action=update_category",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            is_published: newStatus,
          }),
        }
      );

      const result = await response.json();
      if (result.status !== "success") {
        // Jika gagal, balikin ke status semula
        fetchCategories(formData.parent_id);
        toast.error("Gagal memperbarui status");
      } else {
        toast.success(
          `${cat.name} ${newStatus ? "dipublikasikan" : "disembunyikan"}`
        );
      }
    } catch (error) {
      fetchCategories(formData.parent_id);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GitBranchPlus className="text-red-500" /> Hierarchy Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Kelola struktur parent-child untuk bank soal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM TAMBAH */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Plus size={18} className="text-blue-600" /> Tambah Item
            </h3>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: SMA, Matematika, dll"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tipe
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm"
              >
                <option value="type">Type (Root)</option>
                <option value="level">Level</option>
                <option value="class_series">Class/Series</option>
                <option value="subject">Subject</option>
                <option value="topic">Topic</option>
                <option value="subtopic">Subtopic</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Simpan Kategori
              </button>
            </div>
          </form>
        </div>

        {/* BROWSER HIERARKI */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap items-center gap-2">
            <button
              onClick={() => goBack(-1)}
              className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-full text-slate-500"
            >
              Root
            </button>
            {path.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <ChevronRight size={14} className="text-slate-300" />
                <button
                  onClick={() => goBack(i)}
                  className="text-[10px] font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full"
                >
                  {p.name}
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left">
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">
                      Nama
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">
                      Tipe
                    </th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* KOLOM NAMA */}
                        <td className="px-6 py-4">
                          {editingItem?.id === cat.id ? (
                            <input
                              type="text"
                              className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              value={editingItem.name}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <span className="font-bold text-slate-700">
                              {cat.name}
                            </span>
                          )}
                        </td>

                        {/* KOLOM TIPE */}
                        <td className="px-6 py-4">
                          {editingItem?.id === cat.id ? (
                            <select
                              className="px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-[10px] font-bold uppercase outline-none"
                              value={editingItem.type}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  type: e.target.value,
                                })
                              }
                            >
                              <option value="type">Type</option>
                              <option value="level">Level</option>
                              <option value="class_series">Class/Series</option>
                              <option value="subject">Subject</option>
                              <option value="topic">Topic</option>
                              <option value="subtopic">Subtopic</option>
                            </select>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded-md text-slate-500 uppercase">
                              {cat.type}
                            </span>
                          )}
                        </td>

                        {/* KOLOM STATUS PUBLISH (TOGGLE SAKELAR) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePublished(cat)}
                              disabled={loading}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                cat.is_published == 1
                                  ? "bg-blue-600"
                                  : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  cat.is_published == 1
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                cat.is_published == 1
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {cat.is_published == 1 ? "Public" : "Draft"}
                            </span>
                          </div>
                        </td>

                        {/* KOLOM AKSI */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {editingItem?.id === cat.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(cat.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Simpan"
                                >
                                  <Save size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
                                  title="Batal"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingItem(cat)}
                                  className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                  title="Edit Info"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => enterCategory(cat)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Masuk Level"
                                >
                                  <FolderTree size={18} />
                                </button>
                                <button
                                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-10 text-center text-slate-400 italic"
                      >
                        Belum ada sub-kategori di level ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyManagement;
