function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card premium-stat-card">
      <div className="stat-card-topline">
        <span className="stat-label">{label}</span>
        <span className="stat-pulse" aria-hidden="true" />
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </article>
  );
}

export default StatCard;
