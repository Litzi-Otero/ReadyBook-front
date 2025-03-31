import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ResetPasswordForm = ({ handleResetPassword, email, setStep, setError, isLoading, error }) => {
  return (
    <Formik
      initialValues={{ code: "", newPassword: "", confirmPassword: "" }}
      validationSchema={Yup.object({
        code: Yup.string().matches(/^\d{6}$/, "Debe ser 6 dígitos").required("Requerido"),
        newPassword: Yup.string().min(8, "Mínimo 8 caracteres").required("Requerido"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("newPassword"), null], "Las contraseñas deben coincidir")
          .required("Requerido"),
      })}
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
  );
};

export default ResetPasswordForm;