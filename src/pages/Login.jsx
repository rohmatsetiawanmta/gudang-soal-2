import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://gudangsoal.com/api/login.php?action=login",
        { email, password }
      );

      if (response.data.status === "success") {
        const user = response.data.user;

        // Cek status verifikasi berdasarkan kolom verification_status di DB
        if (user.verification_status === "unverified") {
          toast.error("Email kamu belum diverifikasi. Silakan cek inbox!");
          setIsLoading(false);
          return;
        }

        // Simpan data lengkap (termasuk role, xp, dan status verifikasi)
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(user));

        toast.success(`Selamat datang kembali, ${user.name}!`);
        navigate("/");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Gagal terhubung ke server API";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-xl shadow-blue-50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
              <Sparkles size={32} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Masuk Akun</h1>
            <p className="text-slate-400 text-sm mt-1">
              Gudang Soal Pro Learning
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Masuk Sekarang"
              )}
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-8">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:underline"
            >
              Daftar Gratis
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
