import { useState } from "react";
import { Outlet } from "react-router-dom"; // WAJIB DIIMPORT
import Sidebar from "../components/layout/Sidebar";
import { Menu, X } from "lucide-react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[260px] min-h-screen transition-all duration-300">
        {/* Mobile Header (Hanya muncul di mobile) */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-slate-800">Gudang Soal</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* TEMPAT KONTEN HALAMAN MUNCUL 
            Gunakan Outlet agar router tahu di mana harus merender children
        */}
        <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
