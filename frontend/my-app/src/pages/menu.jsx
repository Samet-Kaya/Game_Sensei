import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./style.css";


const Menu = () => {
  const [user, setUser] = useState(null); // Kullanıcı verileri
  const [games, setGames] = useState([]); // Oyun listesi
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi
  const [filteredGames, setFilteredGames] = useState([]); // Filtrelenmiş oyunlar
  const [error, setError] = useState(null); // Hata durumu
  const [loading, setLoading] = useState(true); // Yükleniyor durumu
  const [newAvatar, setNewAvatar] = useState(null); // Yeni avatar
  const [uploadMessage, setUploadMessage] = useState(""); // Fotoğraf yükleme mesajı
  const [categories, setCategories] = useState([]); // Kategori listesi
  const [selectedCategory, setSelectedCategory] = useState(null); // Seçilen kategori
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown açık mı

  useEffect(() => {
    // Kullanıcı durumu kontrolü
    const checkLoginStatus = () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    // Oyun verilerini çek
    const fetchGames = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/games?populate=background_image"
        );
        setGames(response.data.data || []); // Gelen veriyi state'e atıyoruz
        setFilteredGames(response.data.data || []); // İlk başta tüm oyunları göster
        setLoading(false); // Yükleme tamamlandı
      } catch (err) {
        console.error("API Hatası:", err);
        setError("Oyun verileri alınırken bir hata oluştu.");
        setLoading(false); // Yükleme tamamlandı
      }

    };
       // Kategori verilerini çek
    const fetchCategories = async () => {
      try {
        setCategories(["Macera", "Aksiyon", "Shooter", "Puzzle", "RPG"]); // Kategorileri sabitledik
      } catch (err) {
        console.error("Kategori yüklenirken hata:", err);
      }
    };

    checkLoginStatus();
    fetchGames();
    fetchCategories();
  }, []);
   // Dropdown açma/kapama
   const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategorySelect = (category) => {
  setSelectedCategory(category); // Seçilen kategoriyi güncelle
  setIsDropdownOpen(false); // Menü kapansın
  if (category) {
    const filtered = games.filter(
      (game) =>
        game.attributes &&
        game.attributes.genres &&
        game.attributes.genres.includes(category)
    );
    setFilteredGames(filtered);
  } else {
    setFilteredGames(games); // Kategori kaldırıldığında tüm oyunları göster
  }
};
  
  // Arama işlemi
  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase(); // Arama terimini küçük harfe çevir
    setSearchTerm(searchValue);

    if (searchValue.trim() === "") {
      setFilteredGames(games); // Arama kutusu boşsa tüm oyunları göster
    } else {
      const results = games.filter((game) =>
        game?.attributes?.name?.toLowerCase().includes(searchValue)
      );
      setFilteredGames(results); // Filtrelenmiş oyunları güncelle
    }
  };


  
  // Çıkış yap fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  // Avatar yükleme işlemi
  const handleAvatarUpload = async (e) => {
    e.preventDefault();

    if (!newAvatar) {
      setUploadMessage("Lütfen bir fotoğraf seçin.");
      return;
    }

    const jwtToken = localStorage.getItem("token");
    if (!jwtToken) {
      setUploadMessage("Token bulunamadı. Lütfen giriş yapın.");
      return;
    }

    const formData = new FormData();
    formData.append("files", newAvatar);

    try {
      // 1. Fotoğrafı Yükle
      const uploadResponse = await axios.post("http://localhost:1337/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        const uploadedImage = uploadResponse.data[0];
        const uploadedImageUrl = `http://localhost:1337${uploadedImage.url}`;

        console.log("Yüklenen Fotoğraf URL'si:", uploadedImageUrl);

        // 2. User Tablosunu Güncelle
        const updatedUserResponse = await axios.put(
          `http://localhost:1337/api/users/${user.id}`,
          { avatar: uploadedImageUrl }, // URL'yi kaydet
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        console.log("User tablosuna fotoğraf başarıyla kaydedildi.");

        // 3. Kullanıcı Verilerini Güncelle
        const updatedUser = updatedUserResponse.data;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        setUploadMessage("Profil fotoğrafınız başarıyla güncellendi.");
      } else {
        console.error("Fotoğraf yükleme başarısız:", uploadResponse);
        setUploadMessage("Fotoğraf yükleme başarısız oldu.");
      }
    } catch (err) {
      console.error("Fotoğraf yükleme sırasında hata oluştu:", err);
      setUploadMessage("Fotoğraf yüklenirken bir hata oluştu.");
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="menu-container">
      <header className="navbar">
        <h1>🎮 Oyun Platformu</h1>
        <nav>
          <ul className="nav-links">
            <li>
              <a href="/menu">Anasayfa</a>
            </li>
            <li>
            <div className="categories" onClick={toggleDropdown}>
                <h3>Kategoriler</h3>
                {isDropdownOpen && (
                  <ul className="category-dropdown">
                    <li
                      className={!selectedCategory ? "active-category" : ""}
                      onClick={() => handleCategorySelect(null)}
                    >
                      Tümü
                    </li>
                    {categories.map((category) => (
                      <li
                        key={category}
                        className={
                          selectedCategory === category ? "active-category" : ""
                        }
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
            <li>
              <input
                type="text"
                placeholder="Oyun Ara..."
                className="search-bar"
                id="search"
                name="search"
                value={searchTerm}
                onChange={handleSearchChange}
               />
            </li>
          </ul>
        </nav>
      </header>

      <aside className="sidebar">
        {user ? (
          <div className="user-info">
          <div className="profile-section">
            <img
              src={user.avatar || "/assets/default-avatar.jpg"}
              alt="Profil Fotoğrafı"
              className="profile-photo"
            />
            <h3 className="profile-username">Merhaba, {user.username}</h3>
          </div>
          <form onSubmit={handleAvatarUpload} className="avatar-upload-form">
            <label className="file-upload-label">
              <input
                type="file"
                onChange={(e) => setNewAvatar(e.target.files[0])}
                accept="image/*"
                className="file-input"
              />
              Dosya Seç
            </label>
            <button type="submit" className="form-button">
              Profil Fotoğrafı Yükle
            </button>
            <button onClick={handleLogout} className="logout-button">
            Çıkış Yap
          </button>
          </form>
          {uploadMessage && <p className="form-message">{uploadMessage}</p>}
        </div>
        ) : (
          <div className="guest-info">
            <h3>Hoş Geldiniz!</h3>
            <p>Lütfen giriş yapın veya kayıt olun.</p>
            <a href="/login" className="form-button">
              Giriş Yap
            </a>
            <a href="/register" className="form-button">
              Kayıt Ol
            </a>
          </div>
        )}
      </aside>

      <main className="main-content">
        <section id="games">
          <h2>Oyun Listesi</h2>
          {error ? (
            <p className="error-text">{error}</p>
          ) : filteredGames.length === 0 ? (
            <p>Aramanıza uygun oyun bulunamadı.</p>
          ) : (
            <div className="game-grid">
            {filteredGames.map((game) => {
              const attributes = game || {};
              const imageUrl = attributes.background_image?.formats?.large?.url
                ? `http://localhost:1337${attributes.background_image.formats.large.url}`
                : "/assets/default-image.jpg"; // Varsayılan görsel
          
                return (
                  <Link to={`/game/${game.name}`} key={game.id}>
                    <div
                      key={game.id}
                      className="game-card"
                      style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                    >
                      <img
                        src={imageUrl}
                        alt={attributes.name || "Oyun Görseli"}
                        className="game-image"
                      />
                      <h3>{attributes.name || "Oyun Adı Yok"}</h3>
                      <p className="gold-text">
                        <strong>Puan:</strong> {attributes.ratings || "Puanlanmamış"}
                      </p>
                    </div>
                  </Link>
                );
            })}
          </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Oyun Platformu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default Menu;
