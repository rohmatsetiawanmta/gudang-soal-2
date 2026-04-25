import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Bookmarks from "./pages/Bookmarks";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        {/* Route lainnya tetap Soon */}
        <Route path="/bank-soal" element={<div>Soon</div>} />
        <Route path="/ujian" element={<div>Soon</div>} />
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Route>
    </Routes>
  );
}

export default App;
