function FormGroup({ label, required, children, className = '', error, inputId }) {
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className={`form-group ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label>
          {label} {required && '*'}
        </label>
      )}
      {children}
      {error && (
        <span
          id={errorId}
          className="form-error-tooltip"
          role="alert"
          aria-live="polite"
        >
          {error}
        </span>
      )}
    </div>
  );
}

export default FormGroup;
