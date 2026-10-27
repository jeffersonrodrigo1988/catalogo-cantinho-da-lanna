import { createContext, useContext, useState, useEffect } from 'react';

const ClientsContext = createContext(null);

export function ClientsProvider({ children }) {
  // Carrega dados salvos do localStorage
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('cantinho_clients');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cantinho_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      return [];
    }
  });

  // Salva automaticamente quando os dados mudam
  useEffect(() => {
    try {
      localStorage.setItem('cantinho_clients', JSON.stringify(clients));
      console.log('✅ Clientes salvos:', clients.length);
    } catch (error) {
      console.error('Erro ao salvar clientes:', error);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('cantinho_orders', JSON.stringify(orders));
      console.log('✅ Pedidos salvos:', orders.length);
    } catch (error) {
      console.error('Erro ao salvar pedidos:', error);
    }
  }, [orders]);

  // === CLIENTES ===
  function addClient(client) {
    const novo = { 
      ...client, 
      id: String(Date.now()), 
      createdAt: new Date().toISOString() 
    };
    setClients(prev => {
      const novaLista = [novo, ...prev];
      console.log('➕ Cliente adicionado:', novo.name);
      return novaLista;
    });
    return novo;
  }

  function updateClient(id, clientData) {
    setClients(prev => {
      const novaLista = prev.map(c => 
        c.id === id ? { ...clientData, id, updatedAt: new Date().toISOString() } : c
      );
      console.log('️ Cliente atualizado:', clientData.name);
      return novaLista;
    });
  }

  function removeClient(id) {
    setClients(prev => {
      const novaLista = prev.filter(c => c.id !== id);
      console.log('🗑️ Cliente removido');
      return novaLista;
    });
  }

  // === PEDIDOS ===
  function addOrder(order) {
    const novo = { 
      ...order, 
      id: String(Date.now()), 
      createdAt: new Date().toISOString(), 
      status: 'pending' 
    };
    setOrders(prev => {
      const novaLista = [novo, ...prev];
      console.log('➕ Pedido adicionado:', novo.clientName);
      return novaLista;
    });
    return novo;
  }

  function updateOrder(id, orderData) {
    setOrders(prev => {
      const novaLista = prev.map(o => 
        o.id === id ? { ...o, ...orderData, id, updatedAt: new Date().toISOString() } : o
      );
      console.log('️ Pedido atualizado:', orderData.clientName);
      return novaLista;
    });
  }

  function removeOrder(id) {
    setOrders(prev => {
      const novaLista = prev.filter(o => o.id !== id);
      console.log('️ Pedido removido');
      return novaLista;
    });
  }

  function updateOrderStatus(id, status) {
    setOrders(prev => {
      const novaLista = prev.map(o => 
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      console.log('🔄 Status atualizado:', status);
      return novaLista;
    });
  }

  function getOrdersByClient(clientId) {
    return orders.filter(o => o.clientId === clientId);
  }

  function getPendingOrders() {
    return orders.filter(o => o.status === 'pending' || o.status === 'in-progress');
  }

  // Função para limpar todos os dados (útil para testes)
  function clearAllData() {
    if (window.confirm('Tem certeza que quer apagar TODOS os clientes e pedidos?')) {
      setClients([]);
      setOrders([]);
      localStorage.removeItem('cantinho_clients');
      localStorage.removeItem('cantinho_orders');
      console.log('🗑️ Todos os dados foram apagados');
    }
  }

  return (
    <ClientsContext.Provider value={{
      clients,
      orders,
      addClient,
      updateClient,
      removeClient,
      addOrder,
      updateOrder,
      removeOrder,
      updateOrderStatus,
      getOrdersByClient,
      getPendingOrders,
      clearAllData,
    }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients deve estar dentro de <ClientsProvider>');
  return ctx;
}