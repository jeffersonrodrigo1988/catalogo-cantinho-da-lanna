import './SearchBar.css';

export function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span>🔍</span>
      <input
        type="text"
        placeholder="Buscar produtos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}