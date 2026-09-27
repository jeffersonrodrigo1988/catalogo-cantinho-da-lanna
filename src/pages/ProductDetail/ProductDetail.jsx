import { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { abrirWhatsApp, mensagemProduto } from '../../utils/whatsapp';
import './ProductDetail.css';

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [imagemAtual, setImagemAtual] = useState(0);
  const galeriaRef = useRef(null);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <>
        <Header />
        <main className="detail-notfound">
          <div className="detail-notfound-box">
            <span className="detail-notfound-emoji">😢</span>
            <h2>Produto não encontrado</h2>
            <p>O produto que você procura não existe ou foi removido.</p>
            <Link to="/produtos" className="detail-btn-primary">
              Voltar ao catálogo
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const fotos = product.images?.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const relacionados = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleWhatsApp() {
    abrirWhatsApp(mensagemProduto(product, quantity));
  }

  function handleTrocarImagem(i) {
    setImagemAtual(i);
    // Volta pro topo da galeria com suavidade
    if (galeriaRef.current) {
      galeriaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <>
      <Header />

      <main className="detail">
        <nav className="detail-breadcrumb">
          <Link to="/">Início</Link>
          <span>/</span>
          <Link to="/produtos">Produtos</Link>
          <span>/</span>
          <Link to="/produtos">{product.category}</Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="detail-main">
          <div className="detail-gallery" ref={galeriaRef}>
            <div className="detail-gallery-main">
              {product.featured && <span className="detail-badge-destaque">✨ Destaque</span>}
              <img src={fotos[imagemAtual]} alt={product.name} />
            </div>

            {fotos.length > 1 && (
              <div className="detail-thumbs">
                {fotos.map((foto, i) => (
                  <button
                    key={i}
                    className={`detail-thumb ${i === imagemAtual ? 'active' : ''}`}
                    onClick={() => handleTrocarImagem(i)}
                  >
                    <img src={foto} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="detail-cat">{product.category}</span>
            <h1>{product.name}</h1>

            <p className="detail-desc">{product.description}</p>

            <div className="detail-consultar">
              <span className="detail-consultar-icone">💬</span>
              <div>
                <strong>Consulte o valor pelo WhatsApp</strong>
                <small>Fale com a gente e tire todas as dúvidas</small>
              </div>
            </div>

            <div className="detail-estoque">
              <span className="detail-estoque-dot"></span>
              Disponível para encomenda
            </div>

            <div className="detail-actions">
              <div className="detail-quantity">
                <span className="detail-quantity-label">Quantidade</span>
                <div className="detail-quantity-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="detail-btn-whatsapp" onClick={handleWhatsApp}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Pedir pelo WhatsApp
              </button>
            </div>

            <p className="detail-aviso">
              💬 Você será redirecionada para o WhatsApp com a mensagem pronta
            </p>

            <div className="detail-beneficios">
              <div className="detail-beneficio">
                <span>🔒</span>
                <div>
                  <strong>Atendimento direto</strong>
                  <small>Sem intermediários</small>
                </div>
              </div>
              <div className="detail-beneficio">
                <span>💝</span>
                <div>
                  <strong>Embalagem fofa</strong>
                  <small>Feita com carinho</small>
                </div>
              </div>
              <div className="detail-beneficio">
                <span>✨</span>
                <div>
                  <strong>Personalizável</strong>
                  <small>Do seu jeitinho</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-descricao-completa">
          <h2>Descrição completa</h2>
          <p>
            {product.description} Perfeito para presentear alguém especial ou
            para deixar seu dia mais fofo e organizado. Cada detalhe foi
            pensado com carinho para trazer alegria pra sua rotina. 💕
          </p>
        </section>

        {relacionados.length > 0 && (
          <section className="detail-relacionados">
            <div className="detail-relacionados-head">
              <h2>Você também vai amar 💕</h2>
              <Link to="/produtos" className="detail-relacionados-link">
                Ver mais
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="detail-relacionados-grid">
              {relacionados.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}