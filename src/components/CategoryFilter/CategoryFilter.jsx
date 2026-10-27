import { categories } from '../../data/products';
import './CategoryFilter.css';

export function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`chip ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}