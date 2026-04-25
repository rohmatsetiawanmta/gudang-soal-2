import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  Sparkles,
  LogOut,
  User,
  LogIn, // Import ikon LogIn
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  // Simulasi cek status login
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Hapus status login
    toast.success("Berhasil keluar");
    navigate("/"); // Arahkan ke homepage, bukan /login
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    {
      icon: <BookOpen size={20} />,
      label: "Question Bank",
      path: "/bank-soal",
      isComingSoon: true,
    },
    {
      icon: <FileText size={20} />,
      label: "Mock Exams",
      path: "/ujian",
      isComingSoon: true,
    },
    {
      icon: <Bookmark size={20} />,
      label: "My Bookmarks",
      path: "/bookmarks",
      isComingSoon: true,
    },
  ];

  return (
    <aside className="w-[260px] border-r border-slate-200 bg-white fixed h-full flex flex-col justify-between py-6">
      <div>
        {/* Logo Section */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Gudang Soal
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Pro Learning
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) =>
            item.isComingSoon ? (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed opacity-60 select-none"
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase border border-slate-200">
                  Soon
                </span>
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      <div className="px-4 space-y-4">
        {/* Progress Card cuma muncul kalau login */}
        {isLoggedIn && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800">Level 7</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-purple-600 font-bold">
                Pro
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                className="bg-purple-500 h-1.5 rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              350 / 500 XP to Level 8
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100">
          {isLoggedIn ? (
            /* Akun Section kalau sudah login */
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  RS
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    Rohmat Setiawan
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    admin@gmail.com
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
              >
                <LogOut
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="font-medium text-sm">Keluar Akun</span>
              </button>
            </div>
          ) : (
            /* Tombol Login kalau belum login */
            <button
              onClick={() => navigate("/login")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all group"
            >
              <LogIn
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
              <span className="font-bold text-sm">Masuk Akun</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
