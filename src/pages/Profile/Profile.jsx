import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import "./Profile.css";
import userImage from "../../assets/user.png";
import { updateUserProfile, verifyProfileMFA } from "../../services/authService";

const Profile = () => {
  const [username, setUsername] = useState("Invitado");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUsername(storedUser.username || "Invitado"); // Si no hay username, usa "Invitado"
      setEmail(storedUser.email || "");
      setRole(storedUser.role || "Sin rol");
      // Nota: No deberías almacenar ni mostrar la contraseña desde localStorage
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "mfaCode") setMfaCode(value);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setError("");
      await updateUserProfile({ username, email, password });
      setStep(2); // Pasar al paso de verificación MFA
    } catch (error) {
      setError(error.message || "Error al iniciar la actualización");
    }
  };

  const handleVerifyMFA = async () => {
    try {
      setError("");
      const response = await verifyProfileMFA(email, mfaCode);
      setIsEditing(false);
      setStep(1); // Volver al modo de visualización
      
      // Actualizar localStorage con los datos más recientes
      const updatedUser = {
        username: response.username || username, // Usar el username del response si existe
        email: response.email || email,
        role: response.role || role,
        userId: response.userId // Si el backend lo devuelve
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Actualizar el estado local
      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setRole(updatedUser.role);
    } catch (error) {
      setError(error.message || "Código incorrecto o expirado");
    }
  };

  return (
    <MainLayout>
      <div className="profile-container">
        <div className="profile-sidebar">
          <img src={userImage} alt="User" className="profile-image" />
          <h2>{username}</h2>
          <p>{email}</p>
          <p>Rol: {role}</p>
        </div>
        <div className="profile-content">
          <h3>{step === 1 ? "Información Personal" : "Verificación MFA"}</h3>
          {step === 1 ? (
            isEditing ? (
              <div>
                <p>
                  <strong>Nombre:</strong>
                  <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleChange}
                  />
                </p>
                <p>
                  <strong>Correo:</strong>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                  />
                </p>
                <p>
                  <strong>Contraseña:</strong>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                  />
                </p>
                {error && <p className="error-message">{error}</p>}
                <button className="btn-save" onClick={handleSave}>
                  Guardar
                </button>
              </div>
            ) : (
              <div>
                <p><strong>Nombre:</strong> {username}</p>
                <p><strong>Correo:</strong> {email}</p>
                <p><strong>Contraseña:</strong> ********</p>
                <button className="btn-edit" onClick={handleEdit}>
                  Editar
                </button>
              </div>
            )
          ) : (
            <div>
              <p>Se ha enviado un código a <strong>{email}</strong>.</p>
              <p>
                <strong>Código MFA:</strong>
                <input
                  type="text"
                  name="mfaCode"
                  value={mfaCode}
                  onChange={handleChange}
                  maxLength="6"
                  placeholder="Ingresa el código"
                />
              </p>
              {error && <p className="error-message">{error}</p>}
              <button className="btn-save" onClick={handleVerifyMFA}>
                Verificar
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;