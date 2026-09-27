import { useState } from 'react';
import { Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Header } from '../../components/Header/Header';
import { useProducts } from '../../context/ProductsContext';
import { ADMIN_PASSWORD } from '../../config';
import { isTauri } from '../../utils/tauri';
import './Admin.css';

const FORM_VAZIO = {
  name: '',
  description: '',
  images: [],
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
    customCategories,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    removeCategory,
  } = useProducts();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  // Categorias
  const [novaCategoria, setNovaCategoria] = useState('');

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

  function arquivoParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleUploadImagens(e) {
    const arquivos = Array.from(e.target.files || []);
    if (arquivos.length === 0) return;

    setEnviandoImagem(true);
    setMensagem('📤 Enviando imagens...');

    try {
      const novasUrls = [];

      for (const arquivo of arquivos) {
        if (arquivo.size > 3 * 1024 * 1024) {
          alert(`Imagem "${arquivo.name}" é muito grande (máx 3MB). Pulando.`);
          continue;
        }

        const base64 = await arquivoParaBase64(arquivo);
        const url = await invoke('upload_imagem_github', {
          nomeArquivo: arquivo.name,
          dadosBase64: base64,
        });
        novasUrls.push(url);
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...novasUrls],
      }));

      setMensagem(`✅ ${novasUrls.length} imagem(ns) enviada(s)!`);
      setTimeout(() => setMensagem(''), 2500);
    } catch (err) {
      console.error('Erro no upload:', err);
      setMensagem('❌ Erro ao enviar imagem: ' + err);
    } finally {
      setEnviandoImagem(false);
      e.target.value = '';
    }
  }

  function handleRemoverImagem(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.category) {
      setMensagem('⚠️ Preencha nome e categoria');
      return;
    }

    if (form.images.length === 0) {
      setMensagem('⚠️ Adicione pelo menos 1 imagem');
      return;
    }

    const produtoFinal = {
      name: form.name.trim(),
      description: form.description.trim() || 'Produto do Cantinho da Lanna 💕',
      images: form.images,
      image: form.images[0],
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
      images: produto.images || (produto.image ? [produto.image] : []),
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

  // === CATEGORIAS ===
  function handleAddCategoria(e) {
    e.preventDefault();
    if (!novaCategoria.trim()) return;
    addCategory(novaCategoria);
    setNovaCategoria('');
    setMensagem('✅ Categoria adicionada!');
    setTimeout(() => setMensagem(''), 2000);
  }

  function handleRemoveCategoria(nome) {
    // Checa se tem produto usando essa categoria
    const usada = products.some((p) => p.category === nome);
    if (usada) {
      alert(`Não é possível excluir "${nome}" — tem produtos usando essa categoria.`);
      return;
    }
    if (confirm(`Excluir categoria "${nome}"?`)) {
      removeCategory(nome);
      setMensagem('🗑️ Categoria excluída');
      setTimeout(() => setMensagem(''), 2000);
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

        {/* === GERENCIAR CATEGORIAS === */}
        <section className="admin-form-section">
          <h2>📂 Categorias</h2>
          <p className="admin-hint">
            Adicione as categorias que vai usar nos produtos.
          </p>

          <form className="admin-cat-add" onSubmit={handleAddCategoria}>
            <input
              type="text"
              placeholder="Nome da nova categoria (ex: Cadernos)"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />
            <button type="submit" className="admin-btn-primary">
              ➕ Adicionar
            </button>
          </form>

          {categories.filter((c) => c !== 'Todos').length === 0 ? (
            <p className="admin-vazio">Nenhuma categoria ainda 😢</p>
          ) : (
            <div className="admin-cat-list">
              {categories
                .filter((c) => c !== 'Todos')
                .map((cat) => {
                  const usada = products.some((p) => p.category === cat);
                  const totalProdutos = products.filter((p) => p.category === cat).length;

                  return (
                    <div key={cat} className="admin-cat-item">
                      <span className="admin-cat-nome">{cat}</span>
                      <span className="admin-cat-count">
                        {totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}
                      </span>
                      <button
                        className="admin-cat-remove"
                        onClick={() => handleRemoveCategoria(cat)}
                        disabled={usada}
                        title={usada ? 'Em uso' : 'Excluir'}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* === FORMULÁRIO PRODUTO === */}
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
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  {categories
                    .filter((c) => c !== 'Todos')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
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

              <div className="admin-field admin-field-wide">
                <span>Fotos do produto *</span>

                <label className="admin-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadImagens}
                    disabled={enviandoImagem}
                    style={{ display: 'none' }}
                  />
                  <div className="admin-upload-box">
                    <span className="admin-upload-emoji">
                      {enviandoImagem ? '⏳' : '📷'}
                    </span>
                    <strong>
                      {enviandoImagem
                        ? 'Enviando imagens...'
                        : 'Clique pra escolher fotos do PC'}
                    </strong>
                    <small>Pode escolher várias de uma vez (máx 3MB cada)</small>
                  </div>
                </label>

                {form.images.length > 0 && (
                  <div className="admin-images-preview">
                    {form.images.map((url, i) => (
                      <div key={i} className="admin-image-item">
                        <img src={url} alt={`Foto ${i + 1}`} />
                        {i === 0 && <span className="admin-image-principal">Principal</span>}
                        <button
                          type="button"
                          className="admin-image-remove"
                          onClick={() => handleRemoverImagem(i)}
                          title="Remover"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={enviandoImagem}
              >
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
              {products.map((p) => {
                const capa = p.images?.[0] || p.image;
                return (
                  <article key={p.id} className="admin-item">
                    <img src={capa} alt={p.name} />

                    <div className="admin-item-info">
                      <span className="admin-item-cat">{p.category}</span>
                      <strong>{p.name}</strong>
                      {p.images?.length > 1 && (
                        <span className="admin-item-fotos">
                          📷 {p.images.length} fotos
                        </span>
                      )}
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
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}