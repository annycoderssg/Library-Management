function Table({ columns, data, emptyMessage = 'No data found', renderRow, className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <table className={className}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="empty-state">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className={className}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id || idx}>
              {renderRow ? renderRow(item) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;







