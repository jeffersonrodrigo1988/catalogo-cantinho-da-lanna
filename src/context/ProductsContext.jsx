import { createContext, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../utils/tauri';
import { carregarProdutosDoGithub } from '../utils/github';

const ProductsContext = createContext(null);

const PRICING_PADRAO = {
  valorHora: 25,
};

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [pricing, setPricing] = useState(PRICING_PADRAO);
  const [orcamentos, setOrcamentos] = useState([]);
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
        } else if (dados && typeof dados === 'object') {
          setProducts(dados.products || []);
          setCustomCategories(dados.categories || []);
          setPricing({ ...PRICING_PADRAO, ...(dados.pricing || {}) });
          setOrcamentos(dados.orcamentos || []);
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
    novosOrcamentos
  ) {
    if (!isTauri()) return;
    try {
      const dados = {
        categories: novasCategorias,
        pricing: novoPricing,
        products: novosProdutos,
        orcamentos: novosOrcamentos,
      };
      const jsonStr = JSON.stringify(dados, null, 2);
      await invoke('salvar_produtos_github', { produtosJson: jsonStr });
      console.log('✅ Sincronizado!');
    } catch (err) {
      console.error('❌ Erro ao sincronizar:', err);
      alert('Erro ao salvar: ' + err);
    }
  }

  // === PRODUTOS ===
  function addProduct(product) {
    const novo = { ...product, id: String(Date.now()) };
    const lista = [...products, novo];
    setProducts(lista);
    sincronizar(lista, customCategories, pricing, orcamentos);
  }

  function updateProduct(id, product) {
    const lista = products.map((p) => (p.id === id ? { ...product, id } : p));
    setProducts(lista);
    sincronizar(lista, customCategories, pricing, orcamentos);
  }

  function removeProduct(id) {
    const lista = products.filter((p) => p.id !== id);
    setProducts(lista);
    sincronizar(lista, customCategories, pricing, orcamentos);
  }

  // === CATEGORIAS ===
  function addCategory(nome) {
    const limpo = nome.trim();
    if (!limpo) return;
    if (customCategories.includes(limpo)) return;
    const lista = [...customCategories, limpo];
    setCustomCategories(lista);
    sincronizar(products, lista, pricing, orcamentos);
  }

  function removeCategory(nome) {
    const lista = customCategories.filter((c) => c !== nome);
    setCustomCategories(lista);
    sincronizar(products, lista, pricing, orcamentos);
  }

  // === PRICING ===
  function atualizarPricing(novoPricing) {
    const atualizado = { ...pricing, ...novoPricing };
    setPricing(atualizado);
    sincronizar(products, customCategories, atualizado, orcamentos);
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
    sincronizar(products, customCategories, pricing, lista);
    return novo;
  }

  function removeOrcamento(id) {
    const lista = orcamentos.filter((o) => o.id !== id);
    setOrcamentos(lista);
    sincronizar(products, customCategories, pricing, lista);
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
        loading,
        addProduct,
        updateProduct,
        removeProduct,
        addCategory,
        removeCategory,
        atualizarPricing,
        addOrcamento,
        removeOrcamento,
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