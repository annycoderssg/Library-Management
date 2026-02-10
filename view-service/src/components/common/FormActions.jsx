function FormActions({ children, onCancel, cancelLabel = 'Cancel', disabled = false }) {
  return (
    <div className="form-actions">
      {children}
      {onCancel && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={disabled}
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
}

export default FormActions;
