import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const MFAForm = ({ handleMFA, email, isLoading, error }) => {
  return (
    <Formik
      initialValues={{ code: "" }}
      validationSchema={Yup.object({
        code: Yup.string().matches(/^\d{6}$/, "Debe contener 6 dígitos numéricos").required("Requerido"),
      })}
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
  );
};

export default MFAForm;