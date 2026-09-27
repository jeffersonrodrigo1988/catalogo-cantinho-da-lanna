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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = category === 'Todos' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, category, products]);

  return (
    <>
      <Header />

      <section className="produtos-hero">
        <div className="produtos-hero-content">
          <span className="produtos-hero-tag">✨ Novidades toda semana</span>
          <h1>Nossos produtos</h1>
          <p>Cadernos, canetas e mimos criados com carinho pra deixar seu dia mais fofo.</p>
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
            <h3>Como comprar?</h3>
            <p className="produtos-info">
              Escolha os produtos e fale com a gente pelo WhatsApp pra saber
              valores e fazer o pedido. 💕
            </p>
          </div>
        </aside>

        <section className="produtos-main">
          <div className="produtos-toolbar">
            <p className="produtos-count">
              <strong>{filtered.length}</strong> produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
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