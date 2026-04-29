import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  LogOut,
  LogIn,
  X,
  ShieldCheck,
  GitBranchPlus,
  FileEdit, // Import ikon tambahan untuk manajemen soal
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userData = JSON.parse(localStorage.getItem("userData")) || {
    name: "User",
    email: "user@example.com",
    role: "user", // Default role
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    toast.success("Berhasil keluar");
    setIsOpen(false);
    navigate("/");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside
      className={`
      w-[260px] border-r border-slate-200 bg-white fixed h-full flex flex-col justify-between py-6 z-50 transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
      <div className="overflow-y-auto no-scrollbar">
        {/* Logo & Close Button */}
        <div className="px-6 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Gudang Soal
              </h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                by @matrohmatmath
              </p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Navigation */}
        <div className="px-6 mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Main Menu
          </p>
          <nav className="space-y-1">
            {[
              {
                icon: <LayoutDashboard size={18} />,
                label: "Dashboard",
                path: "/",
              },
              {
                icon: <BookOpen size={18} />,
                label: "Question Bank",
                path: "/bank-soal",
              },
              {
                icon: <FileText size={18} />,
                label: "Mock Exams",
                path: "/ujian",
                soon: true,
              },
              {
                icon: <Bookmark size={18} />,
                label: "My Bookmarks",
                path: "/bookmarks",
                soon: true,
              },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.soon ? "#" : item.path}
                onClick={() => !item.soon && setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive && !item.soon
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                      : "text-slate-500 hover:bg-slate-50"
                  }
                  ${item.soon ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.soon && (
                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase border">
                    Soon
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Admin Navigation - Hanya muncul jika role === 'admin' */}
        {userData.role === "admin" && (
          <div className="px-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={14} className="text-red-500" />
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em]">
                Admin Panel
              </p>
            </div>
            <nav className="space-y-1">
              {[
                {
                  icon: <GitBranchPlus size={18} />,
                  label: "Hierarchy Management",
                  path: "/admin/hierarchy",
                },
                {
                  icon: <FileEdit size={18} />,
                  label: "Question Bank Admin",
                  path: "/admin/questions",
                },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                    }
                  `}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Profil Section */}
      <div className="px-4 mt-auto">
        <div className="pt-4 border-t border-slate-100">
          {isLoggedIn ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2 mb-2 overflow-hidden">
                <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {getInitials(userData.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {userData.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-slate-400 truncate">
                      {userData.email}
                    </p>
                    {userData.role === "admin" && (
                      <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Keluar Akun</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              <LogIn size={20} />
              <span className="font-bold text-sm">Masuk Akun</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
