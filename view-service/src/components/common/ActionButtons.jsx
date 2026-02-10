function ActionButtons({ onEdit, onDelete, onReturn, showReturn = false, disabled = false }) {
  const handleClick = (handler, e) => {
    if (disabled || !handler) return;
    e.stopPropagation();
    handler();
  };

  return (
    <>
      {onEdit && (
        <button
          className="btn-edit"
          onClick={(e) => handleClick(onEdit, e)}
          disabled={disabled}
        >
          Edit
        </button>
      )}
      {showReturn && onReturn && (
        <button
          className="btn-return"
          onClick={(e) => handleClick(onReturn, e)}
          disabled={disabled}
        >
          Return
        </button>
      )}
      {onDelete && (
        <button
          className="btn-delete"
          onClick={(e) => handleClick(onDelete, e)}
          disabled={disabled}
        >
          Delete
        </button>
      )}
    </>
  );
}

export default ActionButtons;
