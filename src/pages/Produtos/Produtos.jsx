import { useMemo, useState } from 'react';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import './Produtos.css';

export function Produtos() {
  const { products, categories } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('relevancia');

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchCategory = category === 'Todos' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });

    if (sortBy === 'menor-preco') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'maior-preco') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'a-z') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [search, category, sortBy, products]);

  return (
    <>
      <Header />

      <section className="produtos-hero">
        <div className="produtos-hero-content">
          <span className="produtos-hero-tag">✨ Novidades toda semana</span>
          <h1>Papelaria que encanta</h1>
          <p>Cadernos, canetas e mimos criados com carinho pra deixar seu dia mais fofo.</p>
          <button className="produtos-hero-cta">Ver ofertas 🔥</button>
        </div>
      </section>

      <main className="produtos-container">
        <aside className="produtos-sidebar">
          <div className="produtos-sidebar-block">
            <h3>Buscar</h3>
            <div className="produtos-busca">
              <span>🔍</span>
              <input
                type="text"
                placeholder="O que você procura?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="produtos-sidebar-block">
            <h3>Categorias</h3>
            <ul className="produtos-categorias">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    className={`produtos-cat-item ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                    <span className="produtos-cat-count">
                      {cat === 'Todos'
                        ? products.length
                        : products.filter((p) => p.category === cat).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="produtos-sidebar-block">
            <h3>Frete grátis</h3>
            <label className="produtos-check">
              <input type="checkbox" />
              <span>Somente produtos com frete grátis</span>
            </label>
          </div>

          <div className="produtos-sidebar-block">
            <h3>Promoções</h3>
            <label className="produtos-check">
              <input type="checkbox" />
              <span>Somente produtos em oferta</span>
            </label>
          </div>
        </aside>

        <section className="produtos-main">
          <div className="produtos-toolbar">
            <p className="produtos-count">
              <strong>{filtered.length}</strong> produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>

            <div className="produtos-sort">
              <label>Ordenar por:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="a-z">A - Z</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="produtos-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="produtos-empty">Nenhum produto encontrado 😢</p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}