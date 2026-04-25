import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

const Bookmarks = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-800">My Bookmarks</h2>
        <p className="text-slate-500">
          Kumpulan soal-soal yang kamu simpan untuk dipelajari kembali.
        </p>
      </header>

      {/* Empty State Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"
      >
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
          <Bookmark size={32} />
        </div>
        <h3 className="text-slate-600 font-medium">
          Belum ada soal yang ditandai
        </h3>
        <p className="text-slate-400 text-sm">
          Klik ikon bookmark pada soal untuk menyimpannya di sini.
        </p>
      </motion.div>
    </div>
  );
};

export default Bookmarks;
