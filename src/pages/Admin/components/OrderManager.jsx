import { useState } from 'react';
import { useClients } from '../../../context/ClientsContext';
import { useDialog } from '../../../context/DialogContext';
import { TalaoTopoBolo } from '../../../components/TalaoTopoBolo/TalaoTopoBolo';
import { TalaoPersonalizado } from '../../../components/TalaoPersonalizado/TalaoPersonalizado';

const FORM_VAZIO = {
  clientId: '',
  clientName: '',
  clientPhone: '',
  clientAddress: '',
  type: 'personalizado',
  items: [{ qtd: '', produto: '', preco: '' }],
  sinal: '',
  pagamento: '',
  observacoes: '',
  nomeAniversariante: '',
  idade: '',
  tema: '',
  tamanho: '',
  comprimento: '',
  largura: '',
  altura: '',
  dataPedido: new Date().toISOString().split('T')[0],
  dataEntrega: '',
  horaEntrega: '',
};

export function OrderManager() {
  const { clients, orders, addOrder, updateOrder, removeOrder, updateOrderStatus } = useClients();
  const { confirmar, notificar } = useDialog();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [talaoAberto, setTalaoAberto] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('all');

  const pedidosFiltrados = orders.filter((o) =>
    filtroStatus === 'all' ? true : o.status === filtroStatus
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClientSelect(clientId) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        clientId,
        clientName: client.name,
        clientPhone: client.phone || '',
        clientAddress: client.address || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientPhone: '',
        clientAddress: '',
      }));
    }
  }

  function handleItemChange(idx, campo, valor) {
    const novosItems = [...form.items];
    novosItems[idx] = { ...novosItems[idx], [campo]: valor };
    setForm((prev) => ({ ...prev, items: novosItems }));
  }

  function handleAddItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { qtd: '', produto: '', preco: '' }],
    }));
  }

  function handleRemoveItem(idx) {
    if (form.items.length <= 1) {
      notificar('Precisa ter pelo menos 1 item', 'aviso');
      return;
    }
    const novosItems = form.items.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, items: novosItems }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName.trim()) {
      notificar('Selecione ou informe o cliente', 'aviso');
      return;
    }
    if (form.items.every((i) => !i.produto.trim())) {
      notificar('Adicione pelo menos 1 produto', 'aviso');
      return;
    }

    const orderData = {
      ...form,
      items: form.items.filter((i) => i.produto.trim()),
    };

    if (editandoId) {
      updateOrder(editandoId, orderData);
      notificar('Pedido atualizado!', 'sucesso');
    } else {
      addOrder(orderData);
      notificar('Pedido criado!', 'sucesso');
    }

    setForm(FORM_VAZIO);
    setEditandoId(null);
  }

  function handleEditar(order) {
    setForm({
      ...FORM_VAZIO,
      ...order,
    });
    setEditandoId(order.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleExcluir(id) {
    const ok = await confirmar({
      titulo: 'Excluir pedido?',
      mensagem: 'Essa ação não pode ser desfeita.',
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeOrder(id);
      notificar('Pedido excluído', 'sucesso');
    }
  }

  function handleVerTalao(order) {
    setTalaoAberto(order);
  }

  function getStatusLabel(status) {
    const labels = {
      pending: '⏳ Pendente',
      'in-progress': '🔨 Em produção',
      completed: '✅ Entregue',
      cancelled: ' Cancelado',
    };
    return labels[status] || status;
  }

  function getStatusClass(status) {
    return `admin-order-status admin-order-status-${status}`;
  }

  return (
    <>
      <section className="admin-form-section">
        <h2>📋 Novo Pedido</h2>
        <p className="admin-hint">
          Preencha os dados para gerar o talão do pedido.
        </p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-grid">
            <label className="admin-field">
              <span>Cliente *</span>
              <select
                value={form.clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Ou digite o nome (cliente novo)</span>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Nome do cliente"
              />
            </label>

            <label className="admin-field">
              <span>Telefone</span>
              <input
                type="text"
                name="clientPhone"
                value={form.clientPhone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </label>

            <label className="admin-field">
              <span>Endereço</span>
              <input
                type="text"
                name="clientAddress"
                value={form.clientAddress}
                onChange={handleChange}
                placeholder="Endereço completo"
              />
            </label>

            <label className="admin-field">
              <span>Tipo de talão *</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="personalizado"> Personalizado em geral</option>
                <option value="topo-bolo"> Topo de Bolo</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Forma de pagamento</span>
              <select
                name="pagamento"
                value={form.pagamento}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de crédito">Cartão de crédito</option>
                <option value="Cartão de débito">Cartão de débito</option>
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto</option>
              </select>
            </label>
          </div>

          <div className="admin-items-section">
            <h3>🛒 Itens do pedido</h3>
            {form.items.map((item, idx) => (
              <div key={idx} className="admin-item-row">
                <input
                  type="number"
                  placeholder="Qtd"
                  value={item.qtd}
                  onChange={(e) => handleItemChange(idx, 'qtd', e.target.value)}
                  className="admin-item-qtd"
                />
                <input
                  type="text"
                  placeholder="Produto"
                  value={item.produto}
                  onChange={(e) => handleItemChange(idx, 'produto', e.target.value)}
                  className="admin-item-prod"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="R$ un."
                  value={item.preco}
                  onChange={(e) => handleItemChange(idx, 'preco', e.target.value)}
                  className="admin-item-preco"
                />
                <button
                  type="button"
                  className="admin-item-remove"
                  onClick={() => handleRemoveItem(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="admin-btn-add-item" onClick={handleAddItem}>
              ➕ Adicionar item
            </button>
          </div>

          <div className="admin-grid">
            <label className="admin-field">
              <span>Sinal (R$)</span>
              <input
                type="number"
                step="0.01"
                name="sinal"
                value={form.sinal}
                onChange={handleChange}
                placeholder="0,00"
              />
            </label>

            <label className="admin-field">
              <span>Data do pedido</span>
              <input
                type="date"
                name="dataPedido"
                value={form.dataPedido}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span>Data de entrega</span>
              <input
                type="date"
                name="dataEntrega"
                value={form.dataEntrega}
                onChange={handleChange}
              />
            </label>

            <label className="admin-field">
              <span>Hora de entrega</span>
              <input
                type="time"
                name="horaEntrega"
                value={form.horaEntrega}
                onChange={handleChange}
              />
            </label>
          </div>

          {form.type === 'topo-bolo' && (
            <div className="admin-topo-bolo-fields">
              <h3>🎂 Detalhes do Topo de Bolo</h3>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Tamanho</span>
                  <select
                    name="tamanho"
                    value={form.tamanho}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    <option value="redondo">Redondo</option>
                    <option value="retangular">Retangular</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>Nome do aniversariante</span>
                  <input
                    type="text"
                    name="nomeAniversariante"
                    value={form.nomeAniversariante}
                    onChange={handleChange}
                    placeholder="Nome"
                  />
                </label>

                <label className="admin-field">
                  <span>Idade</span>
                  <input
                    type="text"
                    name="idade"
                    value={form.idade}
                    onChange={handleChange}
                    placeholder="Ex: 5 anos"
                  />
                </label>

                <label className="admin-field">
                  <span>Tema</span>
                  <input
                    type="text"
                    name="tema"
                    value={form.tema}
                    onChange={handleChange}
                    placeholder="Ex: Mickey, Princesas..."
                  />
                </label>

                <label className="admin-field">
                  <span>Comprimento (cm)</span>
                  <input
                    type="number"
                    step="0.1"
                    name="comprimento"
                    value={form.comprimento}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Largura (cm)</span>
                  <input
                    type="number"
                    step="0.1"
                    name="largura"
                    value={form.largura}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Altura (cm)</span>
                  <input
                    type="number"
                    step="0.1"
                    name="altura"
                    value={form.altura}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          )}

          {form.type === 'personalizado' && (
            <div className="admin-personalizado-fields">
              <h3>🎨 Detalhes da Personalização</h3>
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Nome</span>
                  <input
                    type="text"
                    name="nomeAniversariante"
                    value={form.nomeAniversariante}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Idade</span>
                  <input
                    type="text"
                    name="idade"
                    value={form.idade}
                    onChange={handleChange}
                  />
                </label>

                <label className="admin-field">
                  <span>Tema</span>
                  <input
                    type="text"
                    name="tema"
                    value={form.tema}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          )}

          <label className="admin-field admin-field-wide">
            <span>Observações</span>
            <textarea
              rows="3"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Detalhes do pedido..."
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary">
              {editandoId ? '💾 Salvar alterações' : '➕ Criar pedido'}
            </button>
            {editandoId && (
              <button
                type="button"
                className="admin-btn-secundario"
                onClick={() => {
                  setForm(FORM_VAZIO);
                  setEditandoId(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-lista-section">
        <div className="admin-lista-head">
          <h2>📋 Pedidos ({pedidosFiltrados.length})</h2>
          <div className="admin-order-filters">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: '⏳ Pendentes' },
              { value: 'in-progress', label: '🔨 Em produção' },
              { value: 'completed', label: '✅ Entregues' },
              { value: 'cancelled', label: '❌ Cancelados' },
            ].map((f) => (
              <button
                key={f.value}
                className={`admin-filter-btn ${filtroStatus === f.value ? 'active' : ''}`}
                onClick={() => setFiltroStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p className="admin-vazio">Nenhum pedido encontrado 😢</p>
        ) : (
          <div className="admin-order-list">
            {pedidosFiltrados.map((o) => {
              const client = clients.find((c) => c.id === o.clientId);
              const total = o.items.reduce((acc, i) => {
                return acc + (parseFloat(i.qtd) || 0) * (parseFloat(i.preco) || 0);
              }, 0);

              return (
                <article key={o.id} className="admin-order-item">
                  <div className="admin-order-icon">
                    {o.type === 'topo-bolo' ? '' : '🎨'}
                  </div>

                  <div className="admin-order-info">
                    <strong>{o.clientName}</strong>
                    {client?.phone && <span>📞 {client.phone}</span>}
                    <span className="admin-order-type">
                      {o.type === 'topo-bolo' ? 'Topo de Bolo' : 'Personalizado'}
                    </span>
                    <span className="admin-order-total">
                      💰 R$ {total.toFixed(2)}
                    </span>
                    {o.dataEntrega && (
                      <span className="admin-order-data">
                        📅 Entrega: {new Date(o.dataEntrega).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <span className={getStatusClass(o.status)}>
                      {getStatusLabel(o.status)}
                    </span>
                  </div>

                  <div className="admin-order-acoes">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="admin-order-status-select"
                    >
                      <option value="pending">⏳ Pendente</option>
                      <option value="in-progress">🔨 Em produção</option>
                      <option value="completed">✅ Entregue</option>
                      <option value="cancelled">❌ Cancelado</option>
                    </select>
                    <button
                      className="admin-btn-ver-talao"
                      onClick={() => handleVerTalao(o)}
                      title="Ver talão"
                    >
                      📄
                    </button>
                    <button
                      className="admin-btn-editar"
                      onClick={() => handleEditar(o)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="admin-btn-excluir"
                      onClick={() => handleExcluir(o.id)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {talaoAberto && (
        <div className="talao-modal-overlay">
          <div className="talao-modal-content">
            {talaoAberto.type === 'topo-bolo' ? (
              <TalaoTopoBolo
                order={talaoAberto}
                client={clients.find((c) => c.id === talaoAberto.clientId)}
                onPrint={() => setTalaoAberto(null)}
              />
            ) : (
              <TalaoPersonalizado
                order={talaoAberto}
                client={clients.find((c) => c.id === talaoAberto.clientId)}
                onPrint={() => setTalaoAberto(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}