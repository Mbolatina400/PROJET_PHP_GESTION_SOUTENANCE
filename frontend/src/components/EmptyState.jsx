function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon" aria-hidden="true">⌁</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
