function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error">
      {message}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            float: 'right',
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 0.5rem'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;







