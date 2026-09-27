import { createContext, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '../utils/tauri';
import { carregarProdutosDoGithub } from '../utils/github';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        if (isTauri()) {
          // Se estiver no app do PC (Tauri), usa o comando Rust
          const jsonStr = await invoke('carregar_produtos_github');
          setProducts(JSON.parse(jsonStr));
        } else {
          // Se estiver no navegador/site, lê direto do GitHub via fetch
          const lista = await carregarProdutosDoGithub();
          setProducts(lista);
        }
      } catch (err) {
        console.error('❌ Erro ao carregar produtos:', err);
        setErro(err.message || String(err));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  async function sincronizar(lista) {
    if (!isTauri()) return; // Só sincroniza no app do PC
    try {
      const jsonStr = JSON.stringify(lista, null, 2);
      await invoke('salvar_produtos_github', { produtosJson: jsonStr });
      console.log('✅ Produtos sincronizados com o GitHub!');
    } catch (err) {
      console.error('❌ Erro ao sincronizar:', err);
      alert('Erro ao salvar no GitHub: ' + err);
    }
  }

  function addProduct(product) {
    const novoProduto = { ...product, id: String(Date.now()) };
    const novaLista = [...products, novoProduto];
    setProducts(novaLista);
    sincronizar(novaLista);
  }

  function updateProduct(id, product) {
    const novaLista = products.map((p) => (p.id === id ? { ...product, id } : p));
    setProducts(novaLista);
    sincronizar(novaLista);
  }

  function removeProduct(id) {
    const novaLista = products.filter((p) => p.id !== id);
    setProducts(novaLista);
    sincronizar(novaLista);
  }

  const categories = ['Todos', ...new Set(products.map((p) => p.category))];

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        loading,
        erro,
        addProduct,
        updateProduct,
        removeProduct,
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