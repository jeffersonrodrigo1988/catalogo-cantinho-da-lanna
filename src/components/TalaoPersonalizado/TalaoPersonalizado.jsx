import { useRef } from 'react';
import html2canvas from 'html2canvas';
import './TalaoPersonalizado.css';

export function TalaoPersonalizado({ order, client, onPrint }) {
  const talaoRef = useRef(null);
  const items = order.items || [];
  const valorTotal = items.reduce((acc, item) => {
    const total = (parseFloat(item.qtd) || 0) * (parseFloat(item.preco) || 0);
    return acc + total;
  }, 0);

  const sinal = parseFloat(order.sinal) || 0;
  const restante = valorTotal - sinal;

  function handlePrint() { window.print(); }

  async function handleSalvarPNG() {
    if (!talaoRef.current) return;

    try {
      const canvas = await html2canvas(talaoRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      const nomeCliente = (client?.name || order.clientName || 'pedido')
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]/g, '');
      const fileName = `talao_${nomeCliente}_${Date.now()}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = imgData;
      link.click();

      alert('✅ Talão salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar: ' + err.message);
    }
  }

  return (
    <div className="talao-container">
      <div className="talao-actions">
        <button className="talao-btn-print" onClick={handlePrint}>🖨️ Imprimir</button>
        <button className="talao-btn-save" onClick={handleSalvarPNG}>💾 Salvar PNG</button>
        {onPrint && <button className="talao-btn-close" onClick={onPrint}>✕ Fechar</button>}
      </div>

      <div className="talao talao-personalizado" ref={talaoRef}>
        <div className="talao-header">
          <h1 className="talao-title">Pedidos</h1>
          <div className="talao-logo">
            <img 
              src="/favicon.png" 
              alt="Cantinho da Lanna" 
              className="talao-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <small className="talao-logo-text">Cantinho da Lanna</small>
          </div>
        </div>

        <div className="talao-section">
          <h3 className="talao-section-title">Dados Pessoais:</h3>
          <div className="talao-field"><span>Cliente:</span><div className="talao-line">{client?.name || order.clientName || ''}</div></div>
          <div className="talao-field"><span>Telefone:</span><div className="talao-line">{client?.phone || order.clientPhone || ''}</div></div>
          <div className="talao-field"><span>Endereço:</span><div className="talao-line">{client?.address || order.clientAddress || ''}</div></div>
        </div>

        <table className="talao-table">
          <thead>
            <tr>
              <th className="talao-th-qtd">Qtd</th>
              <th className="talao-th-prod">Produto</th>
              <th className="talao-th-un">R$ un.</th>
              <th className="talao-th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const total = (parseFloat(item.qtd) || 0) * (parseFloat(item.preco) || 0);
              return (
                <tr key={idx}>
                  <td>{item.qtd}</td>
                  <td>{item.produto}</td>
                  <td>R$ {(parseFloat(item.preco) || 0).toFixed(2)}</td>
                  <td>R$ {total.toFixed(2)}</td>
                </tr>
              );
            })}
            {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}><td></td><td></td><td></td><td></td></tr>
            ))}
          </tbody>
        </table>

        <div className="talao-resumo">
          <div className="talao-resumo-field"><span>Valor Total:</span><div className="talao-line short">R$ {valorTotal.toFixed(2)}</div></div>
          <div className="talao-resumo-field"><span>Sinal:</span><div className="talao-line short">R$ {sinal.toFixed(2)}</div></div>
          <div className="talao-resumo-field"><span>Restante:</span><div className="talao-line short">R$ {restante.toFixed(2)}</div></div>
        </div>

        <div className="talao-grid-2">
          <div className="talao-pagamento">
            <h3 className="talao-subtitle">Forma de pagamento:</h3>
            <div className="talao-pagamento-list">
              {['Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Pix', 'Boleto'].map((p) => (
                <div key={p} className={`talao-pag-item ${order.pagamento === p ? 'active' : ''}`}>
                  <span className="talao-pag-icon">💳</span>
                  <span>{p}:</span>
                  <div className={`talao-radio ${order.pagamento === p ? 'checked' : ''}`}>
                    {order.pagamento === p && <span className="talao-radio-check">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="talao-observacoes">
            <h3 className="talao-subtitle">Observações</h3>
            <div className="talao-obs-box">{order.observacoes || ''}</div>
          </div>
        </div>

        <div className="talao-info-personalizacao">
          <div className="talao-field"><span>Nome:</span><div className="talao-line">{order.nomeAniversariante || ''}</div></div>
          <div className="talao-field"><span>Idade:</span><div className="talao-line">{order.idade || ''}</div></div>
          <div className="talao-field"><span>Tema:</span><div className="talao-line">{order.tema || ''}</div></div>
        </div>

        <div className="talao-footer">
          <div className="talao-footer-field"><span>Data Pedido:</span><div className="talao-line mini">{order.dataPedido ? new Date(order.dataPedido).toLocaleDateString('pt-BR') : ''}</div></div>
          <div className="talao-footer-field"><span>Data Entrega:</span><div className="talao-line mini">{order.dataEntrega ? new Date(order.dataEntrega).toLocaleDateString('pt-BR') : ''}</div></div>
          <div className="talao-footer-field"><span>Hora:</span><div className="talao-line mini">{order.horaEntrega || ''}</div></div>
        </div>
      </div>
    </div>
  );
}