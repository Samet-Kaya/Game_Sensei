import React, { useState } from "react";
import "./style.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const userData = {
      username,
      email,
      password,
    };

    try {
      // Kullanıcı kaydı için User tablosuna kayıt
      const userResponse = await fetch(
        "http://localhost:1337/api/auth/local/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const userResponseData = await userResponse.json();

      if (userResponse.ok) {
        // User tablosuna kayıt başarılıysa
        setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        console.error("User kaydı sırasında hata oluştu:", userResponseData);
        setMessage(`Hata: ${userResponseData.error.message}`);
      }
    } catch (error) {
      console.error("Kayıt işlemi sırasında hata oluştu:", error);
      setMessage("Kayıt sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="form-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Kullanıcı Adı</label>
          <input
            type="text"
            placeholder="Kullanıcı adınızı girin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>E-posta</label>
          <input
            type="email"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Şifre</label>
          <input
            type="password"
            placeholder="Şifrenizi oluşturun"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button">
          Kayıt Ol
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
      <p className="form-text">
        Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
      </p>
    </div>
  );
};

export default Register;
