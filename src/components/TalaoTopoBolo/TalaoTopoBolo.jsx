import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import './TalaoTopoBolo.css';

export function TalaoTopoBolo({ order, client, onPrint }) {
  const talaoRef = useRef(null);

  const items = order.items || [];
  const valorTotal = items.reduce((acc, item) => {
    const total = (parseFloat(item.qtd) || 0) * (parseFloat(item.preco) || 0);
    return acc + total;
  }, 0);

  const sinal = parseFloat(order.sinal) || 0;
  const restante = valorTotal - sinal;

  async function handleSalvarPNG() {
    if (!talaoRef.current) return;

    try {
      // Abre diálogo "Salvar como"
      const filePath = await save({
        title: 'Salvar Talão',
        defaultPath: `talao_${(client?.name || order.clientName || 'pedido').replace(/\s+/g, '_')}.png`,
        filters: [{ name: 'Imagem PNG', extensions: ['png'] }],
      });

      if (!filePath) return;

      // Captura o talão no tamanho NATURAL (sem forçar nada)
      const canvas = await html2canvas(talaoRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await writeFile(filePath, uint8Array);
      alert('✅ Talão salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar: ' + err.message);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="talao-actions">
        <button onClick={handlePrint} className="talao-btn-print">🖨️ Imprimir</button>
        <button onClick={handleSalvarPNG} className="talao-btn-save">💾 Salvar PNG</button>
        {onPrint && <button onClick={onPrint} className="talao-btn-close">✕ Fechar</button>}
      </div>

      <div className="talao-print-wrapper" ref={talaoRef}>
        <div className="talao talao-topo-bolo">
          <div className="talao-header">
            <h1 className="talao-title">Pedidos</h1>
            <div className="talao-logo">
              <img src="/favicon.png" alt="Cantinho da Lanna" className="talao-logo-img" />
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
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.qtd}</td>
                  <td>{item.produto}</td>
                  <td>R$ {(parseFloat(item.preco) || 0).toFixed(2)}</td>
                  <td>R$ {((parseFloat(item.qtd) || 0) * (parseFloat(item.preco) || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="talao-resumo">
            <div className="talao-resumo-field"><span>Valor Total:</span><div className="talao-line short">R$ {valorTotal.toFixed(2)}</div></div>
            <div className="talao-resumo-field"><span>Sinal:</span><div className="talao-line short">R$ {sinal.toFixed(2)}</div></div>
            <div className="talao-resumo-field"><span>Restante:</span><div className="talao-line short">R$ {restante.toFixed(2)}</div></div>
          </div>

          <div className="talao-grid-2">
            <div className="talao-tamanho">
              <h3 className="talao-subtitle">Tamanho</h3>
              <div className="talao-formas">
                <div className={`talao-forma ${order.tamanho === 'redondo' ? 'active' : ''}`}>
                  <div className="forma-redonda">{order.tamanho === 'redondo' && '✓'}</div>
                  <span>Redondo</span>
                </div>
                <div className={`talao-forma ${order.tamanho === 'retangular' ? 'active' : ''}`}>
                  <div className="forma-retangular">{order.tamanho === 'retangular' && '✓'}</div>
                  <span>Retangular</span>
                </div>
              </div>
              <div className="talao-medidas">
                <div className="talao-field-inline"><span>Comprimento:</span><div className="talao-line mini">{order.comprimento || ''}</div></div>
                <div className="talao-field-inline"><span>Largura:</span><div className="talao-line mini">{order.largura || ''}</div></div>
                <div className="talao-field-inline"><span>Altura:</span><div className="talao-line mini">{order.altura || ''}</div></div>
              </div>
            </div>

            <div className="talao-info-bolo">
              <h3 className="talao-subtitle talao-subtitle-blue">Topo de Bolo</h3>
              <div className="talao-field"><span>Nome:</span><div className="talao-line">{order.nomeAniversariante || ''}</div></div>
              <div className="talao-field"><span>Idade:</span><div className="talao-line">{order.idade || ''}</div></div>
              <div className="talao-field"><span>Tema:</span><div className="talao-line">{order.tema || ''}</div></div>
            </div>
          </div>

          <div className="talao-grid-2">
            <div className="talao-observacoes">
              <h3 className="talao-subtitle">Observações:</h3>
              <div className="talao-obs-box">{order.observacoes || ''}</div>
            </div>

            <div className="talao-pagamento">
              <h3 className="talao-subtitle">Forma de pagamento:</h3>
              <div className={`talao-pag-item ${order.pagamento === 'Dinheiro' ? 'active' : ''}`}>Dinheiro {order.pagamento === 'Dinheiro' && '✓'}</div>
              <div className={`talao-pag-item ${order.pagamento === 'Cartão de crédito' ? 'active' : ''}`}>Cartão de crédito {order.pagamento === 'Cartão de crédito' && '✓'}</div>
              <div className={`talao-pag-item ${order.pagamento === 'Cartão de débito' ? 'active' : ''}`}>Cartão de débito {order.pagamento === 'Cartão de débito' && '✓'}</div>
              <div className={`talao-pag-item ${order.pagamento === 'Pix' ? 'active' : ''}`}>Pix {order.pagamento === 'Pix' && '✓'}</div>
              <div className={`talao-pag-item ${order.pagamento === 'Boleto' ? 'active' : ''}`}>Boleto {order.pagamento === 'Boleto' && '✓'}</div>
            </div>
          </div>

          <div className="talao-footer">
            <div className="talao-footer-field"><span>Data Pedido:</span><div className="talao-line mini">{order.dataPedido ? new Date(order.dataPedido).toLocaleDateString('pt-BR') : ''}</div></div>
            <div className="talao-footer-field"><span>Data Entrega:</span><div className="talao-line mini">{order.dataEntrega ? new Date(order.dataEntrega).toLocaleDateString('pt-BR') : ''}</div></div>
            <div className="talao-footer-field"><span>Hora:</span><div className="talao-line mini">{order.horaEntrega || ''}</div></div>
          </div>
        </div>
      </div>
    </>
  );
}