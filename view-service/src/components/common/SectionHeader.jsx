function SectionHeader({ title, children, actions }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {actions && <div className="header-actions">{actions}</div>}
      {children}
    </div>
  );
}

export default SectionHeader;
