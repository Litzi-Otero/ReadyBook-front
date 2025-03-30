import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser, verifyMFA, requestPasswordReset, resetPassword } from "../../services/authService";
import "./Login.css";
import logo from "../../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login", "reset-request"
  const [step, setStep] = useState(1); // 1: Credenciales/Solicitud, 2: MFA/Verificación
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Esquemas de validación
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
      setError(""); // Limpiar errores previos
    } catch (err) {
      // Mostrar mensaje específico si el correo no existe
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
      // Manejar errores específicos del backend
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

        {/* Inicio de sesión - Paso 1 */}
        {mode === "login" && step === 1 && (
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            <Form>
              <div>
                <label>Correo:</label>
                <Field
                  type="email"
                  name="email"
                  className="input-field"
                  autoFocus
                  placeholder="Ingresa tu correo"
                />
                <ErrorMessage name="email" component="div" className="field-error" />
              </div>
              <div>
                <label>Contraseña:</label>
                <Field
                  type="password"
                  name="password"
                  className="input-field"
                  placeholder="Ingresa tu contraseña"
                />
                <ErrorMessage name="password" component="div" className="field-error" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>
              <p className="forgot-password-link">
                ¿Olvidaste tu contraseña?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset-request");
                    setError("");
                  }}
                >
                  Recuperar
                </button>
              </p>
            </Form>
          </Formik>
        )}

        {/* Inicio de sesión - MFA con TOTP */}
        {mode === "login" && step === 2 && (
          <Formik
            initialValues={{ code: "" }}
            validationSchema={mfaSchema}
            onSubmit={handleMFA}
          >
            <Form>
              <p>
                Ingresa el código generado por tu app de autenticación (ej. Microsoft Authenticator) para{" "}
                <strong>{email}</strong>.
              </p>
              <div>
                <label>Código MFA:</label>
                <Field
                  type="text"
                  name="code"
                  className="input-field"
                  maxLength="6"
                  autoFocus
                  placeholder="Ingresa el código"
                />
                <ErrorMessage name="code" component="div" className="field-error" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Verificar"}
              </button>
            </Form>
          </Formik>
        )}

        {/* Solicitud de recuperación */}
        {mode === "reset-request" && step === 1 && (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={resetRequestSchema}
            onSubmit={handleRequestReset}
          >
            <Form>
              <div>
                <label>Correo:</label>
                <Field
                  type="email"
                  name="email"
                  className="input-field"
                  autoFocus
                  placeholder="Ingresa tu correo"
                />
                <ErrorMessage name="email" component="div" className="field-error" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar código"}
              </button>
              <p className="back-to-login">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </p>
            </Form>
          </Formik>
        )}

        {/* Verificación y restablecimiento */}
        {mode === "reset-request" && step === 2 && (
          <Formik
            initialValues={{ code: "", newPassword: "", confirmPassword: "" }}
            validationSchema={resetSchema}
            onSubmit={handleResetPassword}
          >
            <Form>
              <p>
                Se envió un código de 6 dígitos a <strong>{email}</strong>. Ingresa el código y tu nueva contraseña.
              </p>
              <div>
                <label>Código:</label>
                <Field
                  type="text"
                  name="code"
                  className="input-field"
                  maxLength="6"
                  autoFocus
                  placeholder="Ingresa el código"
                />
                <ErrorMessage name="code" component="div" className="field-error" />
              </div>
              <div>
                <label>Nueva contraseña:</label>
                <Field
                  type="password"
                  name="newPassword"
                  className="input-field"
                  placeholder="Ingresa nueva contraseña"
                />
                <ErrorMessage name="newPassword" component="div" className="field-error" />
              </div>
              <div>
                <label>Confirmar contraseña:</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="input-field"
                  placeholder="Confirma la contraseña"
                />
                <ErrorMessage name="confirmPassword" component="div" className="field-error" />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
              </button>
              <p className="back-to-login">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                >
                  Solicitar otro código
                </button>
              </p>
            </Form>
          </Formik>
        )}

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