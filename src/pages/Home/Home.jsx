import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { SkeletonGrid } from '../../components/SkeletonCard/SkeletonCard';
import { useProducts } from '../../context/ProductsContext';
import adesivoImg from '../../assets/categorias/adesivo.png';
import calendarioImg from '../../assets/categorias/calendario.png';
import envelopeImg from '../../assets/categorias/envelope.png';
import florImg from '../../assets/categorias/flor.png';
import tagImg from '../../assets/categorias/tag.png';
import topoImg from '../../assets/categorias/topo.png';
import './Home.css';

const categoriasDestaque = [
  { nome: 'Adesivos', img: adesivoImg },
  { nome: 'Calendários', img: calendarioImg },
  { nome: 'Envelopes', img: envelopeImg },
  { nome: 'Flores', img: florImg },
  { nome: 'Tags', img: tagImg },
  { nome: 'Topos de Bolo', img: topoImg },
];

export function Home() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState('');

  const destaques = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );

  const buscaRapida = useMemo(() => {
    if (!search.trim()) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 4);
  }, [search, products]);

  return (
    <>
      <Header />

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-tag">🌸 Papelaria com amor</span>
          <h1>
            Bem-vinda ao <br />
            <span className="home-hero-destaque">Cantinho da Lanna</span>
          </h1>
          <p>
            Cadernos, canetas e mimos criados com carinho pra deixar seu dia
            mais fofo e organizado.
          </p>

          <div className="home-hero-busca">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {buscaRapida.length > 0 && (
            <div className="home-busca-resultados">
              {buscaRapida.map((p) => (
                <Link key={p.id} to={`/produto/${p.id}`} className="home-busca-item">
                  <img src={p.images?.[0] || p.image} alt={p.name} />
                  <div>
                    <strong>{p.name}</strong>
                    <span>Ver detalhes</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="home-hero-actions">
            <Link to="/produtos" className="home-btn-primary">
              Ver catálogo completo
            </Link>
            <Link to="/sobre" className="home-btn-ghost">
              Sobre nós
            </Link>
          </div>
        </div>
      </section>

      <section className="home-categorias">
        <h2>Navegue por categoria</h2>
        <div className="home-categorias-grid">
          {categoriasDestaque.map((cat) => (
            <Link
              key={cat.nome}
              to={`/produtos?cat=${encodeURIComponent(cat.nome)}`}
              className="home-cat-card"
            >
              <div className="home-cat-imgwrap">
                <img src={cat.img} alt={cat.nome} />
              </div>
              <strong>{cat.nome}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-destaques">
        <div className="home-destaques-head">
          <div>
            <h2>Destaques da semana</h2>
            <p>Os produtos mais amados pelas clientes</p>
          </div>
          <Link to="/produtos" className="home-ver-todos">
            Ver todos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : (
          <div className="home-grid">
            {destaques.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="home-cta">
        <div className="home-cta-content">
          <h2>Não achou o que procurava?</h2>
          <p>Fale com a gente que a Lanna personaliza pra você!</p>
          <Link to="/contato" className="home-btn-primary">
            Fale conosco
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}