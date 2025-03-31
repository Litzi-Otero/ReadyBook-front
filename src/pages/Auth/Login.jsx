import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { loginUser, verifyMFA, requestPasswordReset, resetPassword, requestMFAQRTempCode, generateMFAQR } from "../../services/authService";
import "./Login.css";
import logo from "../../assets/logo.png";
import LoginForm from "../../components/Login/LoginForm";
import MFAForm from "../../components/Login/MFAForm";
import ResetRequestForm from "../../components/Login/ResetRequestForm";
import ResetPasswordForm from "../../components/Login/ResetPasswordForm";
import TempCodeModal from "../../components/Login/TempCodeModal";
import QRCodeModal from "../../components/Login/QRCodeModal";
import QRIcon from "../../components/Login/QRIcon";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQRInfo, setShowQRInfo] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [showTempCodeForm, setShowTempCodeForm] = useState(false);

  // Esquemas de validación (ya están definidos en los componentes, pero los dejamos aquí por referencia)
  const loginSchema = Yup.object({
    email: Yup.string().email("Correo inválido").required("Requerido"),
    password: Yup.string().required("Requerido"),
  });

  const mfaSchema = Yup.object({
    code: Yup.string().matches(/^\d{6}$/, "Debe contener 6 dígitos numéricos").required("Requerido"),
  });

  const resetRequestSchema = Yup.object({
    email: Yup.string().email("Correo inválido").required("Requerido"),
  });

  const resetSchema = Yup.object({
    code: Yup.string().matches(/^\d{6}$/, "Debe ser 6 dígitos").required("Requerido"),
    newPassword: Yup.string().min(8, "Mínimo 8 caracteres").required("Requerido"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Las contraseñas deben coincidir")
      .required("Requerido"),
  });

  const tempCodeSchema = Yup.object({
    tempCode: Yup.string()
      .matches(/^\d{6}$/, "Debe ser un código de 6 dígitos")
      .required("Requerido"),
  });

  // Manejo del Login
  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      const { email, password } = values;
      const response = await loginUser(email, password);
      if (response.mfaRequired) {
        setEmail(email);
        setStep(2);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Error en el inicio de sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo del MFA para login con TOTP
  const handleMFA = async (values) => {
    setIsLoading(true);
    try {
      const response = await verifyMFA(email, values.code);
      localStorage.setItem("token", response.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Código incorrecto, inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitud de recuperación de contraseña
  const handleRequestReset = async (values) => {
    setIsLoading(true);
    try {
      const response = await requestPasswordReset(values.email);
      setEmail(values.email);
      setStep(2);
      setError("");
    } catch (err) {
      if (err.message === "Usuario no encontrado") {
        setError("El correo no está registrado.");
      } else {
        setError(err.message || "Error al solicitar recuperación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Restablecimiento de contraseña
  const handleResetPassword = async (values) => {
    setIsLoading(true);
    try {
      await resetPassword(email, values.code, values.newPassword);
      setMode("login");
      setStep(1);
      setError("");
      setEmail("");
      alert("Contraseña restablecida con éxito. Por favor, inicia sesión.");
    } catch (err) {
      if (err.message === "Código incorrecto") {
        setError("El código ingresado es incorrecto.");
      } else if (err.message === "Código expirado") {
        setError("El código ha expirado. Solicita uno nuevo.");
      } else {
        setError(err.message || "Error al restablecer la contraseña.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el clic en el ícono de QR
  const handleQRClick = async () => {
    try {
      if (!email) {
        setError("Por favor, ingresa tu correo antes de generar el código QR.");
        return;
      }
      setIsLoading(true);
      await requestMFAQRTempCode(email);
      setShowTempCodeForm(true);
      setError("");
    } catch (err) {
      setError(err.message || "Error al solicitar el código temporal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTempCodeSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await generateMFAQR(email, values.tempCode);
      if (response.qr) {
        setQrCode(response.qr);
        setShowTempCodeForm(false);
        setShowQRInfo(true);
      } else {
        setError("Error al generar el código QR.");
      }
    } catch (err) {
      if (err.message === "Código temporal incorrecto") {
        setError("El código ingresado es incorrecto.");
      } else if (err.message === "Código temporal expirado") {
        setError("El código ha expirado. Solicita uno nuevo.");
      } else {
        setError(err.message || "Error al verificar el código temporal.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="logo" />
        <h2>
          {mode === "login" && step === 1
            ? "INICIO DE SESIÓN"
            : mode === "login" && step === 2
            ? "VERIFICACIÓN MFA"
            : mode === "reset-request" && step === 1
            ? "RECUPERAR CONTRASEÑA"
            : "VERIFICAR Y RESTABLECER"}
        </h2>
  
        {/* Mostrar solo un formulario a la vez */}
        {(() => {
          if (mode === "login" && step === 1) {
            return (
              <LoginForm
                handleLogin={handleLogin}
                setMode={setMode}
                setError={setError}
                isLoading={isLoading}
                error={error}
                setEmail={setEmail}
              />
            );
          } else if (mode === "login" && step === 2) {
            return (
              <MFAForm
                handleMFA={handleMFA}
                email={email}
                isLoading={isLoading}
                error={error}
              />
            );
          } else if (mode === "reset-request" && step === 1) {
            return (
              <ResetRequestForm
                handleRequestReset={handleRequestReset}
                setMode={setMode}
                setError={setError}
                isLoading={isLoading}
                error={error}
                setEmail={setEmail}
              />
            );
          } else if (mode === "reset-request" && step === 2) {
            return (
              <ResetPasswordForm
                handleResetPassword={handleResetPassword}
                email={email}
                setStep={setStep}
                setError={setError}
                isLoading={isLoading}
                error={error}
              />
            );
          }
          return null; // En caso de que ninguna condición se cumpla
        })()}
  
        <QRIcon
          mode={mode}
          step={step}
          handleQRClick={handleQRClick}
          isLoading={isLoading}
        />
  
        <TempCodeModal
          showTempCodeForm={showTempCodeForm}
          setShowTempCodeForm={setShowTempCodeForm}
          email={email}
          handleTempCodeSubmit={handleTempCodeSubmit}
          isLoading={isLoading}
          error={error}
        />
  
        <QRCodeModal
          showQRInfo={showQRInfo}
          setShowQRInfo={setShowQRInfo}
          qrCode={qrCode}
          setQrCode={setQrCode}
        />
  
        {(mode === "login" || mode === "reset-request") && (
          <p className="register-link">
            ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
