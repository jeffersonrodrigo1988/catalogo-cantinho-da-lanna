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
  price: '',
  image: '',
  category: '',
  stock: '',
  featured: false,
};

export function Admin() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const {
    products,
    categories,
    addProduct,
    updateProduct,
    removeProduct,
    resetarProdutos,
    exportarProdutos,
    importarProdutos,
  } = useProducts();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [mostrarPublicar, setMostrarPublicar] = useState(false);

  // 🔒 BLOQUEIO: só funciona no Tauri
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

    if (!form.name || !form.category || !form.price) {
      setMensagem('⚠️ Preencha nome, categoria e preço');
      return;
    }

    const produtoFinal = {
      name: form.name.trim(),
      description: form.description.trim() || 'Produto do Cantinho da Lanna 💕',
      price: parseFloat(form.price),
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
      price: String(produto.price),
      image: produto.image,
      category: produto.category,
      stock: String(produto.stock),
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

  function handleImportar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importarProdutos(ev.target.result);
      if (result.ok) {
        setMensagem('✅ Produtos importados!');
      } else {
        setMensagem('❌ Erro: ' + result.erro);
      }
      setTimeout(() => setMensagem(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Gera o código pronto pra colar em src/data/products.js
  function gerarCodigoProducts() {
    const cats = [...new Set(products.map((p) => p.category))];
    const linhas = [];

    linhas.push(`export const categories = [`);
    linhas.push(`  'Todos',`);
    cats.forEach((c) => linhas.push(`  '${c}',`));
    linhas.push(`];`);
    linhas.push(``);
    linhas.push(`export const products = [`);

    products.forEach((p) => {
      linhas.push(`  {`);
      linhas.push(`    id: '${p.id}',`);
      linhas.push(`    name: '${p.name.replace(/'/g, "\\'")}',`);
      linhas.push(`    description: '${p.description.replace(/'/g, "\\'")}',`);
      linhas.push(`    price: ${p.price},`);
      linhas.push(`    image: '${p.image}',`);
      linhas.push(`    category: '${p.category}',`);
      linhas.push(`    stock: ${p.stock},`);
      if (p.featured) linhas.push(`    featured: true,`);
      linhas.push(`  },`);
    });

    linhas.push(`];`);
    return linhas.join('\n');
  }

  async function copiarCodigo() {
    const codigo = gerarCodigoProducts();
    try {
      await navigator.clipboard.writeText(codigo);
      setMensagem('✅ Código copiado! Cole em src/data/products.js');
    } catch {
      setMensagem('❌ Não foi possível copiar automaticamente');
    }
    setTimeout(() => setMensagem(''), 4000);
  }

  // ===== TELA DE LOGIN =====
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

  // ===== PAINEL =====
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

        {/* Ações rápidas */}
        <div className="admin-acoes">
          <button
            className="admin-btn-publicar"
            onClick={() => setMostrarPublicar(true)}
          >
            🌐 Publicar no site
          </button>
          <button className="admin-btn-secundario" onClick={exportarProdutos}>
            📥 Exportar JSON
          </button>
          <label className="admin-btn-secundario">
            📤 Importar JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportar}
              style={{ display: 'none' }}
            />
          </label>
          <button className="admin-btn-perigo" onClick={resetarProdutos}>
            🔄 Resetar produtos
          </button>
        </div>

        {/* Formulário */}
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
                <span>Preço (R$) *</span>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ex: 34.90"
                />
              </label>

              <label className="admin-field">
                <span>Estoque</span>
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

        {/* Lista */}
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
                    <span className="admin-item-price">R$ {p.price.toFixed(2)}</span>
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

      {/* Modal de publicar */}
      {mostrarPublicar && (
        <div className="admin-modal-overlay" onClick={() => setMostrarPublicar(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>🌐 Publicar no site</h2>
              <button
                className="admin-modal-close"
                onClick={() => setMostrarPublicar(false)}
              >
                ✕
              </button>
            </div>

            <p className="admin-modal-desc">
              Pra atualizar o catálogo online, siga esses passos:
            </p>

            <ol className="admin-modal-passos">
              <li>
                Clique em <strong>Copiar código</strong> abaixo
              </li>
              <li>
                No VS Code, abra <code>src/data/products.js</code>
              </li>
              <li>
                Apague <strong>tudo</strong> e cole o código novo
              </li>
              <li>
                Salve (<kbd>Ctrl + S</kbd>)
              </li>
              <li>
                No terminal, rode <code>vercel --prod</code>
              </li>
            </ol>

            <div className="admin-modal-actions">
              <button className="admin-btn-primary" onClick={copiarCodigo}>
                📋 Copiar código
              </button>
              <button
                className="admin-btn-secundario"
                onClick={() => setMostrarPublicar(false)}
              >
                Fechar
              </button>
            </div>

            <details className="admin-modal-preview">
              <summary>Ver código gerado ({products.length} produtos)</summary>
              <pre>{gerarCodigoProducts()}</pre>
            </details>
          </div>
        </div>
      )}
    </>
  );
}