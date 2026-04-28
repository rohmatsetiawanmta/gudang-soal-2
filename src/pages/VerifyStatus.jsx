import { useSearchParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight, Sparkles } from "lucide-react";

const VerifyStatus = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const time = searchParams.get("t");
  const ticket = searchParams.get("k");

  // Daftar status yang kita izinkan
  const allowedStatus = ["success", "expired", "invalid", "error"];

  // Logika validasi akses
  const isValidRequest = () => {
    // 1. Jika URL cuma /verify (tanpa param) atau statusnya gak dikenal -> TENDANG
    if (!status || !allowedStatus.includes(status)) {
      return false;
    }

    // 2. Jika statusnya success, tapi gak bawa tiket (t & k) -> TENDANG
    if (status === "success" && (!time || !ticket)) {
      return false;
    }

    return true;
  };

  // Jalankan proteksi
  if (!isValidRequest()) {
    return <Navigate to="/login" replace />;
  }

  const isSuccess = status === "success";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-slate-100 text-center"
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
            isSuccess
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-red-50 text-red-500"
          }`}
        >
          {isSuccess ? <Sparkles size={40} /> : <XCircle size={40} />}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          {isSuccess ? "Verifikasi Berhasil" : "Verifikasi Gagal"}
        </h1>

        <p className="text-slate-500 mb-10 leading-relaxed text-sm">
          {isSuccess
            ? "Identitas Anda telah terkonfirmasi. Akun Anda kini aktif dan siap digunakan untuk mengakses ekosistem Gudang Soal secara penuh."
            : status === "expired"
            ? "Tautan verifikasi sudah kadaluwarsa karena sudah pernah digunakan atau terlalu lama."
            : "Tautan tidak valid. Silakan coba mendaftar ulang melalui halaman registrasi."}
        </p>

        <Link
          to="/login"
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
            isSuccess
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isSuccess ? "Masuk ke Dashboard" : "Kembali ke Login"}
          <ArrowRight size={20} />
        </Link>
      </motion.div>
    </div>
  );
};

export default VerifyStatus;
