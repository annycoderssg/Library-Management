function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmButtonClass = 'btn-primary', isProcessing = false }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        <div style={{ padding: '1rem 0' }}>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isProcessing}
            style={{ padding: '0.5rem 1.5rem' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={confirmButtonClass}
            onClick={handleConfirm}
            disabled={isProcessing}
            style={{ padding: '0.5rem 1.5rem' }}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
