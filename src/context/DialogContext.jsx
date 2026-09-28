import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog } from '../components/Dialog/Dialog';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);

  const confirmar = useCallback((opcoes) => {
    return new Promise((resolve) => {
      setConfirmState({
        titulo: opcoes.titulo || 'Confirmar',
        mensagem: opcoes.mensagem || 'Tem certeza?',
        textoConfirmar: opcoes.textoConfirmar || 'Confirmar',
        textoCancelar: opcoes.textoCancelar || 'Cancelar',
        perigo: opcoes.perigo || false,
        icone: opcoes.icone,
        resolve,
      });
    });
  }, []);

  const resolverConfirm = useCallback(
    (valor) => {
      if (confirmState) {
        confirmState.resolve(valor);
        setConfirmState(null);
      }
    },
    [confirmState]
  );

  const notificar = useCallback((mensagem, tipo = 'sucesso') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <DialogContext.Provider value={{ confirmar, notificar }}>
      {children}
      <Dialog
        confirmState={confirmState}
        onResolve={resolverConfirm}
        toasts={toasts}
        onRemoverToast={removerToast}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog precisa estar dentro de <DialogProvider>');
  return ctx;
}