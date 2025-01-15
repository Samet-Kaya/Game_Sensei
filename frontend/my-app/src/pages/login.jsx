import React, { useState } from "react";
import "./style.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:1337/api/auth/local`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const jwtToken = data.jwt;

        // Kullanıcı bilgilerini tekrar almak ve populate ile rolü getirmek
        const userResponse = await fetch(
          `http://localhost:1337/api/users/${data.user.id}?populate=role`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const userData = await userResponse.json();

        if (userResponse.ok) {
          // Kullanıcı verilerini localStorage'a kaydet
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", jwtToken);

          // Kullanıcı rolüne göre yönlendirme
          const role = userData.role?.name;
          setMessage("Giriş başarılı! Yönlendiriliyorsunuz...");
          if (role === "Admin") {
            setTimeout(() => (window.location.href = "/adminpage"), 2000); // Admin sayfasına yönlendir
          } else {
            setTimeout(() => (window.location.href = "/menu"), 2000); // Menüye yönlendir
          }
        } else {
          setMessage("Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.");
        }
      } else {
        setMessage(data.error?.message || "Giriş başarısız! Bilgilerinizi kontrol edin.");
      }
    } catch (error) {
      console.error("Giriş sırasında hata oluştu:", error);
      setMessage("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="form-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Kullanıcı Adı veya E-posta</label>
          <input
            type="text"
            placeholder="Kullanıcı adı veya e-posta"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Şifre</label>
          <input
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button">
          Giriş Yap
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
      <p className="form-text">
        Henüz hesabınız yok mu? <a href="/register">Kayıt Ol</a>
      </p>
    </div>
  );
};

export default Login;
