function PageHeader({ title, description, action }) {
  return (
    <div className="page-header premium-page-header">
      <div>
        <span className="page-kicker">RealEnergy Admin</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </div>
  );
}

export default PageHeader;
