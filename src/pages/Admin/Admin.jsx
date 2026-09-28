import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { Header } from '../../components/Header/Header';
import { Calculadora } from '../../components/Calculadora/Calculadora';
import { ProductCard } from '../../components/ProductCard/ProductCard';
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
  custoMateriais: '',
  horasTrabalho: '',
  custosExtras: '',
  margemLucro: '100',
  precoManual: '',
};

const ORCAMENTO_VAZIO = {
  nome: '',
  cliente: '',
  custoMateriais: '',
  horasTrabalho: '',
  custosExtras: '',
  margemLucro: '100',
  precoManual: '',
  observacoes: '',
};

const STORAGE_KEY = 'cantinho-admin-logado';

export function Admin() {
  const [logado, setLogado] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('produtos');

  const {
    products,
    categories,
    pricing,
    orcamentos,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    removeCategory,
    atualizarPricing,
    addOrcamento,
    removeOrcamento,
  } = useProducts();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [valorHoraInput, setValorHoraInput] = useState('25');
  const [mostrarPreview, setMostrarPreview] = useState(true);

  // Calculadora de orçamento
  const [orcamento, setOrcamento] = useState(ORCAMENTO_VAZIO);

  useEffect(() => {
    if (pricing?.valorHora) {
      setValorHoraInput(String(pricing.valorHora));
    }
  }, [pricing?.valorHora]);

  useEffect(() => {
    if (logado) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [logado]);

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

  // === CÁLCULOS ===
  function calcular(dados) {
    const custo = parseFloat(dados.custoMateriais) || 0;
    const horas = parseFloat(dados.horasTrabalho) || 0;
    const extras = parseFloat(dados.custosExtras) || 0;
    const margem = parseFloat(dados.margemLucro) || 0;
    const valorHora = pricing?.valorHora || 25;
    const manual = parseFloat(dados.precoManual);

    const custoMaoDeObra = horas * valorHora;
    const custoTotal = custo + custoMaoDeObra + extras;
    const precoCalculado = custoTotal * (1 + margem / 100);
    const precoFinal = manual > 0 ? manual : precoCalculado;
    const lucro = precoFinal - custoTotal;

    return {
      custoMaoDeObra,
      custoTotal,
      precoCalculado,
      precoFinal,
      lucro,
    };
  }

  const calcProduto = calcular(form);
  const calcOrcamento = calcular(orcamento);

  // === PREVIEW DO PRODUTO ===
  const produtoPreview = {
    id: 'preview',
    name: form.name || 'Nome do produto',
    description: form.description || 'Descrição do produto',
    category: form.category || 'Categoria',
    images: form.images,
    image: form.images[0] || '',
    featured: form.featured,
  };

  // === LOGIN ===
  function handleLogin(e) {
    e.preventDefault();
    if (senha === ADMIN_PASSWORD) {
      setLogado(true);
      setErroSenha('');
      setSenha('');
    } else {
      setErroSenha('Senha incorreta 😢');
    }
  }

  function handleLogout() {
    if (confirm('Sair do painel admin?')) {
      setLogado(false);
      setSenha('');
    }
  }

  // === PRODUTOS ===
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

  function handleSubmitProduto(e) {
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
      custoMateriais: parseFloat(form.custoMateriais) || 0,
      horasTrabalho: parseFloat(form.horasTrabalho) || 0,
      custosExtras: parseFloat(form.custosExtras) || 0,
      margemLucro: parseFloat(form.margemLucro) || 0,
      precoManual: form.precoManual ? parseFloat(form.precoManual) : null,
      precoSugerido: parseFloat(calcProduto.precoFinal.toFixed(2)),
      lucro: parseFloat(calcProduto.lucro.toFixed(2)),
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

  function handleEditarProduto(produto) {
    setForm({
      name: produto.name,
      description: produto.description,
      images: produto.images || (produto.image ? [produto.image] : []),
      category: produto.category,
      stock: String(produto.stock || ''),
      featured: produto.featured || false,
      custoMateriais: String(produto.custoMateriais || ''),
      horasTrabalho: String(produto.horasTrabalho || ''),
      custosExtras: String(produto.custosExtras || ''),
      margemLucro: String(produto.margemLucro ?? 100),
      precoManual: produto.precoManual ? String(produto.precoManual) : '',
    });
    setEditandoId(produto.id);
    setAbaAtiva('produtos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelarProduto() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
  }

  function handleExcluirProduto(id, nome) {
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

  // === PRICING ===
  function handleSalvarValorHora() {
    const valor = parseFloat(valorHoraInput);
    if (!valor || valor <= 0) {
      setMensagem('⚠️ Digite um valor válido');
      return;
    }
    atualizarPricing({ valorHora: valor });
    setMensagem('✅ Valor da hora atualizado!');
    setTimeout(() => setMensagem(''), 2000);
  }

  // === ORÇAMENTOS ===
  function handleChangeOrcamento(e) {
    const { name, value } = e.target;
    setOrcamento((prev) => ({ ...prev, [name]: value }));
  }

  function handleSalvarOrcamento(e) {
    e.preventDefault();
    if (!orcamento.nome.trim()) {
      setMensagem('⚠️ Dê um nome pro orçamento');
      return;
    }

    const novo = {
      nome: orcamento.nome.trim(),
      cliente: orcamento.cliente.trim(),
      custoMateriais: parseFloat(orcamento.custoMateriais) || 0,
      horasTrabalho: parseFloat(orcamento.horasTrabalho) || 0,
      custosExtras: parseFloat(orcamento.custosExtras) || 0,
      margemLucro: parseFloat(orcamento.margemLucro) || 0,
      precoManual: orcamento.precoManual ? parseFloat(orcamento.precoManual) : null,
      precoFinal: parseFloat(calcOrcamento.precoFinal.toFixed(2)),
      custoTotal: parseFloat(calcOrcamento.custoTotal.toFixed(2)),
      lucro: parseFloat(calcOrcamento.lucro.toFixed(2)),
      observacoes: orcamento.observacoes.trim(),
    };

    addOrcamento(novo);
    setOrcamento(ORCAMENTO_VAZIO);
    setMensagem('✅ Orçamento salvo!');
    setTimeout(() => setMensagem(''), 2500);
  }

  function handleExcluirOrcamento(id, nome) {
    if (confirm(`Excluir orçamento "${nome}"?`)) {
      removeOrcamento(id);
      setMensagem('🗑️ Orçamento excluído');
      setTimeout(() => setMensagem(''), 2000);
    }
  }

  function formatarData(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <h1>Painel Admin 🛠️</h1>
            <p>Gerencie produtos, categorias e orçamentos</p>
          </div>
          <div className="admin-head-actions">
            <Link to="/produtos" className="admin-btn-ver">
              Ver catálogo →
            </Link>
            <button className="admin-btn-sair" onClick={handleLogout}>
              🚪 Sair
            </button>
          </div>
        </div>

        {mensagem && <div className="admin-mensagem">{mensagem}</div>}

        {/* === ABAS === */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${abaAtiva === 'produtos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('produtos')}
          >
            📦 Produtos
            <span className="admin-tab-count">{products.length}</span>
          </button>
          <button
            className={`admin-tab ${abaAtiva === 'categorias' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('categorias')}
          >
            📂 Categorias
            <span className="admin-tab-count">
              {categories.filter((c) => c !== 'Todos').length}
            </span>
          </button>
          <button
            className={`admin-tab ${abaAtiva === 'precificacao' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('precificacao')}
          >
            💰 Precificação
            <span className="admin-tab-count">{orcamentos.length}</span>
          </button>
        </div>

        {/* ================= ABA PRODUTOS ================= */}
        {abaAtiva === 'produtos' && (
          <>
            <div className="admin-form-with-preview">
              <section className="admin-form-section">
                <div className="admin-form-header">
                  <h2>{editandoId ? '✏️ Editar produto' : '➕ Novo produto'}</h2>
                  <button
                    type="button"
                    className="admin-preview-toggle"
                    onClick={() => setMostrarPreview(!mostrarPreview)}
                  >
                    {mostrarPreview ? '🙈 Esconder preview' : '👁️ Mostrar preview'}
                  </button>
                </div>

                <form className="admin-form" onSubmit={handleSubmitProduto}>
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
                              {i === 0 && (
                                <span className="admin-image-principal">Principal</span>
                              )}
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

                  {/* Precificação do produto */}
                  <div className="admin-pricing-section">
                    <h3>💵 Precificação (só você vê)</h3>
                    <p className="admin-pricing-subtitle">
                      Preencha os custos e o sistema calcula o preço justo.
                    </p>

                    <div className="admin-grid">
                      <label className="admin-field">
                        <span>Custo dos materiais (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          name="custoMateriais"
                          value={form.custoMateriais}
                          onChange={handleChange}
                          placeholder="Ex: 15.50"
                        />
                      </label>

                      <label className="admin-field">
                        <span>Horas de trabalho</span>
                        <input
                          type="number"
                          step="0.1"
                          name="horasTrabalho"
                          value={form.horasTrabalho}
                          onChange={handleChange}
                          placeholder="Ex: 2"
                        />
                      </label>

                      <label className="admin-field">
                        <span>Custos extras (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          name="custosExtras"
                          value={form.custosExtras}
                          onChange={handleChange}
                          placeholder="Embalagem, frete..."
                        />
                      </label>

                      <label className="admin-field">
                        <span>Margem de lucro (%)</span>
                        <input
                          type="number"
                          step="1"
                          name="margemLucro"
                          value={form.margemLucro}
                          onChange={handleChange}
                          placeholder="Ex: 100"
                        />
                      </label>

                      <label className="admin-field admin-field-wide">
                        <span>Preço fixo (opcional)</span>
                        <input
                          type="number"
                          step="0.01"
                          name="precoManual"
                          value={form.precoManual}
                          onChange={handleChange}
                          placeholder="Deixe vazio pra usar o preço calculado"
                        />
                      </label>
                    </div>

                    {(form.custoMateriais || form.horasTrabalho || form.custosExtras) && (
                      <div className="admin-pricing-preview">
                        <div className="admin-pricing-preview-row">
                          <span>
                            Mão de obra ({form.horasTrabalho || 0}h × R${' '}
                            {pricing?.valorHora || 25})
                          </span>
                          <strong>R$ {calcProduto.custoMaoDeObra.toFixed(2)}</strong>
                        </div>
                        <div className="admin-pricing-preview-row">
                          <span>Custo total</span>
                          <strong>R$ {calcProduto.custoTotal.toFixed(2)}</strong>
                        </div>
                        <div className="admin-pricing-preview-row">
                          <span>Lucro ({form.margemLucro || 0}%)</span>
                          <strong>R$ {calcProduto.lucro.toFixed(2)}</strong>
                        </div>
                        <div className="admin-pricing-preview-total">
                          <span>💰 Preço final</span>
                          <strong>R$ {calcProduto.precoFinal.toFixed(2)}</strong>
                        </div>
                      </div>
                    )}
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
                        onClick={handleCancelarProduto}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Preview do produto */}
              {mostrarPreview && (
                <aside className="admin-preview-panel">
                  <div className="admin-preview-header">
                    <span className="admin-preview-badge">👁️ Preview</span>
                    <small>Como vai aparecer no site</small>
                  </div>

                  <div className="admin-preview-cardwrap">
                    <div className="admin-preview-label">
                      <span>📱 No celular</span>
                    </div>
                    <div className="admin-preview-phone">
                      <ProductCard product={produtoPreview} />
                    </div>
                  </div>

                  <div className="admin-preview-info">
                    <p>💡 Preencha os campos e veja em tempo real como fica.</p>
                  </div>
                </aside>
              )}
            </div>

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
                    const precoFinal = p.precoManual || p.precoSugerido;

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
                          {precoFinal > 0 && (
                            <span className="admin-item-preco">
                              💰 R$ {precoFinal.toFixed(2)}
                              {p.lucro > 0 && (
                                <small> · lucro R$ {p.lucro.toFixed(2)}</small>
                              )}
                            </span>
                          )}
                          {p.featured && (
                            <span className="admin-item-destaque">✨ Destaque</span>
                          )}
                        </div>

                        <div className="admin-item-acoes">
                          <button
                            className="admin-btn-editar"
                            onClick={() => handleEditarProduto(p)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="admin-btn-excluir"
                            onClick={() => handleExcluirProduto(p.id, p.name)}
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
          </>
        )}

        {/* ================= ABA CATEGORIAS ================= */}
        {abaAtiva === 'categorias' && (
          <section className="admin-form-section">
            <h2>📂 Gerenciar categorias</h2>
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
                    const totalProdutos = products.filter(
                      (p) => p.category === cat
                    ).length;

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
        )}

        {/* ================= ABA PRECIFICAÇÃO ================= */}
        {abaAtiva === 'precificacao' && (
          <>
            <section className="admin-duo">
              <div className="admin-form-section admin-pricing-config">
                <h2>⚙️ Valor da sua hora</h2>
                <p className="admin-hint">
                  Defina quanto vale a sua hora de trabalho. Esse valor será
                  usado em todos os cálculos.
                </p>

                <div className="admin-pricing-config-row">
                  <label className="admin-field">
                    <span>Valor da hora (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={valorHoraInput}
                      onChange={(e) => setValorHoraInput(e.target.value)}
                      placeholder="Ex: 25.00"
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={handleSalvarValorHora}
                  >
                    💾 Salvar
                  </button>
                </div>

                <p className="admin-pricing-hint">
                  💡 Valor atual:{' '}
                  <strong>
                    R$ {pricing?.valorHora?.toFixed(2) || '25.00'}/hora
                  </strong>
                </p>
              </div>

              <div className="admin-form-section">
                <h2>🖩 Calculadora rápida</h2>
                <p className="admin-hint">
                  Faça contas rápidas antes de preencher o orçamento.
                </p>
                <Calculadora />
              </div>
            </section>

            <section className="admin-form-section">
              <h2>🧮 Calculadora de orçamento</h2>
              <p className="admin-hint">
                Precifique qualquer coisa: um pedido personalizado, uma
                encomenda, um kit...
              </p>

              <form className="admin-form" onSubmit={handleSalvarOrcamento}>
                <div className="admin-grid">
                  <label className="admin-field">
                    <span>Nome do item/projeto *</span>
                    <input
                      type="text"
                      name="nome"
                      value={orcamento.nome}
                      onChange={handleChangeOrcamento}
                      placeholder="Ex: Topo de bolo personalizado"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Cliente (opcional)</span>
                    <input
                      type="text"
                      name="cliente"
                      value={orcamento.cliente}
                      onChange={handleChangeOrcamento}
                      placeholder="Nome da cliente"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Custo dos materiais (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="custoMateriais"
                      value={orcamento.custoMateriais}
                      onChange={handleChangeOrcamento}
                      placeholder="Ex: 15.50"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Horas de trabalho</span>
                    <input
                      type="number"
                      step="0.1"
                      name="horasTrabalho"
                      value={orcamento.horasTrabalho}
                      onChange={handleChangeOrcamento}
                      placeholder="Ex: 2"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Custos extras (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="custosExtras"
                      value={orcamento.custosExtras}
                      onChange={handleChangeOrcamento}
                      placeholder="Embalagem, frete..."
                    />
                  </label>

                  <label className="admin-field">
                    <span>Margem de lucro (%)</span>
                    <input
                      type="number"
                      step="1"
                      name="margemLucro"
                      value={orcamento.margemLucro}
                      onChange={handleChangeOrcamento}
                      placeholder="Ex: 100"
                    />
                  </label>

                  <label className="admin-field">
                    <span>Preço fixo (opcional)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="precoManual"
                      value={orcamento.precoManual}
                      onChange={handleChangeOrcamento}
                      placeholder="Deixe vazio pro calculado"
                    />
                  </label>

                  <label className="admin-field admin-field-wide">
                    <span>Observações</span>
                    <textarea
                      rows="2"
                      name="observacoes"
                      value={orcamento.observacoes}
                      onChange={handleChangeOrcamento}
                      placeholder="Detalhes do pedido, prazo, etc..."
                    />
                  </label>
                </div>

                {(orcamento.custoMateriais ||
                  orcamento.horasTrabalho ||
                  orcamento.custosExtras) && (
                  <div className="admin-pricing-preview">
                    <div className="admin-pricing-preview-row">
                      <span>
                        Mão de obra ({orcamento.horasTrabalho || 0}h × R${' '}
                        {pricing?.valorHora || 25})
                      </span>
                      <strong>R$ {calcOrcamento.custoMaoDeObra.toFixed(2)}</strong>
                    </div>
                    <div className="admin-pricing-preview-row">
                      <span>Custo total</span>
                      <strong>R$ {calcOrcamento.custoTotal.toFixed(2)}</strong>
                    </div>
                    <div className="admin-pricing-preview-row">
                      <span>Lucro ({orcamento.margemLucro || 0}%)</span>
                      <strong>R$ {calcOrcamento.lucro.toFixed(2)}</strong>
                    </div>
                    <div className="admin-pricing-preview-total">
                      <span>💰 Preço final</span>
                      <strong>R$ {calcOrcamento.precoFinal.toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn-primary">
                    💾 Salvar orçamento
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secundario"
                    onClick={() => setOrcamento(ORCAMENTO_VAZIO)}
                  >
                    Limpar
                  </button>
                </div>
              </form>
            </section>

            <section className="admin-lista-section">
              <div className="admin-lista-head">
                <h2>📋 Orçamentos salvos ({orcamentos.length})</h2>
              </div>

              {orcamentos.length === 0 ? (
                <p className="admin-vazio">
                  Nenhum orçamento salvo ainda 😢
                </p>
              ) : (
                <div className="admin-lista">
                  {orcamentos.map((o) => (
                    <article key={o.id} className="admin-item admin-orcamento-item">
                      <div className="admin-orcamento-icon">💰</div>

                      <div className="admin-item-info">
                        <strong>{o.nome}</strong>
                        {o.cliente && (
                          <span className="admin-orcamento-cliente">
                            👤 {o.cliente}
                          </span>
                        )}
                        <span className="admin-item-preco">
                          R$ {o.precoFinal?.toFixed(2)}
                          {o.lucro > 0 && (
                            <small> · lucro R$ {o.lucro.toFixed(2)}</small>
                          )}
                        </span>
                        {o.observacoes && (
                          <span className="admin-orcamento-obs">
                            📝 {o.observacoes}
                          </span>
                        )}
                        <span className="admin-orcamento-data">
                          🕐 {formatarData(o.criadoEm)}
                        </span>
                      </div>

                      <div className="admin-item-acoes">
                        <button
                          className="admin-btn-excluir"
                          onClick={() => handleExcluirOrcamento(o.id, o.nome)}
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
          </>
        )}
      </main>
    </>
  );
}