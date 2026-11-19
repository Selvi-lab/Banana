
export default function AdminSection({
  eyebrow = "BANANAFIBRE MANAGEMENT",
  title,
  description,
  action,
  children
}) {
  return (
    <section className="admin-section">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action && <div className="admin-heading-action">{action}</div>}
      </div>

      <div className="admin-section-body">
        {children}
      </div>
    </section>
  );
}
