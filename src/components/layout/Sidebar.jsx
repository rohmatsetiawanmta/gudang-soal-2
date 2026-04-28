import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  LogOut,
  LogIn,
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();

  // Mengambil data user dari localStorage
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userData = JSON.parse(localStorage.getItem("userData")) || {
    name: "User",
    email: "user@example.com",
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    toast.success("Berhasil keluar");
    navigate("/");
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/" },
    {
      icon: <BookOpen size={20} />,
      label: "Question Bank",
      path: "/bank-soal",
      isComingSoon: false,
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

  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="w-[260px] border-r border-slate-200 bg-white fixed h-full flex flex-col justify-between py-6">
      <div>
        {/* Logo Section */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Gudang Soal Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Gudang Soal
            </h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
              by @matrohmatmath
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

      <div className="px-4">
        {/* Bagian XP telah dihapus sesuai permintaan */}

        <div className="pt-4 border-t border-slate-100">
          {isLoggedIn ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                  {getInitials(userData.name)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {userData.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {userData.email}
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
