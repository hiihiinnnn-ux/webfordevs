export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">∅</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="empty-state error">
      <div className="empty-mark">!</div>
      <p>{message}</p>
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
