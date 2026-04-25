import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
// Import halaman-halaman
import Dashboard from "./pages/Dashboard";
import Bookmarks from "./pages/Bookmarks";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bank-soal" element={<div>Halaman Bank Soal</div>} />
        <Route path="/ujian" element={<div>Halaman Persiapan Ujian</div>} />
        {/* Route baru untuk Bookmarks */}
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Route>

      {/* Route tanpa Sidebar */}
      <Route path="/login" element={<div>Halaman Login</div>} />
    </Routes>
  );
}

export default App;
