import FormGroup from './FormGroup';

function FormInput({
  type = 'text',
  label,
  required = false,
  value,
  onChange,
  placeholder = '',
  min,
  max,
  rows,
  options = [],
  filterFn,
  error,
  ...props
}) {
  const inputId = `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'input'}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const commonInputProps = {
    id: inputId,
    required,
    value,
    onChange,
    className: error ? 'input-error' : '',
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': errorId,
    ...props
  };

  if (type === 'select') {
    return (
      <FormGroup label={label} required={required} error={error} inputId={inputId}>
        <select {...commonInputProps}>
          <option value="">Select {label}</option>
          {(filterFn ? options.filter(filterFn) : options).map((option) => {
            if (typeof option === 'object') {
              return (
                <option key={option.id || option.value} value={option.id || option.value}>
                  {option.label || option.name || option.title}
                </option>
              );
            }
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          })}
        </select>
      </FormGroup>
    );
  }

  if (type === 'textarea') {
    return (
      <FormGroup label={label} required={required} error={error} inputId={inputId}>
        <textarea
          {...commonInputProps}
          placeholder={placeholder}
          rows={rows || 3}
        />
      </FormGroup>
    );
  }

  return (
    <FormGroup label={label} required={required} error={error} inputId={inputId}>
      <input
        {...commonInputProps}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
      />
    </FormGroup>
  );
}

export default FormInput;
