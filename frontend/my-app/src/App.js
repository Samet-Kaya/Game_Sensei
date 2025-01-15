import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./pages/menu"; // Menü bileşeni
import Register from "./pages/register"; // Kayıt bileşeni
import Login from "./pages/login"; // Giriş bileşeni
import GameList from "./pages/game"; // Oyun detay bileşeni
import AdminPage from "./pages/adminpage"; // Oyun detay bileşeni
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Anasayfa yönlendirme */}
        <Route path="/" element={<Navigate to="/menu" />} />

        {/* Menü sayfası */}
        <Route path="/menu" element={<Menu />} />

        {/* Kayıt ol sayfası */}
        <Route path="/register" element={<Register />} />

        {/* Giriş yap sayfası */}
        <Route path="/login" element={<Login />} />
        
        <Route path="/adminpage" element={<AdminPage />} />

        {/* Oyun detay sayfası */}
        <Route path="/game/:name" element={<GameList />} />
      </Routes>
    </Router>
  );
};

export default App;
