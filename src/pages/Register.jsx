import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Check, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const navigate = useNavigate();

  // Objek validasi untuk checklist
  const passwordCriteria = [
    { label: "Minimal 8 karakter", met: formData.password.length >= 8 },
    {
      label: "Huruf besar & kecil",
      met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
    },
    { label: "Minimal satu angka", met: /[0-9]/.test(formData.password) },
  ];

  const isPasswordValid = passwordCriteria.every((c) => c.met);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Pastikan semua kriteria password terpenuhi ya!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://gudangsoal.com/api/login.php?action=register",
        { ...formData, origin: window.location.origin }
      );

      if (response.data.status === "success") {
        toast.success("Registrasi berhasil! Silakan cek email.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4">
            <Sparkles size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Akun</h1>
          <p className="text-slate-400 text-sm">
            Bergabung dengan ekosistem Gudang Soal
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Nama Lengkap
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                size={20}
              />
              <input
                type="text"
                placeholder="John Doe"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                size={20}
              />
              <input
                type="email"
                placeholder="nama@email.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                size={20}
              />
              <input
                type="password"
                placeholder="••••••••"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                required
              />
            </div>

            {/* Checklist Dinamis */}
            <AnimatePresence>
              {isPasswordFocused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-2 py-2 ml-1">
                    {passwordCriteria.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className={`p-0.5 rounded-full ${
                            item.met
                              ? "bg-green-100 text-green-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {item.met ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <X size={12} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-medium transition-colors ${
                            item.met ? "text-green-600" : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Daftar Sekarang"
              )}
              <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Masuk
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
