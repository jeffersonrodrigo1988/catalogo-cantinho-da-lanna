import { useState } from 'react';
import { useClients } from '../../../context/ClientsContext';
import { useDialog } from '../../../context/DialogContext';

export function ClientManager() {
  const { clients, addClient, updateClient, removeClient, getOrdersByClient } = useClients();
  const { confirmar, notificar } = useDialog();

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState('');

  const clientesFiltrados = clients.filter((c) =>
    c.name.toLowerCase().includes(busca.toLowerCase()) ||
    c.phone.includes(busca)
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      notificar('Preencha o nome do cliente', 'aviso');
      return;
    }

    if (editandoId) {
      updateClient(editandoId, form);
      notificar('Cliente atualizado!', 'sucesso');
    } else {
      addClient(form);
      notificar('Cliente cadastrado!', 'sucesso');
    }

    setForm({ name: '', phone: '', email: '', address: '', notes: '' });
    setEditandoId(null);
  }

  function handleEditar(client) {
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setEditandoId(client.id);
  }

  async function handleExcluir(id, nome) {
    const ok = await confirmar({
      titulo: 'Excluir cliente?',
      mensagem: `Quer mesmo excluir "${nome}"?`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeClient(id);
      notificar('Cliente excluído', 'sucesso');
    }
  }

  function handleCancelar() {
    setForm({ name: '', phone: '', email: '', address: '', notes: '' });
    setEditandoId(null);
  }

  return (
    <section className="admin-form-section">
      <h2>👥 Cadastro de Clientes</h2>
      <p className="admin-hint">
        Cadastre seus clientes para agilizar os pedidos.
      </p>

      <form className="admin-client-form" onSubmit={handleSubmit}>
        <div className="admin-grid">
          <label className="admin-field">
            <span>Nome *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome completo"
            />
          </label>

          <label className="admin-field">
            <span>Telefone</span>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </label>

          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </label>

          <label className="admin-field">
            <span>Endereço</span>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Rua, número, bairro"
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Observações</span>
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Cliente VIP, prefere PIX..."
            />
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-primary">
            {editandoId ? '💾 Salvar alterações' : ' Cadastrar cliente'}
          </button>
          {editandoId && (
            <button type="button" className="admin-btn-secundario" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="admin-client-search">
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <p className="admin-vazio">Nenhum cliente cadastrado ainda 😢</p>
      ) : (
        <div className="admin-client-list">
          {clientesFiltrados.map((c) => {
            const totalPedidos = getOrdersByClient(c.id).length;
            return (
              <div key={c.id} className="admin-client-item">
                <div className="admin-client-info">
                  <strong>{c.name}</strong>
                  {c.phone && <span>📞 {c.phone}</span>}
                  {c.email && <span>✉️ {c.email}</span>}
                  {totalPedidos > 0 && (
                    <span className="admin-client-pedidos">
                      📦 {totalPedidos} pedido{totalPedidos !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="admin-item-acoes">
                  <button className="admin-btn-editar" onClick={() => handleEditar(c)} title="Editar">
                    ✏️
                  </button>
                  <button className="admin-btn-excluir" onClick={() => handleExcluir(c.id, c.name)} title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}