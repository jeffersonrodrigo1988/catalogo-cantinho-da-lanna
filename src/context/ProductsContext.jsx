import { createContext, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../utils/tauri';
import { carregarProdutosDoGithub } from '../utils/github';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
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

        // Compatível com formato antigo (array) e novo (objeto)
        if (Array.isArray(dados)) {
          setProducts(dados);
          setCustomCategories([]);
        } else if (dados && typeof dados === 'object') {
          setProducts(dados.products || []);
          setCustomCategories(dados.categories || []);
        }
      } catch (err) {
        console.error('Erro ao carregar:', err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  async function sincronizar(novosProdutos, novasCategorias) {
    if (!isTauri()) return;
    try {
      const dados = {
        categories: novasCategorias,
        products: novosProdutos,
      };
      const jsonStr = JSON.stringify(dados, null, 2);
      await invoke('salvar_produtos_github', { produtosJson: jsonStr });
      console.log('✅ Sincronizado!');
    } catch (err) {
      console.error('❌ Erro ao sincronizar:', err);
      alert('Erro ao salvar: ' + err);
    }
  }

  function addProduct(product) {
    const novo = { ...product, id: String(Date.now()) };
    const lista = [...products, novo];
    setProducts(lista);
    sincronizar(lista, customCategories);
  }

  function updateProduct(id, product) {
    const lista = products.map((p) => (p.id === id ? { ...product, id } : p));
    setProducts(lista);
    sincronizar(lista, customCategories);
  }

  function removeProduct(id) {
    const lista = products.filter((p) => p.id !== id);
    setProducts(lista);
    sincronizar(lista, customCategories);
  }

  function addCategory(nome) {
    const limpo = nome.trim();
    if (!limpo) return;
    if (customCategories.includes(limpo)) return;
    const lista = [...customCategories, limpo];
    setCustomCategories(lista);
    sincronizar(products, lista);
  }

  function removeCategory(nome) {
    const lista = customCategories.filter((c) => c !== nome);
    setCustomCategories(lista);
    sincronizar(products, lista);
  }

  // Categorias finais = custom + derivadas dos produtos
  const categoriesFromProducts = products.map((p) => p.category).filter(Boolean);
  const todasCategorias = [...new Set([...customCategories, ...categoriesFromProducts])].sort();
  const categories = ['Todos', ...todasCategorias];

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        customCategories,
        loading,
        addProduct,
        updateProduct,
        removeProduct,
        addCategory,
        removeCategory,
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