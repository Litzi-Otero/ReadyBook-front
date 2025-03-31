import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const TempCodeModal = ({ showTempCodeForm, setShowTempCodeForm, email, handleTempCodeSubmit, isLoading, error }) => {
  if (!showTempCodeForm) return null;

  return (
    <>
      <div className="modal-overlay" onClick={() => setShowTempCodeForm(false)} />
      <div className="qr-modal">
        <h3>Verificación de Seguridad</h3>
        <p>
          Se ha enviado un código temporal de 6 dígitos a <strong>{email}</strong>. Ingresa el código para continuar.
        </p>
        <Formik
          initialValues={{ tempCode: "" }}
          validationSchema={Yup.object({
            tempCode: Yup.string()
              .matches(/^\d{6}$/, "Debe ser un código de 6 dígitos")
              .required("Requerido"),
          })}
          onSubmit={handleTempCodeSubmit}
        >
          <Form>
            <div>
              <label>Código Temporal:</label>
              <Field
                type="text"
                name="tempCode"
                className="input-field"
                maxLength="6"
                autoFocus
                placeholder="Ingresa el código"
              />
              <ErrorMessage name="tempCode" component="div" className="field-error" />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Verificar"}
            </button>
            <button
              type="button"
              onClick={() => setShowTempCodeForm(false)}
              className="close-qr-info"
            >
              Cancelar
            </button>
          </Form>
        </Formik>
      </div>
    </>
  );
};

export default TempCodeModal;