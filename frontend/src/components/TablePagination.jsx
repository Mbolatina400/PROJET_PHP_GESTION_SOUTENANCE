function TablePagination({ page, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  return (
    <nav className="table-pagination" aria-label="Pagination du tableau">
      <span>Page {page} sur {totalPages}</span>
      <div>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Précédent</button>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Suivant</button>
      </div>
    </nav>
  );
}

export default TablePagination;
