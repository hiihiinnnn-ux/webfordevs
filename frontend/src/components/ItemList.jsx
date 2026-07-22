import { Link } from 'react-router-dom';

export function ItemList({ items, type }) {
  if (!items?.length) {
    return <div className="empty-state">Nothing matched that filter.</div>;
  }

  return (
    <div>
      {items.map((item) => {
        const title = item.name || item.title;
        const href =
          type === 'tool'
            ? `/tools/${item.slug}`
            : type === 'model'
              ? `/models/${item.slug}`
              : `/learn/${item.slug}`;

        return (
          <Link key={item.id || item.slug} to={href} className="item-link">
            <div className="item-meta">
              {type === 'tool' && <span className="chip">{item.category}</span>}
              {type === 'model' && <span className="chip">{item.family}</span>}
              {type === 'guide' && <span className="chip">{item.level}</span>}
              {item.difficulty && <span className="chip chip-muted">{item.difficulty}</span>}
              {item.parameterSize && <span className="chip chip-muted">{item.parameterSize}</span>}
              {item.readingMinutes && (
                <span className="chip chip-muted">{item.readingMinutes} min</span>
              )}
              {item.featured && <span className="chip">featured</span>}
            </div>
            <h3>{title}</h3>
            <p>{item.description || item.summary}</p>
          </Link>
        );
      })}
    </div>
  );
}
