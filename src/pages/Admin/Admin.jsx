import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Calculadora } from '../../components/Calculadora/Calculadora';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { useDialog } from '../../context/DialogContext';
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
  materiaisUsados: [],
};

const ORCAMENTO_VAZIO = {
  nome: '',
  cliente: '',
  valorHora: '',
  custoMateriais: '',
  horasTrabalho: '',
  custosExtras: '',
  margemLucro: '100',
  precoManual: '',
  observacoes: '',
  materiaisUsados: [],
};

const INSUMO_VAZIO = {
  nome: '',
  precoPacote: '',
  quantidadePacote: '',
  unidade: 'un',
};

const CUSTO_FIXO_VAZIO = {
  nome: '',
  valor: '',
};

const STORAGE_KEY = 'cantinho-admin-logado';
const TOKEN_KEY = 'cantinho-github-token';

function precoUnitario(insumo) {
  if (!insumo) return 0;
  const preco = parseFloat(insumo.precoPacote) || 0;
  const qtd = parseFloat(insumo.quantidadePacote) || 1;
  if (qtd <= 0) return preco;
  return preco / qtd;
}

export function Admin() {
  const { confirmar, notificar } = useDialog();

  const [logado, setLogado] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('produtos');

  // Token (só pra Chrome/navegador)
  const [tokenInput, setTokenInput] = useState('');
  const [precisaToken, setPrecisaToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (isTauri()) return false;
    return !localStorage.getItem(TOKEN_KEY);
  });

  const {
    products,
    categories,
    pricing,
    orcamentos,
    insumos,
    custosFixos,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    removeCategory,
    atualizarPricing,
    addOrcamento,
    updateOrcamento,
    removeOrcamento,
    addInsumo,
    updateInsumo,
    removeInsumo,
    atualizarCustosFixos,
    addCustoFixo,
    removeCustoFixo,
  } = useProducts();

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarPreview, setMostrarPreview] = useState(true);

  const [orcamento, setOrcamento] = useState(ORCAMENTO_VAZIO);
  const [editandoOrcamentoId, setEditandoOrcamentoId] = useState(null);
  const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);

  const [novoInsumo, setNovoInsumo] = useState(INSUMO_VAZIO);
  const [editandoInsumoId, setEditandoInsumoId] = useState(null);
  const [novoCustoFixo, setNovoCustoFixo] = useState(CUSTO_FIXO_VAZIO);
  const [horasPorMesInput, setHorasPorMesInput] = useState('160');

  const custoFixoTotal = custosFixos.itens.reduce(
    (acc, item) => acc + (parseFloat(item.valor) || 0),
    0
  );
  const horasMes = parseFloat(custosFixos.horasPorMes) || 160;
  const custoFixoPorHora = horasMes > 0 ? custoFixoTotal / horasMes : 0;

  useEffect(() => {
    if (custosFixos?.horasPorMes) {
      setHorasPorMesInput(String(custosFixos.horasPorMes));
    }
  }, [custosFixos?.horasPorMes]);

  useEffect(() => {
    if (pricing?.valorHora && !editandoOrcamentoId && !orcamento.valorHora) {
      setOrcamento((prev) => ({
        ...prev,
        valorHora: String(pricing.valorHora),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing?.valorHora]);

  useEffect(() => {
    if (logado) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [logado]);

  useEffect(() => {
    if (modalOrcamentoAberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOrcamentoAberto]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && modalOrcamentoAberto) {
        fecharModalOrcamento();
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOrcamentoAberto]);

  // === TELA DE TOKEN (só no navegador, primeira vez) ===
  if (precisaToken) {
    return (
      <>
        <Header />
        <main className="admin-login">
          <form
            className="admin-login-box"
            onSubmit={(e) => {
              e.preventDefault();
              const t = tokenInput.trim();
              if (!t || !t.startsWith('gh')) {
                notificar('Token inválido. Precisa começar com "gh"', 'erro');
                return;
              }
              localStorage.setItem(TOKEN_KEY, t);
              setPrecisaToken(false);
              notificar('Token salvo! Bem-vinda 💜', 'sucesso');
            }}
          >
            <span className="admin-login-emoji">🔑</span>
            <h1>Token do GitHub</h1>
            <p>
              Cole seu token pra autorizar este PC.
              <br />
              <small>(Só precisa fazer isso uma vez)</small>
            </p>

            <input
              type="password"
              placeholder="github_pat_..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoFocus
            />

            <button type="submit" className="admin-btn-primary">
              Salvar token
            </button>

            <Link to="/" className="admin-login-voltar">
              ← Voltar ao catálogo
            </Link>
          </form>
        </main>
      </>
    );
  }

  function calcularMateriaisUsados(materiaisUsados) {
    if (!materiaisUsados || materiaisUsados.length === 0) return 0;
    return materiaisUsados.reduce((acc, m) => {
      const insumo = insumos.find((i) => i.id === m.insumoId);
      if (!insumo) return acc;
      const unitario = precoUnitario(insumo);
      const qtd = parseFloat(m.quantidade) || 0;
      return acc + unitario * qtd;
    }, 0);
  }

  function calcular(dados, valorHoraCustom) {
    const custoManual = parseFloat(dados.custoMateriais) || 0;
    const custoInsumos = calcularMateriaisUsados(dados.materiaisUsados);
    const custo = custoManual + custoInsumos;
    const horas = parseFloat(dados.horasTrabalho) || 0;
    const extras = parseFloat(dados.custosExtras) || 0;
    const margem = parseFloat(dados.margemLucro) || 0;
    const manual = parseFloat(dados.precoManual);
    const valorHoraBase =
      valorHoraCustom !== undefined && valorHoraCustom !== ''
        ? parseFloat(valorHoraCustom) || 0
        : pricing?.valorHora || 25;
    const valorHora = valorHoraBase + custoFixoPorHora;

    const custoMaoDeObra = horas * valorHora;
    const custoTotal = custo + custoMaoDeObra + extras;
    const precoCalculado = custoTotal * (1 + margem / 100);
    const precoFinal = manual > 0 ? manual : precoCalculado;
    const lucro = precoFinal - custoTotal;

    return {
      valorHora,
      valorHoraBase,
      custoFixoPorHora,
      custoManual,
      custoInsumos,
      custoMateriaisTotal: custo,
      custoMaoDeObra,
      custoTotal,
      precoCalculado,
      precoFinal,
      lucro,
    };
  }

  const calcProduto = calcular(form);
  const calcOrcamento = calcular(orcamento, orcamento.valorHora);

  const produtoPreview = {
    id: 'preview',
    name: form.name || 'Nome do produto',
    description: form.description || 'Descrição do produto',
    category: form.category || 'Categoria',
    images: form.images,
    image: form.images[0] || '',
    featured: form.featured,
  };

  function handleLogin(e) {
    e.preventDefault();
    if (senha === ADMIN_PASSWORD) {
      setLogado(true);
      setErroSenha('');
      setSenha('');
      notificar('Bem-vinda de volta! 💜', 'sucesso');
    } else {
      setErroSenha('Senha incorreta 😢');
      notificar('Senha incorreta', 'erro');
    }
  }

  async function handleLogout() {
    const ok = await confirmar({
      titulo: 'Sair do painel?',
      mensagem: 'Você vai precisar digitar a senha novamente pra voltar.',
      textoConfirmar: 'Sair',
      textoCancelar: 'Ficar',
      icone: '🚪',
    });
    if (ok) {
      setLogado(false);
      setSenha('');
      notificar('Você saiu do painel', 'info');
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

    if (!isTauri()) {
      notificar('Upload de imagem só funciona no app do PC', 'aviso');
      return;
    }

    setEnviandoImagem(true);
    notificar('Enviando imagens...', 'info');

    try {
      const novasUrls = [];

      for (const arquivo of arquivos) {
        if (arquivo.size > 3 * 1024 * 1024) {
          notificar(`Imagem "${arquivo.name}" é muito grande (máx 3MB)`, 'aviso');
          continue;
        }

        const base64 = await arquivoParaBase64(arquivo);
const { invoke } = await import(/* @vite-ignore */ '@tauri-apps/api/core');
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

      notificar(`${novasUrls.length} imagem(ns) enviada(s)!`, 'sucesso');
    } catch (err) {
      console.error('Erro no upload:', err);
      notificar('Erro ao enviar imagem: ' + err, 'erro');
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

  function handleAddMaterialUsado(target, insumoId) {
    const setter = target === 'produto' ? setForm : setOrcamento;
    setter((prev) => ({
      ...prev,
      materiaisUsados: [
        ...(prev.materiaisUsados || []),
        { insumoId, quantidade: 1 },
      ],
    }));
  }

  function handleChangeMaterialUsado(target, index, campo, valor) {
    const setter = target === 'produto' ? setForm : setOrcamento;
    setter((prev) => {
      const lista = [...(prev.materiaisUsados || [])];
      lista[index] = { ...lista[index], [campo]: valor };
      return { ...prev, materiaisUsados: lista };
    });
  }

  function handleRemoveMaterialUsado(target, index) {
    const setter = target === 'produto' ? setForm : setOrcamento;
    setter((prev) => ({
      ...prev,
      materiaisUsados: (prev.materiaisUsados || []).filter((_, i) => i !== index),
    }));
  }

  function handleSubmitProduto(e) {
    e.preventDefault();

    if (!form.name || !form.category) {
      notificar('Preencha nome e categoria', 'aviso');
      return;
    }

    if (form.images.length === 0) {
      notificar('Adicione pelo menos 1 imagem', 'aviso');
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
      materiaisUsados: form.materiaisUsados || [],
      horasTrabalho: parseFloat(form.horasTrabalho) || 0,
      custosExtras: parseFloat(form.custosExtras) || 0,
      margemLucro: parseFloat(form.margemLucro) || 0,
      precoManual: form.precoManual ? parseFloat(form.precoManual) : null,
      precoSugerido: parseFloat(calcProduto.precoFinal.toFixed(2)),
      lucro: parseFloat(calcProduto.lucro.toFixed(2)),
    };

    if (editandoId) {
      updateProduct(editandoId, produtoFinal);
      notificar('Produto atualizado!', 'sucesso');
    } else {
      addProduct(produtoFinal);
      notificar('Produto adicionado!', 'sucesso');
    }

    setForm(FORM_VAZIO);
    setEditandoId(null);
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
      materiaisUsados: produto.materiaisUsados || [],
      horasTrabalho: String(produto.horasTrabalho || ''),
      custosExtras: String(produto.custosExtras || ''),
      margemLucro: String(produto.margemLucro ?? 100),
      precoManual: produto.precoManual ? String(produto.precoManual) : '',
    });
    setEditandoId(produto.id);
    setAbaAtiva('produtos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notificar('Editando: ' + produto.name, 'info');
  }

  function handleCancelarProduto() {
    setForm(FORM_VAZIO);
    setEditandoId(null);
  }

  async function handleExcluirProduto(id, nome) {
    const ok = await confirmar({
      titulo: 'Excluir produto?',
      mensagem: `Tem certeza que quer excluir "${nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeProduct(id);
      notificar('Produto excluído', 'sucesso');
    }
  }

  function handleAddCategoria(e) {
    e.preventDefault();
    if (!novaCategoria.trim()) return;
    addCategory(novaCategoria);
    notificar('Categoria adicionada!', 'sucesso');
    setNovaCategoria('');
  }

  async function handleRemoveCategoria(nome) {
    const usada = products.some((p) => p.category === nome);
    if (usada) {
      notificar(`Não é possível excluir "${nome}" — tem produtos usando`, 'aviso');
      return;
    }
    const ok = await confirmar({
      titulo: 'Excluir categoria?',
      mensagem: `Quer mesmo excluir a categoria "${nome}"?`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeCategory(nome);
      notificar('Categoria excluída', 'sucesso');
    }
  }

  function handleChangeOrcamento(e) {
    const { name, value } = e.target;
    setOrcamento((prev) => ({ ...prev, [name]: value }));
  }

  function handleSalvarOrcamento(e) {
    e.preventDefault();
    if (!orcamento.nome.trim()) {
      notificar('Dê um nome pro orçamento', 'aviso');
      return;
    }

    const valorHoraFinal =
      orcamento.valorHora !== '' && orcamento.valorHora !== undefined
        ? parseFloat(orcamento.valorHora) || 0
        : pricing?.valorHora || 25;

    const dados = {
      nome: orcamento.nome.trim(),
      cliente: orcamento.cliente.trim(),
      valorHora: valorHoraFinal,
      custoMateriais: parseFloat(orcamento.custoMateriais) || 0,
      materiaisUsados: orcamento.materiaisUsados || [],
      horasTrabalho: parseFloat(orcamento.horasTrabalho) || 0,
      custosExtras: parseFloat(orcamento.custosExtras) || 0,
      margemLucro: parseFloat(orcamento.margemLucro) || 0,
      precoManual: orcamento.precoManual ? parseFloat(orcamento.precoManual) : null,
      precoFinal: parseFloat(calcOrcamento.precoFinal.toFixed(2)),
      custoTotal: parseFloat(calcOrcamento.custoTotal.toFixed(2)),
      lucro: parseFloat(calcOrcamento.lucro.toFixed(2)),
      observacoes: orcamento.observacoes.trim(),
    };

    if (editandoOrcamentoId) {
      updateOrcamento(editandoOrcamentoId, dados);
      notificar('Orçamento atualizado!', 'sucesso');
      fecharModalOrcamento();
    } else {
      addOrcamento(dados);
      if (valorHoraFinal > 0) {
        atualizarPricing({ valorHora: valorHoraFinal });
      }
      notificar('Orçamento salvo!', 'sucesso');
      setOrcamento({ ...ORCAMENTO_VAZIO, valorHora: String(valorHoraFinal) });
    }
  }

  function handleEditarOrcamento(o) {
    setOrcamento({
      nome: o.nome || '',
      cliente: o.cliente || '',
      valorHora:
        o.valorHora !== undefined && o.valorHora !== null
          ? String(o.valorHora)
          : String(pricing?.valorHora || 25),
      custoMateriais: String(o.custoMateriais || ''),
      materiaisUsados: o.materiaisUsados || [],
      horasTrabalho: String(o.horasTrabalho || ''),
      custosExtras: String(o.custosExtras || ''),
      margemLucro: String(o.margemLucro ?? 100),
      precoManual: o.precoManual ? String(o.precoManual) : '',
      observacoes: o.observacoes || '',
    });
    setEditandoOrcamentoId(o.id);
    setModalOrcamentoAberto(true);
  }

  function fecharModalOrcamento() {
    setModalOrcamentoAberto(false);
    setEditandoOrcamentoId(null);
    setOrcamento(ORCAMENTO_VAZIO);
  }

  async function handleExcluirOrcamento(id, nome) {
    const ok = await confirmar({
      titulo: 'Excluir orçamento?',
      mensagem: `Quer mesmo excluir "${nome}" do histórico?`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeOrcamento(id);
      notificar('Orçamento excluído', 'sucesso');
    }
  }

  function handleSubmitInsumo(e) {
    e.preventDefault();
    if (!novoInsumo.nome.trim() || !novoInsumo.precoPacote) {
      notificar('Preencha nome e preço', 'aviso');
      return;
    }

    const dados = {
      nome: novoInsumo.nome.trim(),
      precoPacote: parseFloat(novoInsumo.precoPacote) || 0,
      quantidadePacote: parseFloat(novoInsumo.quantidadePacote) || 1,
      unidade: novoInsumo.unidade.trim() || 'un',
    };

    if (editandoInsumoId) {
      updateInsumo(editandoInsumoId, dados);
      notificar('Material atualizado!', 'sucesso');
    } else {
      addInsumo(dados);
      notificar('Material cadastrado!', 'sucesso');
    }

    setNovoInsumo(INSUMO_VAZIO);
    setEditandoInsumoId(null);
  }

  function handleEditarInsumo(insumo) {
    setNovoInsumo({
      nome: insumo.nome,
      precoPacote: String(insumo.precoPacote || insumo.preco || ''),
      quantidadePacote: String(insumo.quantidadePacote || 1),
      unidade: insumo.unidade || 'un',
    });
    setEditandoInsumoId(insumo.id);
  }

  async function handleExcluirInsumo(id, nome) {
    const ok = await confirmar({
      titulo: 'Excluir material?',
      mensagem: `Quer mesmo excluir "${nome}"?`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeInsumo(id);
      notificar('Material excluído', 'sucesso');
    }
  }

  function handleSubmitCustoFixo(e) {
    e.preventDefault();
    if (!novoCustoFixo.nome.trim() || !novoCustoFixo.valor) {
      notificar('Preencha nome e valor', 'aviso');
      return;
    }
    addCustoFixo({
      nome: novoCustoFixo.nome.trim(),
      valor: parseFloat(novoCustoFixo.valor) || 0,
    });
    setNovoCustoFixo(CUSTO_FIXO_VAZIO);
    notificar('Custo fixo adicionado!', 'sucesso');
  }

  async function handleExcluirCustoFixo(id, nome) {
    const ok = await confirmar({
      titulo: 'Excluir custo fixo?',
      mensagem: `Quer mesmo excluir "${nome}"?`,
      textoConfirmar: 'Excluir',
      textoCancelar: 'Cancelar',
      perigo: true,
    });
    if (ok) {
      removeCustoFixo(id);
      notificar('Custo fixo excluído', 'sucesso');
    }
  }

  function handleSalvarHorasMes() {
    const valor = parseFloat(horasPorMesInput);
    if (!valor || valor <= 0) {
      notificar('Digite um valor válido', 'aviso');
      return;
    }
    atualizarCustosFixos({ horasPorMes: valor });
    notificar('Horas por mês atualizadas!', 'sucesso');
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

  function SelectorMateriais({ target, materiaisUsados, onAdd, onChange, onRemove }) {
    return (
      <div className="admin-materiais">
        <div className="admin-materiais-head">
          <span>Materiais usados</span>
          <select
            className="admin-materiais-select"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onAdd(target, e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="">
              {insumos.length === 0
                ? '+ Cadastre materiais na aba Insumos'
                : '+ Adicionar material'}
            </option>
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome} · R$ {precoUnitario(i).toFixed(4)}/{i.unidade}
              </option>
            ))}
          </select>
        </div>

        {materiaisUsados && materiaisUsados.length > 0 && (
          <div className="admin-materiais-list">
            {materiaisUsados.map((m, idx) => {
              const insumo = insumos.find((i) => i.id === m.insumoId);
              if (!insumo) return null;
              const unit = precoUnitario(insumo);
              const subtotal = unit * (parseFloat(m.quantidade) || 0);

              return (
                <div key={idx} className="admin-material-item">
                  <div className="admin-material-info">
                    <strong>{insumo.nome}</strong>
                    <small>
                      R$ {unit.toFixed(4)} / {insumo.unidade}
                    </small>
                  </div>

                  <div className="admin-material-qtd">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={m.quantidade}
                      onChange={(e) =>
                        onChange(target, idx, 'quantidade', e.target.value)
                      }
                    />
                    <span className="admin-material-unidade">{insumo.unidade}</span>
                    <span className="admin-material-subtotal">
                      R$ {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-material-remove"
                    onClick={() => onRemove(target, idx)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
            <p>Gerencie produtos, materiais, categorias e orçamentos</p>
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

        <div className="admin-tabs">
          <button
            className={`admin-tab ${abaAtiva === 'produtos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('produtos')}
          >
            📦 Produtos
            <span className="admin-tab-count">{products.length}</span>
          </button>
          <button
            className={`admin-tab ${abaAtiva === 'insumos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('insumos')}
          >
            🧾 Insumos
            <span className="admin-tab-count">{insumos.length}</span>
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

                  <div className="admin-pricing-section">
                    <h3>💵 Precificação (só você vê)</h3>
                    <p className="admin-pricing-subtitle">
                      Preencha os custos e o sistema calcula o preço justo.
                    </p>

                    <SelectorMateriais
                      target="produto"
                      materiaisUsados={form.materiaisUsados}
                      onAdd={handleAddMaterialUsado}
                      onChange={handleChangeMaterialUsado}
                      onRemove={handleRemoveMaterialUsado}
                    />

                    <div className="admin-grid">
                      <label className="admin-field">
                        <span>Custo extra manual (R$)</span>
                        <input
                          type="number"
                          step="0.01"
                          name="custoMateriais"
                          value={form.custoMateriais}
                          onChange={handleChange}
                          placeholder="Algo que não está na lista"
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

                    {(form.custoMateriais ||
                      form.horasTrabalho ||
                      form.custosExtras ||
                      (form.materiaisUsados && form.materiaisUsados.length > 0)) && (
                      <div className="admin-pricing-preview">
                        {calcProduto.custoInsumos > 0 && (
                          <div className="admin-pricing-preview-row">
                            <span>🧾 Materiais</span>
                            <strong>R$ {calcProduto.custoInsumos.toFixed(2)}</strong>
                          </div>
                        )}
                        {calcProduto.custoManual > 0 && (
                          <div className="admin-pricing-preview-row">
                            <span>Custo manual</span>
                            <strong>R$ {calcProduto.custoManual.toFixed(2)}</strong>
                          </div>
                        )}
                        <div className="admin-pricing-preview-row">
                          <span>
                            Mão de obra ({form.horasTrabalho || 0}h × R${' '}
                            {calcProduto.valorHora.toFixed(2)}
                            {calcProduto.custoFixoPorHora > 0 && (
                              <small>
                                {' '}· inclui R$ {calcProduto.custoFixoPorHora.toFixed(2)}/h fixo
                              </small>
                            )}
                            )
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

        {abaAtiva === 'insumos' && (
          <>
            <section className="admin-form-section admin-custosfixos-section">
              <h2>🏠 Custos fixos mensais</h2>
              <p className="admin-hint">
                Cadastre seus custos fixos (energia, internet, aluguel...) e
                quantas horas você trabalha por mês. O sistema vai dividir e
                incluir automaticamente no valor da sua hora.
              </p>

              <form className="admin-cat-add" onSubmit={handleSubmitCustoFixo}>
                <input
                  type="text"
                  placeholder="Nome (ex: Energia)"
                  value={novoCustoFixo.nome}
                  onChange={(e) =>
                    setNovoCustoFixo((prev) => ({ ...prev, nome: e.target.value }))
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="R$ valor"
                  value={novoCustoFixo.valor}
                  onChange={(e) =>
                    setNovoCustoFixo((prev) => ({ ...prev, valor: e.target.value }))
                  }
                  style={{ maxWidth: 140 }}
                />
                <button type="submit" className="admin-btn-primary">
                  ➕ Adicionar
                </button>
              </form>

              {custosFixos.itens.length > 0 && (
                <div className="admin-custosfixos-list">
                  {custosFixos.itens.map((item) => (
                    <div key={item.id} className="admin-custofixo-item">
                      <span className="admin-custofixo-nome">{item.nome}</span>
                      <span className="admin-custofixo-valor">
                        R$ {parseFloat(item.valor).toFixed(2)}
                      </span>
                      <button
                        className="admin-cat-remove"
                        onClick={() => handleExcluirCustoFixo(item.id, item.nome)}
                        title="Excluir"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-custosfixos-resumo">
                <div className="admin-custosfixos-row">
                  <label>
                    <span>Horas trabalhadas por mês</span>
                    <input
                      type="number"
                      step="1"
                      value={horasPorMesInput}
                      onChange={(e) => setHorasPorMesInput(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn-secundario"
                    onClick={handleSalvarHorasMes}
                  >
                    💾 Salvar
                  </button>
                </div>

                <div className="admin-custosfixos-total">
                  <div>
                    <span>Custo fixo total/mês</span>
                    <strong>R$ {custoFixoTotal.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Custo fixo por hora</span>
                    <strong className="admin-custofixo-hora">
                      R$ {custoFixoPorHora.toFixed(2)}/h
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="admin-form-section">
              <h2>🧾 Materiais / Insumos</h2>
              <p className="admin-hint">
                Cadastre o preço da <strong>embalagem fechada</strong> e a
                quantidade que vem. O sistema calcula o preço unitário
                automaticamente.
                <br />
                <strong>Exemplo:</strong> Sulfite R$ 25,00 / 500 folhas → sai
                R$ 0,05 por folha.
              </p>

              <form className="admin-insumo-form" onSubmit={handleSubmitInsumo}>
                <input
                  type="text"
                  placeholder="Nome (ex: Sulfite A4)"
                  value={novoInsumo.nome}
                  onChange={(e) =>
                    setNovoInsumo((prev) => ({ ...prev, nome: e.target.value }))
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço da embalagem (R$)"
                  value={novoInsumo.precoPacote}
                  onChange={(e) =>
                    setNovoInsumo((prev) => ({ ...prev, precoPacote: e.target.value }))
                  }
                />
                <input
                  type="number"
                  step="1"
                  placeholder="Qtd por embalagem (ex: 500)"
                  value={novoInsumo.quantidadePacote}
                  onChange={(e) =>
                    setNovoInsumo((prev) => ({ ...prev, quantidadePacote: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Unidade (folha, un, m...)"
                  value={novoInsumo.unidade}
                  onChange={(e) =>
                    setNovoInsumo((prev) => ({ ...prev, unidade: e.target.value }))
                  }
                  style={{ maxWidth: 160 }}
                />
                <button type="submit" className="admin-btn-primary">
                  {editandoInsumoId ? '💾 Salvar' : '➕ Adicionar'}
                </button>
                {editandoInsumoId && (
                  <button
                    type="button"
                    className="admin-btn-secundario"
                    onClick={() => {
                      setNovoInsumo(INSUMO_VAZIO);
                      setEditandoInsumoId(null);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </form>

              {novoInsumo.precoPacote && novoInsumo.quantidadePacote && (
                <div className="admin-insumo-preview">
                  💡 Preço unitário:{' '}
                  <strong>
                    R${' '}
                    {(
                      (parseFloat(novoInsumo.precoPacote) || 0) /
                      (parseFloat(novoInsumo.quantidadePacote) || 1)
                    ).toFixed(4)}{' '}
                    por {novoInsumo.unidade || 'un'}
                  </strong>
                </div>
              )}

              {insumos.length === 0 ? (
                <p className="admin-vazio">Nenhum material cadastrado ainda 😢</p>
              ) : (
                <div className="admin-insumos-lista">
                  {insumos.map((i) => {
                    const unit = precoUnitario(i);
                    return (
                      <div key={i.id} className="admin-insumo-item">
                        <div className="admin-insumo-info">
                          <strong>{i.nome}</strong>
                          <span className="admin-insumo-detalhe">
                            R$ {parseFloat(i.precoPacote || 0).toFixed(2)} /{' '}
                            {i.quantidadePacote} {i.unidade}
                          </span>
                          <span className="admin-insumo-unitario">
                            = R$ {unit.toFixed(4)} / {i.unidade}
                          </span>
                        </div>
                        <div className="admin-item-acoes">
                          <button
                            className="admin-btn-editar"
                            onClick={() => handleEditarInsumo(i)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="admin-btn-excluir"
                            onClick={() => handleExcluirInsumo(i.id, i.nome)}
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

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

        {abaAtiva === 'precificacao' && (
          <>
            <div className="admin-precificacao-grid">
              <section className="admin-form-section admin-orcamento-section">
                <h2>🧮 Calculadora de orçamento</h2>
                <p className="admin-hint">
                  Precifique um pedido personalizado, uma encomenda, um kit...
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
                  </div>

                  <SelectorMateriais
                    target="orcamento"
                    materiaisUsados={orcamento.materiaisUsados}
                    onAdd={handleAddMaterialUsado}
                    onChange={handleChangeMaterialUsado}
                    onRemove={handleRemoveMaterialUsado}
                  />

                  <div className="admin-grid">
                    <label className="admin-field">
                      <span>Valor da sua hora (R$)</span>
                      <input
                        type="number"
                        step="0.01"
                        name="valorHora"
                        value={orcamento.valorHora}
                        onChange={handleChangeOrcamento}
                        placeholder="Ex: 25.00"
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
                      <span>Custo extra manual (R$)</span>
                      <input
                        type="number"
                        step="0.01"
                        name="custoMateriais"
                        value={orcamento.custoMateriais}
                        onChange={handleChangeOrcamento}
                        placeholder="Algo que não está na lista"
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
                    orcamento.custosExtras ||
                    (orcamento.materiaisUsados &&
                      orcamento.materiaisUsados.length > 0)) && (
                    <div className="admin-pricing-preview">
                      {calcOrcamento.custoInsumos > 0 && (
                        <div className="admin-pricing-preview-row">
                          <span>🧾 Materiais</span>
                          <strong>R$ {calcOrcamento.custoInsumos.toFixed(2)}</strong>
                        </div>
                      )}
                      {calcOrcamento.custoManual > 0 && (
                        <div className="admin-pricing-preview-row">
                          <span>Custo manual</span>
                          <strong>R$ {calcOrcamento.custoManual.toFixed(2)}</strong>
                        </div>
                      )}
                      <div className="admin-pricing-preview-row">
                        <span>
                          Mão de obra ({orcamento.horasTrabalho || 0}h × R${' '}
                          {calcOrcamento.valorHora.toFixed(2)}
                          {calcOrcamento.custoFixoPorHora > 0 && (
                            <small>
                              {' '}· inclui R$ {calcOrcamento.custoFixoPorHora.toFixed(2)}/h fixo
                            </small>
                          )}
                          )
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

              <section className="admin-form-section admin-calc-section">
                <h2>🖩 Calculadora rápida</h2>
                <p className="admin-hint">
                  Faça contas rápidas antes de preencher o orçamento.
                </p>
                <Calculadora />
              </section>
            </div>

            <section className="admin-lista-section">
              <div className="admin-lista-head">
                <h2>📋 Orçamentos salvos ({orcamentos.length})</h2>
              </div>

              {orcamentos.length === 0 ? (
                <p className="admin-vazio">Nenhum orçamento salvo ainda 😢</p>
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
                        {o.valorHora > 0 && (
                          <span className="admin-orcamento-valorhora">
                            ⏱️ R$ {o.valorHora.toFixed(2)}/h ·{' '}
                            {o.horasTrabalho || 0}h
                          </span>
                        )}
                        {o.observacoes && (
                          <span className="admin-orcamento-obs">
                            📝 {o.observacoes}
                          </span>
                        )}
                        <span className="admin-orcamento-data">
                          🕐 {formatarData(o.criadoEm)}
                          {o.atualizadoEm && (
                            <> · editado {formatarData(o.atualizadoEm)}</>
                          )}
                        </span>
                      </div>

                      <div className="admin-item-acoes">
                        <button
                          className="admin-btn-editar"
                          onClick={() => handleEditarOrcamento(o)}
                          title="Editar"
                        >
                          ✏️
                        </button>
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

      {modalOrcamentoAberto && (
        <div className="orcamento-modal-overlay" onClick={fecharModalOrcamento}>
          <div className="orcamento-modal" onClick={(e) => e.stopPropagation()}>
            <div className="orcamento-modal-head">
              <div>
                <span className="orcamento-modal-badge">✏️ Editando</span>
                <h2>{orcamento.nome || 'Editar orçamento'}</h2>
                {orcamento.cliente && (
                  <p className="orcamento-modal-cliente">
                    👤 {orcamento.cliente}
                  </p>
                )}
              </div>
              <button
                className="orcamento-modal-close"
                onClick={fecharModalOrcamento}
                title="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="orcamento-modal-body">
              <form className="admin-form" onSubmit={handleSalvarOrcamento}>
                <div className="admin-grid">
                  <label className="admin-field">
                    <span>Nome do item/projeto *</span>
                    <input
                      type="text"
                      name="nome"
                      value={orcamento.nome}
                      onChange={handleChangeOrcamento}
                    />
                  </label>

                  <label className="admin-field">
                    <span>Cliente (opcional)</span>
                    <input
                      type="text"
                      name="cliente"
                      value={orcamento.cliente}
                      onChange={handleChangeOrcamento}
                    />
                  </label>
                </div>

                <SelectorMateriais
                  target="orcamento"
                  materiaisUsados={orcamento.materiaisUsados}
                  onAdd={handleAddMaterialUsado}
                  onChange={handleChangeMaterialUsado}
                  onRemove={handleRemoveMaterialUsado}
                />

                <div className="admin-grid">
                  <label className="admin-field">
                    <span>Valor da sua hora (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="valorHora"
                      value={orcamento.valorHora}
                      onChange={handleChangeOrcamento}
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
                    />
                  </label>

                  <label className="admin-field">
                    <span>Custo extra manual (R$)</span>
                    <input
                      type="number"
                      step="0.01"
                      name="custoMateriais"
                      value={orcamento.custoMateriais}
                      onChange={handleChangeOrcamento}
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
                    />
                  </label>

                  <label className="admin-field admin-field-wide">
                    <span>Observações</span>
                    <textarea
                      rows="2"
                      name="observacoes"
                      value={orcamento.observacoes}
                      onChange={handleChangeOrcamento}
                    />
                  </label>
                </div>

                {(orcamento.custoMateriais ||
                  orcamento.horasTrabalho ||
                  orcamento.custosExtras ||
                  (orcamento.materiaisUsados &&
                    orcamento.materiaisUsados.length > 0)) && (
                  <div className="admin-pricing-preview">
                    {calcOrcamento.custoInsumos > 0 && (
                      <div className="admin-pricing-preview-row">
                        <span>🧾 Materiais</span>
                        <strong>R$ {calcOrcamento.custoInsumos.toFixed(2)}</strong>
                      </div>
                    )}
                    {calcOrcamento.custoManual > 0 && (
                      <div className="admin-pricing-preview-row">
                        <span>Custo manual</span>
                        <strong>R$ {calcOrcamento.custoManual.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className="admin-pricing-preview-row">
                      <span>
                        Mão de obra ({orcamento.horasTrabalho || 0}h × R${' '}
                        {calcOrcamento.valorHora.toFixed(2)}
                        {calcOrcamento.custoFixoPorHora > 0 && (
                          <small>
                            {' '}· inclui R$ {calcOrcamento.custoFixoPorHora.toFixed(2)}/h fixo
                          </small>
                        )}
                        )
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
                    💾 Salvar alterações
                  </button>
                  <button
                    type="button"
                    className="admin-btn-secundario"
                    onClick={fecharModalOrcamento}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}