import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./admin.css";

const AdminPage = () => {
  const [currentUser, setCurrentUser] = useState(null); // Oturum açmış kullanıcı
  const [loadingProfile, setLoadingProfile] = useState(true); // Profil yükleme durumu
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "" });
  const [roles, setRoles] = useState([]); // Rolleri getirmek için state
  const [selectedGame, setSelectedGame] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [users, setUsers] = useState([]); // Kullanıcılar
  const [games, setGames] = useState([]); // Oyunlar
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [showUserList, setShowUserList] = useState(false); // Kullanıcı listesi görünürlüğü
  const [editingUser, setEditingUser] = useState(null); // Düzenlenen kullanıcı
  const [editedUser, setEditedUser] = useState({ username: "", email: "" }); // Form verileri
  const [showGameList, setShowGameList] = useState(false); // Oyun listesi görünürlüğü
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [gameDeveloper, setGameDeveloper] = useState("");
  const [gamePlatforms, setGamePlatforms] = useState("");
  const [gameGenres, setGameGenres] = useState("");
  const [gameRatings, setGameRatings] = useState("");
  const [gameWebsite, setGameWebsite] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gameImage, setGameImage] = useState(null);

  // Çıkış Yap fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Başarıyla çıkış yaptınız!");
    navigate("/login"); // Giriş sayfasına yönlendir
  };

  useEffect(() => {
    const checkAndFetchData = async () => {
      try {
        // Admin kontrolü
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || userData.role?.name !== "Admin") {
          navigate("/"); // Admin değilse anasayfaya yönlendir
          return; // Eğer kullanıcı admin değilse diğer işlemleri yapmayın
        }
  
        // Kullanıcı verilerini getir
        const jwtToken = localStorage.getItem("token");
        const usersResponse = await axios.get(
          "http://4.233.147.212:1337/api/users?populate=role",
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        setUsers(usersResponse.data);
  
        // Oyun verilerini getir
        const gamesResponse = await axios.get(
          "http://4.233.147.212:1337/api/games?populate=*",
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
  
        if (gamesResponse.data && gamesResponse.data.data) {
          setGames(gamesResponse.data.data);
        } else {
          setGames([]);
        }
      } catch (err) {
        console.error("Veriler çekilirken hata oluştu:", err);
        setError("Veriler alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
  
    const fetchRoles = async () => {
      try {
        const jwtToken = localStorage.getItem("token");
        const rolesResponse = await axios.get(
          "http://4.233.147.212:1337/api/users-permissions/roles",
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        setRoles(rolesResponse.data.roles);
      } catch (err) {
        console.error("Roller alınırken hata oluştu:", err);
      }
    };
  
    const fetchCurrentUser = async () => {
      try {
        const jwtToken = localStorage.getItem("token");
        const userResponse = await axios.get("http://4.233.147.212:1337/api/users/me", {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setCurrentUser(userResponse.data);
      } catch (err) {
        console.error("Kullanıcı bilgileri alınırken hata oluştu:", err);
        navigate("/"); // Oturum açmamışsa giriş sayfasına yönlendir
      } finally {
        setLoadingProfile(false);
      }
    };
  
    fetchCurrentUser();
    checkAndFetchData();
    fetchRoles();
  }, [navigate]);



  if (loadingProfile) {
    return <div>Profil bilgileri yükleniyor...</div>;
  }

 

  const handleAddUser = async (e) => {
    e.preventDefault();
    const jwtToken = localStorage.getItem("token");
    try {
      await axios.post(
        "http://4.233.147.212:1337/api/users",
        {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      alert("Kullanıcı başarıyla eklendi.");
      setNewUser({ username: "", email: "", password: "", role: "" });
      // Yeni kullanıcıları yeniden çek
      const usersResponse = await axios.get("http://4.233.147.212:1337/api/users?populate=role", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setUsers(usersResponse.data);
    } catch (err) {
      console.error("Kullanıcı eklenirken hata oluştu:", err);
      alert("Kullanıcı eklenirken bir hata oluştu.");
    }
  };


  // handleEditClick fonksiyonu
const handleEditClick = (game) => {
    setSelectedGame(game);
    setEditModalOpen(true);
  };

  const handleSaveChanges = async () => {
    const jwtToken = localStorage.getItem("token");
  
    try {
      // PUT isteğini gönder
      await axios.put(
        `http://4.233.147.212:1337/api/games/${selectedGame.id}`,
        {
          data: {
            name: selectedGame.name,
            developer: selectedGame.developer,
            platforms: selectedGame.platforms,
            genres: selectedGame.genres,
            ratings: selectedGame.ratings,
            website: selectedGame.website,
            description: selectedGame.description,
          },
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
  
      // Düzenleme sonrası state'i güncelle
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === selectedGame.id ? selectedGame : game
        )
      );
  
      alert("Oyun başarıyla güncellendi.");
      setEditModalOpen(false);
    } catch (err) {
      console.error("Oyun güncellenirken hata oluştu:", err.response?.data || err.message);
      alert("Oyun güncellenirken bir hata oluştu.");
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      `Bu kullanıcıyı silmek istediğinize emin misiniz?`
    );
    if (!confirmDelete) return;
  
    try {
      const jwtToken = localStorage.getItem("token");
      // Kullanıcı silmek için DELETE isteği gönder
      await axios.delete(`http://4.233.147.212:1337/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
  
      // Kullanıcı listesinden silinen kullanıcıyı kaldır
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("Kullanıcı başarıyla silindi.");
    } catch (err) {
      console.error("Kullanıcı silinirken hata oluştu:", err.response?.data || err.message);
      alert("Kullanıcı silinirken bir hata oluştu.");
    }
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setEditedUser({ username: user.username, email: user.email }); // Varsayılan değerleri doldur
  };

  const handleChange = (field, value) => {
    setSelectedGame((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const jwtToken = localStorage.getItem("token");
      await axios.put(
        `http://4.233.147.212:1337/api/users/${editingUser.id}`,
        {
          username: editedUser.username,
          email: editedUser.email,
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? { ...user, username: editedUser.username, email: editedUser.email }
            : user
        )
      );

      setEditingUser(null);
      alert("Kullanıcı bilgileri başarıyla güncellendi.");
    } catch (err) {
      console.error("Kullanıcı güncellenirken hata oluştu:", err);
      alert("Kullanıcı güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteGame = async (gameId) => {
    const confirmDelete = window.confirm("Bu oyunu silmek istediğinize emin misiniz?");
    if (!confirmDelete) return;
  
    try {
      const jwtToken = localStorage.getItem("token");
  
      // DELETE isteğini gönder
      await axios.delete(`http://4.233.147.212:1337/api/games/${gameId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
  
      // Oyun listesinden kaldır
      setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
      alert("Oyun başarıyla silindi.");
    } catch (err) {
      console.error("Oyun silinirken hata oluştu:", err.response?.data || err.message);
      alert("Oyun silinirken bir hata oluştu.");
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (gameImage) {
        formData.append("files", gameImage); // Resim dosyasını ekle
      }
  
      const jwtToken = localStorage.getItem("token");
  
      // 1. Resmi yükle
      let imageId = null;
      if (gameImage) {
        const uploadResponse = await axios.post(
          "http://4.233.147.212:1337/api/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
  
        // Yüklenen resim verilerini kontrol et
        if (uploadResponse.data && uploadResponse.data[0]) {
          imageId = uploadResponse.data[0].id; // Resim ID'sini al
        }
      }
  
      // 2. Oyun verilerini ekle
      const response = await axios.post(
        "http://4.233.147.212:1337/api/games",
        {
          data: {
            name: gameName,
            developer: gameDeveloper,
            platforms: gamePlatforms,
            genres: gameGenres,
            ratings: gameRatings || null, // Opsiyonel
            website: gameWebsite || null, // Opsiyonel
            description: gameDescription || null, // Opsiyonel
            background_image: imageId, // Yüklenen resmin ID'si
          },
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
  
      alert("Oyun başarıyla eklendi.");
      // Gerekirse state sıfırlama
      setGameName("");
      setGameDeveloper("");
      setGamePlatforms("");
      setGameGenres("");
      setGameRatings("");
      setGameWebsite("");
      setGameDescription("");
      setGameImage(null);
    } catch (err) {
      console.error("Oyun eklerken hata oluştu:", err);
      alert("Oyun eklenirken bir hata oluştu.");
    }
  };
  

  const handleCancel = () => {
    setEditingUser(null);
  };

  const toggleUserList = () => {
    setShowUserList((prevState) => !prevState);
  };

  const toggleGameList = () => {
    setShowGameList((prevState) => !prevState);
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  return (
    <div className="admin-page">
      <header>
        <h1>Yönetim Paneli</h1>
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </header>
      <main>
        <div className="buttons-container">
          <button onClick={toggleUserList} className="navigate-button">
            Kullanıcı Yönetim Sistemi
          </button>
          <button onClick={toggleGameList} className="navigate-button">
            Oyun Kontrol Paneli
          </button>
        </div>

        {showUserList && (
          <div>
            {users.length === 0 ? (
              <p>Henüz kullanıcı yok.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kullanıcı Adı</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role?.name || "Bilinmiyor"}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(user)}
                          className="edit-button"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="delete-button"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {editingUser && (
              <div className="edit-form">
                <h3>Kullanıcı Bilgilerini Düzenle</h3>
                <form>
                  <label>Kullanıcı Adı:</label>
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, username: e.target.value })
                    }
                  />
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                  <div className="form-buttons">
                    <button type="button" onClick={handleSave}>
                      Kaydet
                    </button>
                    <button type="button" onClick={handleCancel}>
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}<div className="admin-page">
        <main>
          {/* Mevcut kodlar */}
          {showUserList && (
            <div>
              {/* Kullanıcı listesi */}
              {/* Kullanıcı ekleme formu */}
              <div className="add-user-form">
                <h3>Yeni Kullanıcı Ekle</h3>
                <form onSubmit={handleAddUser}>
                  <label>Kullanıcı Adı:</label>
                  <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                  <label>Email:</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                  <label>Şifre:</label>
                  <input
                    type="password"
                    placeholder="Şifre"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  <label>Rol:</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                  >
                    <option value="">Rol Seçin</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
                <button type="submit">Ekle</button>
                </form>
            </div>
            </div>
            )}
            </main>
        </div>

        {showGameList && (
          <div>
            <h2>Oyun Listesi</h2>
            {games.length === 0 ? (
              <p>Henüz oyun eklenmemiş.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Oyun Adı</th>
                    <th>Geliştirici</th>
                    <th>Tür</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                        <td>{game.name || "Bilinmiyor"}</td>
                        <td>{game.developer || "Bilinmiyor"}</td>
                        <td>{game.genres || "Bilinmiyor"}</td>
                        <td>{game.platforms || "Bilinmiyor"}</td>
                        <td>
                            <button onClick={() => handleEditClick(game)}>Düzenle</button>
                            <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="delete-button"
                            >
                            Sil
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>

              </table>
            )}
                {editModalOpen && (
                <div className="modal">
                <h3>Oyun Düzenle</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveChanges();
                    }}
                    >
                    <label>
                        Adı:
                        <input
                        type="text"
                        value={selectedGame?.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </label>
                    <label>
                        Geliştirici:
                        <input
                        type="text"
                        value={selectedGame?.developer || ""}
                        onChange={(e) => handleChange("developer", e.target.value)}
                        />
                    </label>
                    <label>
                        Platformlar:
                        <input
                        type="text"
                        value={selectedGame?.platforms || ""}
                        onChange={(e) => handleChange("platforms", e.target.value)}
                        />
                    </label>
                    <label>
                        Tür:
                        <input
                        type="text"
                        value={selectedGame?.genres || ""}
                        onChange={(e) => handleChange("genres", e.target.value)}
                        />
                    </label>
                    <label>
                        Puan:
                        <input
                        type="number"
                        value={selectedGame?.ratings || ""}
                        onChange={(e) => handleChange("ratings", e.target.value)}
                        />
                    </label>
                    <label>
                        Web Sitesi:
                        <input
                        type="text"
                        value={selectedGame?.website || ""}
                        onChange={(e) => handleChange("website", e.target.value)}
                        />
                    </label>
                    <label>
                        Açıklama:
                        <textarea
                        value={selectedGame?.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </label>
                    <button type="submit">Kaydet</button>
                    <button type="button" onClick={() => setEditModalOpen(false)}>
                        İptal
                    </button>
                    </form>
                </div>
                )}
            <div className="add-game-form">
              <h3>Yeni Oyun Ekle</h3>
              <form onSubmit={(e) => handleAddGame(e)}>
                <label>Oyun Adı:</label>
                <input
                    type="text"
                    placeholder="Oyun Adı"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    required
                    />
                    <input
                    type="text"
                    placeholder="Geliştirici"
                    value={gameDeveloper}
                    onChange={(e) => setGameDeveloper(e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Platformlar"
                    value={gamePlatforms}
                    onChange={(e) => setGamePlatforms(e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Tür"
                    value={gameGenres}
                    onChange={(e) => setGameGenres(e.target.value)}
                    />
                    <input
                    type="number"
                    placeholder="Puan"
                    value={gameRatings}
                    onChange={(e) => setGameRatings(e.target.value)}
                    />
                    <input
                    type="text"
                    placeholder="Web Sitesi"
                    value={gameWebsite}
                    onChange={(e) => setGameWebsite(e.target.value)}
                    />
                    <textarea
                    placeholder="Açıklama"
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    />
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGameImage(e.target.files[0])}
                    />
                    <button type="submit">Ekle</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;