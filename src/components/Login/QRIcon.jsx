import { FaQrcode } from "react-icons/fa";

const QRIcon = ({ mode, step, handleQRClick, isLoading }) => {
  if (!(mode === "login" || (mode === "reset-request" && step === 1))) return null;

  return (
    <div className="qr-icon-wrapper">
      <button
        className="qr-icon-btn"
        onClick={handleQRClick}
        title="Recuperar código MFA con QR"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading-spinner">Cargando...</span>
        ) : (
          <FaQrcode />
        )}
      </button>
    </div>
  );
};

export default QRIcon;