import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ResetRequestForm = ({ handleRequestReset, setMode, setError, isLoading, error, setEmail }) => {
  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={Yup.object({
        email: Yup.string().email("Correo inválido").required("Requerido"),
      })}
      onSubmit={handleRequestReset}
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
      )}
    </Formik>
  );
};

export default ResetRequestForm;