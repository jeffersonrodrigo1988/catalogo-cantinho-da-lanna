import './Dialog.css';

export function Dialog({ confirmState, onResolve, toasts, onRemoverToast }) {
  return (
    <>
      {/* Modal de confirmação */}
      {confirmState && (
        <div className="dialog-overlay" onClick={() => onResolve(false)}>
          <div
            className={`dialog-box ${confirmState.perigo ? 'dialog-box-perigo' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`dialog-icon ${confirmState.perigo ? 'perigo' : ''}`}>
              {confirmState.icone || (confirmState.perigo ? '⚠️' : '❓')}
            </div>

            <h2 className="dialog-titulo">{confirmState.titulo}</h2>
            <p className="dialog-mensagem">{confirmState.mensagem}</p>

            <div className="dialog-actions">
              <button
                className="dialog-btn-cancelar"
                onClick={() => onResolve(false)}
              >
                {confirmState.textoCancelar}
              </button>
              <button
                className={`dialog-btn-confirmar ${
                  confirmState.perigo ? 'perigo' : ''
                }`}
                onClick={() => onResolve(true)}
                autoFocus
              >
                {confirmState.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.tipo}`}
            onClick={() => onRemoverToast(t.id)}
          >
            <span className="toast-icone">
              {t.tipo === 'sucesso' && '✅'}
              {t.tipo === 'erro' && '❌'}
              {t.tipo === 'aviso' && '⚠️'}
              {t.tipo === 'info' && 'ℹ️'}
            </span>
            <span className="toast-mensagem">{t.mensagem}</span>
          </div>
        ))}
      </div>
    </>
  );
}