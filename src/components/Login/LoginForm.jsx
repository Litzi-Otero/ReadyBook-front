import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const LoginForm = ({ handleLogin, setMode, setError, isLoading, error, setEmail }) => {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={Yup.object({
        email: Yup.string().email("Correo inválido").required("Requerido"),
        password: Yup.string().required("Requerido"),
      })}
      onSubmit={handleLogin}
    >
      {({ setFieldValue }) => (
        <Form>
          <div>
            <label>Correo:</label>
            <Field
              type="email"
              name="email"
              className="input-field"
              autoFocus
              placeholder="Ingresa tu correo"
              onChange={(e) => {
                setFieldValue("email", e.target.value);
                setEmail(e.target.value);
              }}
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
      )}
    </Formik>
  );
};

export default LoginForm;