import { Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { abrirWhatsApp } from '../../utils/whatsapp';
import { MENSAGEM_SAUDACAO } from '../../config';
import './Sobre.css';

export function Sobre() {
  return (
    <>
      <Header />

      <section className="sobre-hero">
        <div className="sobre-hero-content">
          <span className="sobre-hero-tag">💕 Nossa história</span>
          <h1>
            Um cantinho feito com <br />
            <span className="sobre-hero-destaque">muito carinho</span>
          </h1>
          <p>
            O Cantinho da Lanna nasceu do amor por papelaria e da vontade de
            deixar o dia a dia mais fofo, colorido e organizado.
          </p>
        </div>
      </section>

      <main className="sobre-container">
        <section className="sobre-historia">
          <div className="sobre-historia-texto">
            <span className="sobre-label">Sobre nós</span>
            <h2>Quem somos 🌸</h2>
            <p>
              Somos uma papelaria criativa que acredita que pequenos detalhes
              transformam o cotidiano. Cada caderno, caneta e item
              personalizado é escolhido pensando em você — que ama papelaria
              e quer deixar tudo mais bonito.
            </p>
            <p>
              Do Cantinho da Lanna saem presentes fofos, kits escolares e
              mimos personalizados pra todas as ocasiões especiais.
            </p>
          </div>

          <div className="sobre-historia-img">
            <img
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"
              alt="Papelaria criativa"
            />
          </div>
        </section>

        <section className="sobre-valores">
          <span className="sobre-label">O que nos move</span>
          <h2>Nossos valores</h2>

          <div className="sobre-valores-grid">
            <article className="sobre-valor-card">
              <div className="sobre-valor-icone">💖</div>
              <h3>Feito com amor</h3>
              <p>Cada pedido é preparado com cuidado e carinho do início ao fim.</p>
            </article>

            <article className="sobre-valor-card">
              <div className="sobre-valor-icone">✨</div>
              <h3>Qualidade</h3>
              <p>Trabalhamos só com produtos que a gente usaria e amaria.</p>
            </article>

            <article className="sobre-valor-card">
              <div className="sobre-valor-icone">🎨</div>
              <h3>Criatividade</h3>
              <p>Personalizamos tudo do seu jeitinho pra deixar único e especial.</p>
            </article>

            <article className="sobre-valor-card">
              <div className="sobre-valor-icone">🤝</div>
              <h3>Atendimento</h3>
              <p>Você fala direto com a gente pelo WhatsApp, sem burocracia.</p>
            </article>
          </div>
        </section>

        <section className="sobre-numeros">
          <div className="sobre-numero">
            <strong>+500</strong>
            <span>clientes felizes</span>
          </div>
          <div className="sobre-numero">
            <strong>+200</strong>
            <span>produtos no catálogo</span>
          </div>
          <div className="sobre-numero">
            <strong>5★</strong>
            <span>avaliação média</span>
          </div>
          <div className="sobre-numero">
            <strong>100%</strong>
            <span>feito com carinho</span>
          </div>
        </section>

        <section className="sobre-cta">
          <div className="sobre-cta-content">
            <h2>Bora deixar seu dia mais fofo? 💕</h2>
            <p>Dá uma olhada nos produtos ou fala com a gente!</p>
            <div className="sobre-cta-actions">
              <Link to="/produtos" className="sobre-btn-primary">
                Ver catálogo
              </Link>
              <button
                className="sobre-btn-whatsapp"
                onClick={() => abrirWhatsApp(MENSAGEM_SAUDACAO)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Falar no WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}