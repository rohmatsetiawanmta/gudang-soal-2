import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
  Search,
  Copy,
  X,
  Database,
  AlertTriangle,
  Eye, // Ikon baru untuk Preview
} from "lucide-react";
import toast from "react-hot-toast";

const ImageManagement = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    name: "",
  }); // State Modal Preview
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const [formData, setFormData] = useState({ name: "" });

  const generateRandomSlug = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `IMG-${result}`;
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://gudangsoal.com/api/images.php?action=get_images"
      );
      const result = await response.json();
      if (result.status === "success") setImages(result.data);
    } catch (error) {
      toast.error("Gagal mengambil data aset");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const openModal = () => {
    setFormData({ name: "" });
    setSelectedFile(null);
    setUploadPreview(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (!formData.name) {
        setFormData({
          ...formData,
          name: file.name.split(".")[0].toUpperCase(),
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("PILIH FILE TERLEBIH DAHULU!");

    setLoading(true);
    const generatedSlug = generateRandomSlug();
    const data = new FormData();
    data.append("image", selectedFile);
    data.append("name", formData.name);
    data.append("slug", generatedSlug);

    try {
      const response = await fetch(
        "https://gudangsoal.com/api/images.php?action=add_image",
        {
          method: "POST",
          body: data,
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success(result.message);
        setIsModalOpen(false);
        fetchImages();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShortcode = (slug) => {
    navigator.clipboard.writeText(`[${slug}]`);
    toast.success(`CODE [${slug}] DISALIN`, {
      style: { fontSize: "10px", fontWeight: "900" },
    });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://gudangsoal.com/api/images.php?action=delete_image",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteModal.id }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Aset berhasil dihapus");
        setDeleteModal({ open: false, id: null, name: "" });
        fetchImages();
      }
    } catch (error) {
      toast.error("Gagal menghapus");
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(
    (img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden px-2 pb-6">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="text-red-500" /> Image Management
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Asset Library for{" "}
            <span className="text-blue-600">Contextual Questions</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="FILTER ASSETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-100 rounded-xl pl-11 pr-4 py-2.5 text-[10px] font-black tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-64 uppercase shadow-sm"
            />
          </div>
          <button
            onClick={openModal}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2 shrink-0"
          >
            <Plus size={14} /> Add Asset
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      <div className="flex-1 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-y-auto no-scrollbar relative bg-gradient-to-b from-white to-slate-50/30 p-8">
        {loading && images.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-50 mb-4 relative">
                  <img
                    src={img.url}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    alt={img.name}
                  />

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1 p-4">
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() =>
                          setPreviewModal({
                            open: true,
                            url: img.url,
                            name: img.name,
                          })
                        }
                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                      >
                        <Eye size={12} /> View
                      </button>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleCopyShortcode(img.slug)}
                        className="flex-1 py-2 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          id: img.id,
                          name: img.name,
                        })
                      }
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 px-1">
                  <p className="text-[10px] font-black text-slate-800 uppercase truncate tracking-tight">
                    {img.name}
                  </p>
                  <p className="text-[8px] font-bold text-blue-600 font-mono tracking-widest bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                    [{img.slug}]
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 uppercase font-black text-[10px] tracking-[0.3em] opacity-20">
            <Database size={48} />{" "}
            {searchQuery ? "No matching assets" : "Library is empty"}
          </div>
        )}
      </div>

      {/* MODAL: ADD ASSET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800">
                New Asset Registry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                  Asset Display Name
                </label>
                <input
                  type="text"
                  placeholder="EX: GRAFIK EKSPONEN..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs focus:border-blue-500 focus:bg-white transition-all uppercase"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">
                  Source File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer overflow-hidden shadow-inner"
                >
                  {uploadPreview ? (
                    <img
                      src={uploadPreview}
                      className="w-full h-full object-contain p-4"
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Select Image
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Persist Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE PREVIEW */}
      {previewModal.open && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() =>
                setPreviewModal({ open: false, url: "", name: "" })
              }
              className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            <div className="bg-white rounded-[32px] p-4 shadow-2xl overflow-hidden w-full">
              <img
                src={previewModal.url}
                alt={previewModal.name}
                className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
              />
              <div className="mt-4 px-2 pb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                  Asset Name
                </p>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {previewModal.name}
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">
              Hapus Aset?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-8">
              Anda akan menghapus{" "}
              <span className="font-bold text-slate-800">
                {deleteModal.name}
              </span>
              . Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ open: false, id: null, name: "" })
                }
                className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManagement;
