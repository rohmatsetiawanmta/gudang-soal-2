import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
