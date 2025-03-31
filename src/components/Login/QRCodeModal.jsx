const QRCodeModal = ({ showQRInfo, setShowQRInfo, qrCode, setQrCode }) => {
    if (!showQRInfo) return null;
  
    return (
      <>
        <div className="modal-overlay" onClick={() => setShowQRInfo(false)} />
        <div className="qr-modal">
          <h3>Escanea el Código QR</h3>
          {qrCode ? (
            <img src={qrCode} alt="Código QR para MFA" className="qr-image" />
          ) : (
            <p>No se pudo generar el código QR. Intenta de nuevo.</p>
          )}
          <p>Escanea este código con tu app de autenticación para recuperar tu código MFA.</p>
          <button
            onClick={() => {
              setShowQRInfo(false);
              setQrCode(null);
            }}
            className="close-qr-info"
          >
            Cerrar
          </button>
        </div>
      </>
    );
  };
  
  export default QRCodeModal;