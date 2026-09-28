import { useState } from 'react';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { MENSAGEM_SAUDACAO, WHATSAPP_NUMBER } from '../../config';
import './Contato.css';

export function Contato() {
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');

  const numeroFormatado = WHATSAPP_NUMBER.replace(
    /^(\d{2})(\d{2})(\d{5})(\d{4})$/,
    '+$1 ($2) $3-$4'
  );

  const linkWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    MENSAGEM_SAUDACAO
  )}`;

  function handleEnviar(e) {
    e.preventDefault();
    const texto = `Olá! Meu nome é ${nome || '(não informado)'} 💕\n\n${
      mensagem || MENSAGEM_SAUDACAO
    }`;
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    window.open(link, '_blank');
  }

  return (
    <>
      <Header />

      <section className="contato-hero">
        <div className="contato-hero-content">
          <span className="contato-hero-tag">💌 Fale com a gente</span>
          <h1>
            Vamos conversar? <br />
            <span className="contato-hero-destaque">Será um prazer 💕</span>
          </h1>
          <p>
            Tire dúvidas, faça encomendas personalizadas ou só mande um oi.
            Respondemos rapidinho!
          </p>
        </div>
      </section>

      <main className="contato-container">
        <section className="contato-cards">
          <article className="contato-card">
            <div className="contato-card-icone contato-icone-zap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h3>WhatsApp</h3>
            <p>{numeroFormatado}</p>
            <a
              className="contato-card-btn"
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conversar agora
            </a>
          </article>

          <article className="contato-card">
            <div className="contato-card-icone contato-icone-insta">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </div>
            <h3>Instagram</h3>
            <p>@cantinhodalannaoficial</p>
            <a
              className="contato-card-btn"
              href="https://www.instagram.com/cantinhodalannaoficial/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Seguir
            </a>
          </article>

          <article className="contato-card">
            <div className="contato-card-icone contato-icone-mail">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 6-10 7L2 6"/>
              </svg>
            </div>
            <h3>E-mail</h3>
            <p>cantinhodalannaofficial@gmail.com</p>
            <a
              className="contato-card-btn"
              href="mailto:cantinhodalannaoficial@gmail.com"
            >
              Enviar e-mail
            </a>
          </article>
        </section>

        <section className="contato-form-section">
          <div className="contato-form-info">
            <span className="contato-label">Mensagem rápida</span>
            <h2>Envie sua mensagem 💬</h2>
            <p>
              Preenche o formulário abaixo e clica em enviar. Vai abrir o
              WhatsApp com a mensagem já pronta pra você só apertar enviar.
            </p>

            <ul className="contato-form-beneficios">
              <li>
                <span>⚡</span>
                Resposta em até 1 hora
              </li>
              <li>
                <span>🎨</span>
                Orçamentos personalizados
              </li>
              <li>
                <span>💕</span>
                Atendimento humanizado
              </li>
            </ul>
          </div>

          <form className="contato-form" onSubmit={handleEnviar}>
            <label className="contato-field">
              <span>Seu nome</span>
              <input
                type="text"
                placeholder="Como podemos te chamar?"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </label>

            <label className="contato-field">
              <span>Sua mensagem</span>
              <textarea
                rows="5"
                placeholder="Escreva sua dúvida, pedido ou sugestão..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="contato-btn-enviar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar pelo WhatsApp
            </button>
          </form>
        </section>

        <section className="contato-horario">
          <div className="contato-horario-card">
            <span className="contato-horario-icone">🕐</span>
            <div>
              <h3>Horário de atendimento</h3>
              <p>Segunda a sexta — 9h às 18h</p>
              <p>Sábado — 9h às 13h</p>
            </div>
          </div>
          <div className="contato-horario-card">
            <span className="contato-horario-icone">💬</span>
            <div>
              <h3>Atendimento online</h3>
              <p>Atendemos todo o Brasil</p>
              <p>Fale com a gente pelo WhatsApp</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}