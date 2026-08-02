function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="loading-skeleton" aria-label="Chargement en cours" aria-busy="true">
      <span className="skeleton-line skeleton-title" />
      {Array.from({ length: rows }, (_, index) => <span className="skeleton-line" key={index} />)}
    </div>
  );
}

export default LoadingSkeleton;
