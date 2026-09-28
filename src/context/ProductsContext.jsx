import { createContext, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../utils/tauri';
import { carregarProdutosDoGithub } from '../utils/github';

const ProductsContext = createContext(null);

const PRICING_PADRAO = {
  valorHora: 25,
};

const CUSTOS_FIXOS_PADRAO = {
  itens: [],
  horasPorMes: 160,
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [pricing, setPricing] = useState(PRICING_PADRAO);
  const [orcamentos, setOrcamentos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [custosFixos, setCustosFixos] = useState(CUSTOS_FIXOS_PADRAO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        let dados;
        if (isTauri()) {
          const jsonStr = await invoke('carregar_produtos_github');
          dados = JSON.parse(jsonStr);
        } else {
          dados = await carregarProdutosDoGithub();
        }

        if (Array.isArray(dados)) {
          setProducts(dados);
          setCustomCategories([]);
          setPricing(PRICING_PADRAO);
          setOrcamentos([]);
          setInsumos([]);
          setCustosFixos(CUSTOS_FIXOS_PADRAO);
        } else if (dados && typeof dados === 'object') {
          setProducts(dados.products || []);
          setCustomCategories(dados.categories || []);
          setPricing({ ...PRICING_PADRAO, ...(dados.pricing || {}) });
          setOrcamentos(dados.orcamentos || []);
          setInsumos(dados.insumos || []);
          setCustosFixos({ ...CUSTOS_FIXOS_PADRAO, ...(dados.custosFixos || {}) });
        }
      } catch (err) {
        console.error('Erro ao carregar:', err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  async function sincronizar(
    novosProdutos,
    novasCategorias,
    novoPricing,
    novosOrcamentos,
    novosInsumos,
    novosCustosFixos
  ) {
    if (!isTauri()) return;
    try {
      const dados = {
        categories: novasCategorias,
        pricing: novoPricing,
        products: novosProdutos,
        orcamentos: novosOrcamentos,
        insumos: novosInsumos,
        custosFixos: novosCustosFixos,
      };
      const jsonStr = JSON.stringify(dados, null, 2);
      await invoke('salvar_produtos_github', { produtosJson: jsonStr });
      console.log('✅ Sincronizado!');
    } catch (err) {
      console.error('❌ Erro ao sincronizar:', err);
      alert('Erro ao salvar: ' + err);
    }
  }

  function sync(overrides = {}) {
    sincronizar(
      overrides.products ?? products,
      overrides.categories ?? customCategories,
      overrides.pricing ?? pricing,
      overrides.orcamentos ?? orcamentos,
      overrides.insumos ?? insumos,
      overrides.custosFixos ?? custosFixos
    );
  }

  // === PRODUTOS ===
  function addProduct(product) {
    const novo = { ...product, id: String(Date.now()) };
    setProducts([...products, novo]);
    sync({ products: [...products, novo] });
  }

  function updateProduct(id, product) {
    const lista = products.map((p) => (p.id === id ? { ...product, id } : p));
    setProducts(lista);
    sync({ products: lista });
  }

  function removeProduct(id) {
    const lista = products.filter((p) => p.id !== id);
    setProducts(lista);
    sync({ products: lista });
  }

  // === CATEGORIAS ===
  function addCategory(nome) {
    const limpo = nome.trim();
    if (!limpo || customCategories.includes(limpo)) return;
    const lista = [...customCategories, limpo];
    setCustomCategories(lista);
    sync({ categories: lista });
  }

  function removeCategory(nome) {
    const lista = customCategories.filter((c) => c !== nome);
    setCustomCategories(lista);
    sync({ categories: lista });
  }

  // === PRICING ===
  function atualizarPricing(novoPricing) {
    const atualizado = { ...pricing, ...novoPricing };
    setPricing(atualizado);
    sync({ pricing: atualizado });
  }

  // === ORÇAMENTOS ===
  function addOrcamento(orcamento) {
    const novo = {
      ...orcamento,
      id: String(Date.now()),
      criadoEm: new Date().toISOString(),
    };
    const lista = [novo, ...orcamentos];
    setOrcamentos(lista);
    sync({ orcamentos: lista });
    return novo;
  }

  function updateOrcamento(id, orcamento) {
    const lista = orcamentos.map((o) =>
      o.id === id
        ? { ...o, ...orcamento, id, atualizadoEm: new Date().toISOString() }
        : o
    );
    setOrcamentos(lista);
    sync({ orcamentos: lista });
  }

  function removeOrcamento(id) {
    const lista = orcamentos.filter((o) => o.id !== id);
    setOrcamentos(lista);
    sync({ orcamentos: lista });
  }

  // === INSUMOS (materiais) ===
  function addInsumo(insumo) {
    const novo = { ...insumo, id: String(Date.now()) };
    const lista = [...insumos, novo];
    setInsumos(lista);
    sync({ insumos: lista });
    return novo;
  }

  function updateInsumo(id, insumo) {
    const lista = insumos.map((i) => (i.id === id ? { ...insumo, id } : i));
    setInsumos(lista);
    sync({ insumos: lista });
  }

  function removeInsumo(id) {
    const lista = insumos.filter((i) => i.id !== id);
    setInsumos(lista);
    sync({ insumos: lista });
  }

  // === CUSTOS FIXOS ===
  function atualizarCustosFixos(novos) {
    const atualizado = { ...custosFixos, ...novos };
    setCustosFixos(atualizado);
    sync({ custosFixos: atualizado });
  }

  function addCustoFixo(item) {
    const itens = [...custosFixos.itens, { ...item, id: String(Date.now()) }];
    atualizarCustosFixos({ itens });
  }

  function removeCustoFixo(id) {
    const itens = custosFixos.itens.filter((i) => i.id !== id);
    atualizarCustosFixos({ itens });
  }

  const categoriesFromProducts = products.map((p) => p.category).filter(Boolean);
  const todasCategorias = [...new Set([...customCategories, ...categoriesFromProducts])].sort();
  const categories = ['Todos', ...todasCategorias];

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        customCategories,
        pricing,
        orcamentos,
        insumos,
        custosFixos,
        loading,
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
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts precisa estar dentro de <ProductsProvider>');
  return ctx;
}