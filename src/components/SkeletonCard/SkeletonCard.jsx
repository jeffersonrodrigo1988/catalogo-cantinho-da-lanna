import './SkeletonCard.css';

export function SkeletonCard() {
  return (
    <article className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-info">
        <div className="skeleton-line skeleton-line-cat"></div>
        <div className="skeleton-line skeleton-line-title"></div>
        <div className="skeleton-line skeleton-line-title"></div>
        <div className="skeleton-line skeleton-line-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}