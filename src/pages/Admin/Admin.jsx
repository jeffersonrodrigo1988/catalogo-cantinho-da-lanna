import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { useProducts } from '../../context/ProductsContext';
import { ADMIN_PASSWORD } from '../../config';
import { isTauri } from '../../utils/tauri';
import './Admin.css';

const FORM_VAZIO = {
  name: '',
  description: '',
  image: '',
  category: '',
  stock: '',
  featured: false,
};

export function Admin() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const { products, categories, addProduct, updateProduct, removeProduct } = useProducts();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');

  if (!isTauri()) {
    return (
      <>
        <Header />
        <main className="admin-bloqueado">
          <div className="admin-bloqueado-box">
            <span className="admin-bloqueado-emoji">🔒</span>
            <h1>Área restrita</h1>
            <p>
              O painel admin só funciona no aplicativo do PC.
              <br />
              Aqui no site você só pode visualizar o catálogo. 💕
            </p>
            <Link to="/" className="admin-btn-primary">
              Voltar ao catálogo
            </Link>
          </div>
        </main>
      </>
    );
  }

  function handleLogin(e) {
    e.preventDefault();
    if (senha === ADMIN_PASSWORD) {
      setLogado(true);
      setErroSenha('');
    } else {
      setErroSenha('Senha incorreta 😢');
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.category) {
      setMensagem('⚠️ Preencha nome e categoria');
      return;
    }

    const produtoFinal = {
      name: form.name.trim(),
      description: form.description.trim() || 'Produto do Cantinho da Lanna 💕',
      image: form.image.trim() || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400',
      category: form.category.trim(),
      stock: parseInt(form.stock) || 10,
      featured: form.featured,
    };

    if (editandoId) {
      updateProduct(editandoId, produtoFinal);
      setMensagem('✅ Produto atualizado!');
    } else {
      addProduct(produtoFinal);
      setMensagem('✅ Produto adicionado!');
    }

    setForm(FORM_VAZIO);
    setEditandoId(null);
    setTimeout(() => setMensagem(''), 2500);
  }

  function handleEditar(produto) {
    setForm({
      name: produto.name,
      description: produto.description,
      image: produto.image,
      category: produto.category,
      stock: String(produto.stock || ''),
      featured: produto.featured || false,
    });
    setEditandoId(produto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelar() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
  }

  function handleExcluir(id, nome) {
    if (confirm(`Excluir "${nome}"?`)) {
      removeProduct(id);
      setMensagem('🗑️ Produto excluído');
      setTimeout(() => setMensagem(''), 2500);
    }
  }

  if (!logado) {
    return (
      <>
        <Header />
        <main className="admin-login">
          <form className="admin-login-box" onSubmit={handleLogin}>
            <span className="admin-login-emoji">🔐</span>
            <h1>Painel Admin</h1>
            <p>Digite a senha pra gerenciar produtos</p>

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoFocus
            />

            {erroSenha && <span className="admin-erro">{erroSenha}</span>}

            <button type="submit" className="admin-btn-primary">
              Entrar
            </button>

            <Link to="/" className="admin-login-voltar">
              ← Voltar ao catálogo
            </Link>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="admin">
        <div className="admin-head">
          <div>
            <h1>Painel de produtos 🛠️</h1>
            <p>Gerencie o catálogo do Cantinho da Lanna</p>
          </div>
          <Link to="/produtos" className="admin-btn-ver">
            Ver catálogo →
          </Link>
        </div>

        {mensagem && <div className="admin-mensagem">{mensagem}</div>}

        <section className="admin-form-section">
          <h2>{editandoId ? '✏️ Editar produto' : '➕ Novo produto'}</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-grid">
              <label className="admin-field admin-field-wide">
                <span>Nome do produto *</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Caderno Floral"
                />
              </label>

              <label className="admin-field">
                <span>Categoria *</span>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Ex: Cadernos"
                  list="categorias-existentes"
                />
                <datalist id="categorias-existentes">
                  {categories
                    .filter((c) => c !== 'Todos')
                    .map((c) => (
                      <option key={c} value={c} />
                    ))}
                </datalist>
              </label>

              <label className="admin-field">
                <span>Estoque (opcional)</span>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Ex: 20"
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>URL da imagem</span>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>Descrição</span>
                <textarea
                  rows="3"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descreva o produto..."
                />
              </label>

              <label className="admin-check admin-field-wide">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                <span>⭐ Marcar como destaque</span>
              </label>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary">
                {editandoId ? '💾 Salvar alterações' : '➕ Adicionar produto'}
              </button>

              {editandoId && (
                <button
                  type="button"
                  className="admin-btn-secundario"
                  onClick={handleCancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-lista-section">
          <div className="admin-lista-head">
            <h2>📦 Produtos cadastrados ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <p className="admin-vazio">Nenhum produto cadastrado ainda 😢</p>
          ) : (
            <div className="admin-lista">
              {products.map((p) => (
                <article key={p.id} className="admin-item">
                  <img src={p.image} alt={p.name} />

                  <div className="admin-item-info">
                    <span className="admin-item-cat">{p.category}</span>
                    <strong>{p.name}</strong>
                    {p.featured && <span className="admin-item-destaque">✨ Destaque</span>}
                  </div>

                  <div className="admin-item-acoes">
                    <button
                      className="admin-btn-editar"
                      onClick={() => handleEditar(p)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="admin-btn-excluir"
                      onClick={() => handleExcluir(p.id, p.name)}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}