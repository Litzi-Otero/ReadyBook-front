import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { registerUser, verifyRegisterMFA } from "../../services/authService";
import "./Register.css";
import logo from "../../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Formulario, 2: MFA
  const [tempUserData, setTempUserData] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = { username: "", email: "", password: "", confirmPassword: "" };
  const mfaInitialValues = { code: "" };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Mínimo 3 caracteres")
      .required("Requerido"),
    email: Yup.string()
      .email("Correo inválido")
      .required("Requerido"),
    password: Yup.string()
      .min(8, "Mínimo 8 caracteres")
      .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
      .matches(/[a-z]/, "Debe contener al menos una minúscula")
      .matches(/[0-9]/, "Debe contener al menos un número")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Debe contener al menos un carácter especial")
      .required("Requerido"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir")
      .required("Requerido"),
  });

  const mfaSchema = Yup.object({
    code: Yup.string()
      .matches(/^\d{6}$/, "Debe ser 6 dígitos")
      .required("Requerido"),
  });

  const handleInitialSubmit = async (values, { setSubmitting }) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await registerUser(values.username, values.email, values.password);
      setTempUserData({
        username: values.username,
        email: values.email,
        password: values.password
      });
      setQr(response.qr);
      setStep(2);
    } catch (err) {
      setError(err.message || "Error al iniciar el registro");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleMFA = async (values, { setSubmitting }) => {
    setError("");
    setIsLoading(true);

    try {
      await verifyRegisterMFA(
        tempUserData.email,
        values.code,
        tempUserData.username,
        tempUserData.password
      );
      navigate("/login");
    } catch (err) {
      setError(err.message || "Código MFA incorrecto");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <img
          src={logo}
          alt="Logo"
          className="logo"
          style={{ display: "block", margin: "0 auto 20px", maxWidth: "100px" }}
        />
        <h2>{step === 1 ? "Registro" : "Verificación MFA"}</h2>
        {error && <p className="error-message">{error}</p>}

        {step === 1 && (
          <Formik 
            initialValues={initialValues} 
            validationSchema={validationSchema} 
            onSubmit={handleInitialSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div>
                  <label>Nombre de usuario:</label>
                  <Field type="text" name="username" autoFocus />
                  <ErrorMessage name="username" component="div" className="field-error" />
                </div>
                <div>
                  <label>Email:</label>
                  <Field type="email" name="email" />
                  <ErrorMessage name="email" component="div" className="field-error" />
                </div>
                <div>
                  <label>Contraseña:</label>
                  <Field type="password" name="password" />
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>
                <div>
                  <label>Confirmar Contraseña:</label>
                  <Field type="password" name="confirmPassword" />
                  <ErrorMessage name="confirmPassword" component="div" className="field-error" />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isLoading} 
                  className="submit-button"
                >
                  {isLoading ? "Preparando..." : "Continuar con MFA"}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {step === 2 && (
          <Formik 
            initialValues={mfaInitialValues} 
            validationSchema={mfaSchema} 
            onSubmit={handleMFA}
          >
            {({ isSubmitting }) => (
              <Form>
                <p style={{ textAlign: "center", marginBottom: "15px" }}>
                  Escanea este código QR con tu app de autenticación y verifica:
                </p>
                {qr && (
                  <div style={{ textAlign: "center", marginBottom: "15px" }}>
                    <img src={qr} alt="Código QR MFA" style={{ maxWidth: "200px" }} />
                  </div>
                )}
                <div>
                  <label>Código MFA:</label>
                  <Field type="text" name="code" maxLength="6" autoFocus />
                  <ErrorMessage name="code" component="div" className="field-error" />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting || isLoading} 
                  className="submit-button"
                >
                  {isLoading ? "Verificando..." : "Completar Registro"}
                </button>
              </Form>
            )}
          </Formik>
        )}

        <p className="login-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Register;