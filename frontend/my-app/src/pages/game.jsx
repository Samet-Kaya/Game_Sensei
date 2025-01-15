import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./style.css";

const AddComment = ({ gameName, user, onCommentAdded }) => {
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Yorum yapabilmek için giriş yapmalısınız.");
      return;
    }

    try {
      const jwtToken = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:1337/api/comments",
        {
          data: {
            content: comment,
            game: { name: gameName },
            users_permissions_user: user.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setMessage("Yorumunuz başarıyla eklendi.");
      setComment("");
      onCommentAdded(response.data.data);
    } catch (error) {
      console.error("Yorum ekleme sırasında hata:", error);
      setMessage("Yorum eklenirken bir hata oluştu.");
    }
  };

  return (
    <div>
      <h3>Yorum Yap</h3>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Yorumunuzu yazın..."
          required
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
};

const Comments = ({ gameName, user }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1337/api/comments?filters[game][name][$eq]=${gameName}&populate=users_permissions_user`
        );

        // Gelen yanıtı düzenle ve eksik veriler için varsayılan değerler belirle
        const formattedComments = response.data.data.map((comment) => ({
          id: comment.id,
          content: comment.attributes?.content || "Yorum içeriği yok",
          user: comment.attributes?.users_permissions_user?.data
            ? comment.attributes.users_permissions_user.data.attributes.username
            : "Bilinmeyen Kullanıcı",
        }));

        setComments(formattedComments);
      } catch (error) {
        console.error("Yorumlar yüklenirken bir hata oluştu:", error);
        setComments([]); // Hata durumunda boş liste döndür
      }
    };

    fetchComments();
  }, [gameName]);

  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [
      {
        id: newComment.id,
        content: newComment.attributes?.content || "Yorum içeriği yok",
        user: newComment.attributes?.users_permissions_user?.data
          ? newComment.attributes.users_permissions_user.data.attributes.username
          : "Bilinmeyen Kullanıcı",
      },
      ...prevComments,
    ]);
  };

  return (
    <div>
      <h3>Yorumlar</h3>
      {comments.length === 0 ? (
        <p>Henüz yorum yapılmamış.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.user}</strong>: {comment.content}
            </li>
          ))}
        </ul>
      )}
      <AddComment gameName={gameName} user={user} onCommentAdded={handleCommentAdded} />
    </div>
  );
};

const GameList = () => {
  const { name } = useParams();
  const [user, setUser] = useState(null); // Kullanıcı verileri
  const [games, setGames] = useState([]); // Oyun listesi
  const [error, setError] = useState(null); // Hata durumu
  const [loading, setLoading] = useState(true); // Yükleniyor durumu
  const [newAvatar, setNewAvatar] = useState(null); // Yeni avatar
  const [uploadMessage, setUploadMessage] = useState(""); // Fotoğraf yükleme mesajı

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
          `http://localhost:1337/api/games?filters[name][$eq]=${name}&populate=background_image`
        );
        setGames(response.data.data); // Gelen veriyi state'e atıyoruz
        setLoading(false); // Yükleme tamamlandı
      } catch (err) {
        console.error("API Hatası:", err);
        setError("Oyun verileri alınırken bir hata oluştu.");
        setLoading(false); // Yükleme tamamlandı
      }
    };

    checkLoginStatus();
    fetchGames();
  }, [name]);
  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  if (!games) {
    return <div className="error-text">Oyun bulunamadı.</div>;
  }


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
      const uploadResponse = await axios.post(
        "http://localhost:1337/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

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
            <ul className="user-stats">
            </ul>
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
        <section id="games2">
          {error ? (
            <p className="error-text">{error}</p>
          ) : games.length === 0 ? (
            <p>Henüz eklenmiş oyun yok.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {games.map((game) => {
                const attributes = game || {};
                const imageUrl = attributes.background_image?.formats?.large?.url
                  ? `http://localhost:1337${attributes.background_image.formats.large.url}`
                  : "/assets/default-image.jpg";

                return (
                  <li
                    key={game.id}
                    style={{
                      border: "1px solid #ccc",
                      margin: "20px",
                      padding: "15px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(114, 164, 28, 0.1)",
                    }}
                  >
                    <h2>{attributes.name || "Oyun Adı Yok"}</h2>
                    <img
                      src={imageUrl}
                      alt={attributes.name || "Oyun Görseli"}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                    <p>
                      <strong>Geliştirici:</strong> {attributes.developer || "Bilinmiyor"}
                    </p>
                    <p>
                      <strong>Platformlar:</strong> {attributes.platforms || "Bilinmiyor"}
                    </p>
                    <p>
                      <strong>Tür:</strong> {attributes.genres || "Bilinmiyor"}
                    </p>
                    <p>
                      <strong>Puan:</strong> {attributes.ratings || "Puanlanmamış"}
                    </p>
                    <p>
                      <strong>Açıklama:</strong> {attributes.description || "Açıklama yok"}
                    </p>
                     {/* Yorumlar ve Yorum Yap */}
                     <Comments gameName={attributes.name} user={user} />

                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Oyun Platformu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default GameList;